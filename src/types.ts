export interface Inputs {
  owner: string;
  repo: string;
  package_json_path: string;
  prerelease: boolean;
  debug: boolean;
}

export interface Outputs {
  from_version: string;
  to_version: string;
  is_upgradable: boolean;
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
