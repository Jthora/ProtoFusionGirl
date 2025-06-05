#!/usr/bin/env node
/**
 * scanDevEnvironment.js
 * Scans the project and outputs a summary of the current development environment for onboarding and AI agents.
 * Rename this file to .cjs if using "type": "module" in package.json
 * Or, update to use import syntax for ES modules
 */
const fs = require('fs');
const path = require('path');

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return null;
  }
}

function getNodeVersion() {
  try {
    return process.version;
  } catch {
    return 'Unknown';
  }
}

function getDependencies(pkg) {
  if (!pkg) return {};
  return {
    dependencies: pkg.dependencies || {},
    devDependencies: pkg.devDependencies || {}
  };
}

function listScripts() {
  const scriptsDir = path.join(__dirname);
  return fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));
}

function main() {
  const root = path.resolve(__dirname, '..');
  const pkgPath = path.join(root, 'package.json');
  const tsconfigPath = path.join(root, 'tsconfig.json');
  const jestConfigPath = path.join(root, 'jest.config.js');
  const vscodeExtPath = path.join(root, '.vscode', 'extensions.json');

  const pkg = readJSON(pkgPath);
  const tsconfig = readJSON(tsconfigPath);
  const vscodeExt = readJSON(vscodeExtPath);

  console.log('--- Development Environment Summary ---');
  console.log('Node.js version:', getNodeVersion());
  if (pkg) {
    console.log('Project name:', pkg.name);
    console.log('Project version:', pkg.version);
    console.log('Scripts:', Object.keys(pkg.scripts || {}));
    const deps = getDependencies(pkg);
    console.log('Dependencies:', Object.keys(deps.dependencies));
    console.log('DevDependencies:', Object.keys(deps.devDependencies));
  } else {
    console.log('No package.json found.');
  }
  if (tsconfig) {
    console.log('TypeScript config detected.');
  }
  if (fs.existsSync(jestConfigPath)) {
    console.log('Jest config detected.');
  }
  if (vscodeExt) {
    console.log('VS Code recommended extensions:', vscodeExt.recommendations || []);
  }
  console.log('Scripts toolbox:', listScripts());
}

main();
