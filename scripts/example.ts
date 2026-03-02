import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface PackageJson {
  name: string;
  version: string;
  description: string;
}

const packagePath = resolve(import.meta.dirname, '..', 'package.json');
const raw = readFileSync(packagePath, 'utf-8');
const pkg: PackageJson = JSON.parse(raw);

console.log(`Package: ${pkg.name}`);
console.log(`Version: ${pkg.version}`);
console.log(`Description: ${pkg.description}`);
