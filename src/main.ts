import * as core from '@actions/core';
import { getOctokit } from '@actions/github';

import { getInputs, getPackageJson, setOutputs } from './helper';
import { Outputs } from './types';

(async function run() {
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

    const releaseList = inputs.prerelease ? releases.filter((release) => release.prerelease) : releases;

    let releasedVersion = '0.0.0';

    if (releaseList.length > 0) {
      const latestRelease = releaseList[0];
      releasedVersion = latestRelease.tag_name.replace(/^v/, '');
      core.info(`Latest release: ${latestRelease.tag_name}`);
    } else {
      core.info('No release found. Using default version 0.0.0');
    }

    const pkgVersion = getPackageJson(inputs.package_json_path).version;
    if (!pkgVersion) {
      throw Error('Version not found in package.json');
    }
    core.info(`Current version: ${pkgVersion}`);

    if (releasedVersion === pkgVersion) {
      core.info('No new version found');
    } else {
      core.info('New version found');
      core.info(`Upgradable version: v${releasedVersion} -> v${pkgVersion}`);
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

    core.setFailed('Unknown error');
  }
})();
