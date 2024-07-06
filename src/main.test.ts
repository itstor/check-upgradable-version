import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';

import { getInputs, getPackageJson, setOutputs } from '../src/helper';
import { run } from '../src/main';

jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('../src/helper');

describe('main', () => {
  const mockInputs = {
    owner: 'testOwner',
    repo: 'testRepo',
    packageJsonPath: '.',
    debug: false,
    versionPrefix: 'v',
    includePrefix: true,
    preReleaseSuffixRegex: '-(alpha|beta|rc)\\.',
  };

  const mockPackageJson = {
    version: '1.0.0',
  };

  const mockReleases = [{ tag_name: 'v0.9.0' }, { tag_name: 'v0.8.0-beta' }];

  beforeEach(() => {
    jest.resetAllMocks();
    (getInputs as jest.Mock).mockReturnValue(mockInputs);
    (getPackageJson as jest.Mock).mockReturnValue(mockPackageJson);
    (github.getOctokit as jest.Mock).mockReturnValue({
      rest: {
        repos: {
          listReleases: jest.fn().mockResolvedValue({ data: mockReleases }),
        },
      },
    } as unknown as Octokit);
  });

  it('should set correct outputs when new version is available', async () => {
    await run();

    expect(setOutputs).toHaveBeenCalledWith(
      {
        from_version: 'v0.9.0',
        to_version: 'v1.0.0',
        is_upgradable: true,
        is_prerelease: false,
      },
      false,
    );
  });

  it('should handle prerelease versions correctly', async () => {
    (getInputs as jest.Mock).mockReturnValue({ ...mockInputs, prerelease: true });
    (getPackageJson as jest.Mock).mockReturnValue({ version: '1.0.0-beta.1' });

    await run();

    expect(setOutputs).toHaveBeenCalledWith(
      {
        from_version: 'v0.9.0',
        to_version: 'v1.0.0-beta.1',
        is_upgradable: true,
        is_prerelease: true,
      },
      false,
    );
  });

  it('should handle case when no new version is available', async () => {
    (getPackageJson as jest.Mock).mockReturnValue({ version: '0.9.0-beta' });

    await run();

    expect(setOutputs).toHaveBeenCalledWith(
      {
        from_version: 'v0.9.0',
        to_version: 'v0.9.0-beta',
        is_upgradable: false,
        is_prerelease: false,
      },
      false,
    );
  });

  it('should handle case when no releases are found', async () => {
    (github.getOctokit as jest.Mock).mockReturnValue({
      rest: {
        repos: {
          listReleases: jest.fn().mockResolvedValue({ data: [] }),
        },
      },
    } as unknown as Octokit);

    await run();

    expect(setOutputs).toHaveBeenCalledWith(
      {
        from_version: 'v0.0.0',
        to_version: 'v1.0.0',
        is_upgradable: true,
        is_prerelease: false,
      },
      false,
    );
  });

  it('should handle errors gracefully', async () => {
    (github.getOctokit as jest.Mock).mockReturnValue({
      rest: {
        repos: {
          listReleases: jest.fn().mockRejectedValue(new Error('API Error')),
        },
      },
    } as unknown as Octokit);

    await run();

    expect(core.setFailed).toHaveBeenCalledWith('API Error');
  });

  it('should respect include_prefix input', async () => {
    (getInputs as jest.Mock).mockReturnValue({ ...mockInputs, includePrefix: false });

    await run();

    expect(setOutputs).toHaveBeenCalledWith(
      {
        from_version: '0.9.0',
        to_version: '1.0.0',
        is_upgradable: true,
        is_prerelease: false,
      },
      false,
    );
  });

  it('should respect custom prefix input', async () => {
    (getInputs as jest.Mock).mockReturnValue({ ...mockInputs, versionPrefix: 'version-' });
    (github.getOctokit as jest.Mock).mockReturnValue({
      rest: {
        repos: {
          listReleases: jest.fn().mockResolvedValue({ data: [{ tag_name: 'version-0.9.0' }] }),
        },
      },
    } as unknown as Octokit);

    await run();

    expect(setOutputs).toHaveBeenCalledWith(
      {
        from_version: 'version-0.9.0',
        to_version: 'version-1.0.0',
        is_upgradable: true,
        is_prerelease: false,
      },
      false,
    );
  });

  it('should respect empty prefix input', async () => {
    (getInputs as jest.Mock).mockReturnValue({ ...mockInputs, versionPrefix: '', includePrefix: true });
    (github.getOctokit as jest.Mock).mockReturnValue({
      rest: {
        repos: {
          listReleases: jest.fn().mockResolvedValue({ data: [{ tag_name: '0.9.0' }] }),
        },
      },
    } as unknown as Octokit);

    await run();

    expect(setOutputs).toHaveBeenCalledWith(
      {
        from_version: '0.9.0',
        to_version: '1.0.0',
        is_upgradable: true,
        is_prerelease: false,
      },
      false,
    );
  });
});
