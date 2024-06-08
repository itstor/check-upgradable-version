import * as core from '@actions/core';
import { context } from '@actions/github/lib/utils';
import fs from 'fs';
import { existsSync } from 'fs';
import { join } from 'path';

import { Inputs, Outputs, PackageJson } from './types';

export function getInputs(): Inputs {
  const inputs: Inputs = {
    owner: core.getInput('owner', { required: false }) || context.repo.owner,
    repo: core.getInput('repo', { required: false }) || context.repo.repo,
    package_json_path: core.getInput('package_json_path', { required: false }) || '.',
    prerelease: core.getInput('prerelease', { required: false }) === 'true',
    debug: core.getInput('debug', { required: false }) === 'true',
  };

  return inputs;
}

export function setOutputs(output: Outputs, log?: boolean) {
  Object.entries(output).forEach(([key, value]) => {
    core.setOutput(key, value);
    if (log) {
      core.info(`${key}: ${value}`);
    }
  });
}

export function getPackageJson(path: string): PackageJson {
  const packageJsonPath = join(path, 'package.json');

  if (!existsSync(packageJsonPath)) {
    throw Error(`package.json not found at ${packageJsonPath}`);
  }

  try {
    const pkg = fs.readFileSync(packageJsonPath).toString();

    return JSON.parse(pkg);
  } catch (error) {
    if (error instanceof Error) {
      throw Error(`Failed to parse package.json: ${error.message}`);
    }

    throw Error('Failed to parse package.json');
  }
}
