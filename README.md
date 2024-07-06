# Check Upgradable Version

This GitHub Action checks the version in your `package.json` file and compares it with the latest release version in your GitHub repository. If there's a version change, it can be used to trigger an automatic release.

## Description

The main motivation of this action is to automate the release process whenever there's a change in the `package.json` version. It compares the current version in the `package.json` with the latest release version in the repository and provides outputs indicating whether the package can be upgraded. It supports semantic versioning and can handle prerelease versions.

## Inputs

| Name                      | Description                                                                         | Default                |
| ------------------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| `owner`                   | The owner of the GitHub repository                                                  | Repository owner       |
| `repo`                    | The name of the GitHub repository                                                   | Repository name        |
| `package_json_path`       | The path to the `package.json` file. You can specify this if you are using Monorepo | `.` (root directory)   |
| `debug`                   | Enable debug logging (true/false)                                                   | `false`                |
| `version_prefix`          | The prefix to use for version tag (e.g., 'v')                                       | -                      |
| `include_prefix`          | Whether to include the prefix in the to_version output (true/false)                 | `false`                |
| `prerelease_suffix_regex` | Regex to match prerelease suffixes                                                  | `-(alpha\|beta\|rc)\.` |

## Outputs

| Name            | Description                                                 | Example           |
| --------------- | ----------------------------------------------------------- | ----------------- |
| `from_version`  | The current version from the latest GitHub release          | '1.0.0'           |
| `to_version`    | The version from current package.json version               | '1.0.1'           |
| `is_upgradable` | A boolean indicating if the package can be upgraded         | 'true' or 'false' |
| `is_prerelease` | A boolean indicating if the current version is a prerelease | 'true' or 'false' |

## Example Usage

```yaml
name: Auto Release Workflow

on:
  push:
    branches:
      - main

jobs:
  auto-release:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Check package version
        uses: itstor/check-upgradable-version@v2
        id: check_version
        with:
          version_prefix: 'v'
          include_prefix: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Create release if upgradable
        if: steps.check_version.outputs.is_upgradable == 'true'
        uses: actions/create-release@v2
        with:
          tag_name: ${{ steps.check_version.outputs.to_version }}
          release_name: 'Release ${{ steps.check_version.outputs.to_version }}'
          body: |
            Auto-generated release for version ${{ steps.check_version.outputs.to_version }}
            Upgraded from ${{ steps.check_version.outputs.from_version }}
          draft: false
          prerelease: ${{ steps.check_version.outputs.is_prerelease }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Advanced Usage

### Monorepo Support

If you're using a monorepo structure, you can specify the path to the `package.json` file:

```yaml
- name: Check package version
  uses: itstor/check-upgradable-version@v2
  with:
    package_json_path: './packages/my-package'
```

### Custom Version Prefix

You can specify a custom prefix for your version numbers:

```yaml
- name: Check package version
  uses: itstor/check-upgradable-version@v2
  with:
    version_prefix: 'version-'
    include_prefix: true
```

## Contributing

Contributions to improve this action are welcome. Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
