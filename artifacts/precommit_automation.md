# Pre-commit Automation & Husky Integration

## Overview
This project uses a pre-commit hook (via Husky) to enforce artifact, task, and context hygiene before every commit. This ensures that all persistent memory, indexes, and automation metadata are always up to date for both AI and human contributors.

## What Happens on Pre-commit?
- **Artifact Indexing:** Regenerates the artifact index for discoverability and traceability.
- **Task Indexing:** Updates the task index for tracking and onboarding.
- **Artifact Cleanup:** Summarizes and optionally cleans up unused artifacts.

These are run via the `precommit-autoindex` npm script, which chains the following scripts:
- `scripts/generateArtifactIndex.js`
- `scripts/taskIndexUpdate.js`
- `scripts/summarizeAndCleanUnusedArtifacts.js`

## How to Customize
- To add more checks (e.g., linting, formatting, or tests), edit `.husky/pre-commit` and extend the npm script or add new commands.
- For code hygiene, consider adding ESLint or Prettier and running them here.
- For test coverage, add a fast test command (e.g., `npm test` or `npm run test:fast`).

## Best Practices
- Keep pre-commit output concise and actionable for both humans and AIs.
- Document any changes to the pre-commit flow in this file and in `artifacts/instructions.md`.
- Use the pre-commit hook as a central point for all automation and hygiene scripts.

## Example `.husky/pre-commit` (default):
```sh
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Auto-run artifact/task indexing and cleanup scripts before every commit
npm run precommit-autoindex
```

---

For more, see `artifacts/instructions.md` and `.primer`.
