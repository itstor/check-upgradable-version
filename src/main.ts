import * as core from '@actions/core';
import { getOctokit } from '@actions/github';

import { getInputs, getPackageJson, setOutputs } from './helper';
import { Outputs } from './types';

(async function run() {
  try {
    const inputs = getInputs();
    const github = getOctokit(process.env.GITHUB_TOKEN!);

    let releasedVersion = '0.0.0';
    if (inputs.prerelease) {
      const { data: releases } = await github.rest.repos.listReleases({
        owner: inputs.owner,
        repo: inputs.repo,
      });

      const prerelease = releases.find((release) => release.prerelease);
      if (prerelease) {
        releasedVersion = prerelease.tag_name.replace(/^v/, '');
        core.info(`Latest prerelease: ${prerelease.tag_name}`);
      } else {
        core.info('No prerelease found. Using default version 0.0.0');
      }
    } else {
      const { data: release } = await github.rest.repos.getLatestRelease({
        owner: inputs.owner,
        repo: inputs.repo,
      });

      if (release.tag_name) {
        releasedVersion = release.tag_name.replace(/^v/, '');
        core.info(`Latest release: ${release.tag_name}`);
      } else {
        core.info('No release found. Using default version 0.0.0');
      }
    }

    const pkgVersion = getPackageJson(inputs.package_json_path).version;
    if (!pkgVersion) {
      throw Error('Version not found in package.json');
    }
    core.info(`Current version: ${pkgVersion}`);

    if (releasedVersion === pkgVersion) {
      core.info('No new release found');
    } else {
      core.info('New release found');
    }

    const outputs: Outputs = {
      from_version: 'v' + pkgVersion,
      to_version: 'v' + releasedVersion,
      is_upgradable: releasedVersion !== pkgVersion,
    };

    setOutputs(outputs, inputs.debug);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
});
