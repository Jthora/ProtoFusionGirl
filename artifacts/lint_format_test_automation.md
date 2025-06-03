# Linting, Formatting, and Test Automation

## Overview
In addition to artifact and task hygiene, this project enforces code quality and reliability by running linting, formatting, and tests before every commit.

### Linting & Formatting
- **ESLint**: Checks for code quality and potential errors in JavaScript/TypeScript files.
- **Prettier**: Enforces consistent code formatting.

### Tests
- **Jest**: Runs the test suite to catch regressions and ensure reliability.

## How to Use
- The pre-commit hook will automatically run:
  - `npx eslint .`
  - `npx prettier --check .`
  - `npm test -- --bail --passWithNoTests`
- If any of these fail, the commit will be blocked until issues are resolved.

## Customization
- Edit `.husky/pre-commit` to add, remove, or change checks.
- Configure rules in `.eslintrc.js` and `.prettierrc`.
- For faster commits, you can use `--bail` or only run tests on changed files.

---

For more, see `artifacts/precommit_automation.md` and `artifacts/instructions.md`.
