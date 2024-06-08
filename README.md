# Check Upgradable Version

This GitHub Action checks the version in your `package.json` file and compares it with the latest release version in your GitHub repository. If there's a version change, it can be used to trigger an automatic release.

## Description

The main motivation of this action is to automate the release process whenever there's a change in the `package.json` version. It compares the current version in the `package.json` with the latest release version in the repository and provides outputs indicating whether the package can be upgraded.

## Inputs

| Name                | Description                                                                         | Default              |
| ------------------- | ----------------------------------------------------------------------------------- | -------------------- |
| `owner`             | The owner of the GitHub repository                                                  | Repository owner     |
| `repo`              | The name of the GitHub repository                                                   | Repository name      |
| `package_json_path` | The path to the `package.json` file. You can specify this if you are using Monorepo | `.` (root directory) |
| `prerelease`        | Include pre-releases (true/false)                                                   | `false`              |
| `debug`             | Enable debug logging (true/false)                                                   | `false`              |

## Outputs

| Name            | Description                                         | Example           |
| --------------- | --------------------------------------------------- | ----------------- |
| `from_version`  | The current version from the latest GitHub release  | 'v1.0.0'          |
| `to_version`    | The version from current package.json version.      | 'v1.0.1'          |
| `is_upgradable` | A boolean indicating if the package can be upgraded | 'true' or 'false' |

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
        uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'

      - name: Check package version
        uses: itstor/check-upgradable-version@v1
        id: check_version

      - name: Create release if upgradable
        if: steps.check_version.outputs.is_upgradable == 'true'
        uses: actions/create-release@v1
        with:
          tag_name: ${{ steps.check_version.outputs.from_version }}
          release_name: 'Release ${{ steps.check_version.outputs.from_version }}'
          body: 'Auto-generated release for version ${{ steps.check_version.outputs.from_version }}'
          draft: false
          prerelease: false
```
