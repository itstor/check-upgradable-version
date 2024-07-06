import * as core from '@actions/core';
import { getOctokit } from '@actions/github';
import semver from 'semver';

import { getInputs, getPackageJson, setOutputs } from './helper';
import { Outputs } from './types';

export async function run() {
  try {
    const inputs = getInputs();
    const github = getOctokit(process.env.GITHUB_TOKEN!);

    if (inputs.debug) {
      core.info(`Inputs: ${JSON.stringify(inputs, null, 2)}`);
    }

    const { data: releases } = await github.rest.repos.listReleases({
      owner: inputs.owner,
      repo: inputs.repo,
    });

    const releaseList = inputs.includePreRelease ? releases : releases.filter((release) => !release.prerelease);

    let releasedVersion = '0.0.0';
    if (releaseList.length > 0) {
      const latestRelease = releaseList[0];
      releasedVersion = latestRelease.tag_name.replace(new RegExp(`^${inputs.versionPrefix}`), '');
      core.info(`Latest release: ${latestRelease.tag_name}`);
    } else {
      core.info('No release found. Using default version 0.0.0');
    }

    const pkgVersion = getPackageJson(inputs.packageJsonPath).version;
    if (!pkgVersion) {
      throw Error('Version not found in package.json');
    }
    core.info(`Current version: ${pkgVersion}`);

    const isUpgradable = semver.gt(pkgVersion, releasedVersion);

    if (isUpgradable) {
      core.info('New version found');
      core.info(`Upgradable version: ${inputs.versionPrefix}${releasedVersion} -> ${inputs.versionPrefix}${pkgVersion}`);
    } else {
      core.info('No new version found');
    }

    let toVersion = pkgVersion;
    let fromVersion = releasedVersion;
    if (inputs.includePrefix && inputs.versionPrefix.length > 0) {
      toVersion = inputs.versionPrefix + toVersion;
      fromVersion = inputs.versionPrefix + fromVersion;
    }

    const prereleaseRegex = new RegExp(inputs.preReleaseSuffixRegex);
    const isPrerelease = prereleaseRegex.test(pkgVersion);

    const outputs: Outputs = {
      from_version: fromVersion,
      to_version: toVersion,
      is_upgradable: isUpgradable,
      is_prerelease: isPrerelease,
    };

    setOutputs(outputs, inputs.debug);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }

    core.setFailed('Unknown error');
  }
}

if (require.main === module) {
  run();
}
