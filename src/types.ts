export interface Inputs {
  owner: string;
  repo: string;
  packageJsonPath: string;
  debug: boolean;
  versionPrefix: string;
  includePrefix: boolean;
  preReleaseSuffixRegex: string;
}

export interface Outputs {
  from_version: string;
  to_version: string;
  is_upgradable: boolean;
  is_prerelease: boolean;
}

export interface PackageJson {
  [key: string]: any;
  name?: string;
  version?: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}
