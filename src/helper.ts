import * as core from '@actions/core';
import { context } from '@actions/github/lib/utils';
import fs from 'fs';
import { existsSync } from 'fs';
import { join } from 'path';

import { Inputs, Outputs, PackageJson } from './types';

/**
 * Parse boolean value from string
 * @param value - string value
 * @param defaultValue - default value if value is not 'true' or 'false'
 * @returns boolean value
 */
export function parseBoolean(value: string, defaultValue = false): boolean {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return defaultValue;
}

export function getInputs(): Inputs {
  const inputs: Inputs = {
    owner: core.getInput('owner', { required: false }) || context.repo.owner,
    repo: core.getInput('repo', { required: false }) || context.repo.repo,
    packageJsonPath: core.getInput('package_json_path', { required: false }) || '.',
    debug: parseBoolean(core.getInput('debug', { required: false })),
    versionPrefix: core.getInput('version_prefix', { required: false }),
    includePrefix: parseBoolean(core.getInput('include_prefix', { required: false })),
    includePreRelease: parseBoolean(core.getInput('include_prerelease', { required: false }), true),
    preReleaseSuffixRegex: core.getInput('prerelease_suffix_regex', { required: false }) || '-(alpha|beta|rc)\\.',
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
