# Artifacts & Automation: Copilot/AI Agent Instructions

Welcome to the **ProtoFusionGirl Artifacts & Automation System**. This folder and its scripts are the persistent memory, context engine, and automation backbone for the project—optimized for GitHub Copilot and AI agent workflows, but also clear for human contributors.

---

## What Are Artifacts?
Artifacts are persistent, versioned, and machine-readable context nodes. They store:
- **Designs, feedback, retrospectives, and TODOs**
- **Project state, onboarding, and memory**
- **Pseudocode, raw data, and structured knowledge**
- **Automation and workflow metadata**

Artifacts are the AI's long-term memory and the project's living documentation. Every `.artifact` file is a context shard: referenced, indexed, and cross-linked for rapid recall and automation.

---

## Folder Structure & Key Files
- `*.artifact`: All persistent context, tasks, and design notes. Each starts with a YAML/Markdown header for metadata, tags, and cross-links.
- `artifact_index.artifact`: The master manifest of all artifacts, auto-generated for search and navigation.
- `scripts_index.artifact`: Index of all automation scripts, usage, and onboarding info.
- `instructions.md`: This file. The onboarding and automation guide for Copilot/AI and humans.

---

## Automation & Modular Command Center
- **All automation is driven by scripts in `scripts/`**. Every script is discoverable, self-documenting, and invokable as a plugin via `aiTaskManager.js`.
- **Universal Entry Point:** Run `node scripts/aiTaskManager.js <command|script> [...args]` to invoke any workflow, task, or artifact action. All scripts are available as subcommands.
- **Auto-Generated Help:** Help and onboarding for every script is extracted from `// Usage:` and `// Onboarding:` comments. Run `node scripts/aiTaskManager.js help` for a full, up-to-date command map.
- **VSCode Integration:** All major actions are available as one-click VSCode tasks. See `.vscode/tasks.json` for discoverability.
- **Persistent, Machine-Readable State:** All project state (tasks, onboarding, self-prompt queue, artifact index, project state) is stored in versioned, human- and machine-readable files in `artifacts/`. No hidden state.

---

## Artifact Lifecycle & Best Practices
- **Create:** Use `aiTaskManager.js new` or `newArtifact.js` to generate new artifacts with full metadata.
- **Index:** Run `listScripts.js --update-index` and `taskIndexUpdate.js` to keep script and task indexes current.
- **Update:** Reference and update artifacts as you code. All code and artifacts should be mutually reinforcing.
- **Cross-Link:** Use the `related:` field in headers to link artifacts, scripts, and tasks for context expansion.
- **Automate:** Use scripts for onboarding, feedback, retrospectives, and hygiene. Pre-commit hooks run all hygiene scripts automatically.
- **Recall:** Use `project_dashboard.js` and `listScripts.js` to surface next actions, open tasks, and context gaps.
- **Self-Healing:** If context is missing, run onboarding or dashboard scripts to auto-create missing artifacts and bootstrap the AI agent.

---

## Quickstart for Copilot/AI Agents
1. **Onboard:** Run `node scripts/aiTaskManager.js guidedOnboarding` to self-test and fill onboarding gaps.
2. **List Tasks:** Run `node scripts/aiTaskManager.js list --json` to get all open tasks in machine-readable form.
3. **Sync:** Run `node scripts/aiTaskManager.js sync` to auto-create tasks from code TODOs and keep everything in sync.
4. **Recall Context:** Use `node scripts/project_dashboard.js --json` for a full project summary and next actions.
5. **Create/Update Artifacts:** Use `aiTaskManager.js new` or `newArtifact.js` for new context nodes. Always update the index.
6. **Automate Everything:** All scripts are plugins—discover, chain, and automate as needed. Use `help` for discoverability.

---

## Human Contributor Guidelines
- **Reference this file and `.primer` for all onboarding and context.**
- **Let Copilot/AI drive automation and onboarding.** Only intervene for architectural changes, feedback, or when prompted.
- **Keep artifact headers, tags, and cross-links up to date.**
- **Document every new artifact, script, or convention.**
- **Use feedback and retrospective artifacts to log blockers, insights, and improvements.**

---

## Example Artifact Header
```
---
artifact: <short_name>
created: <YYYY-MM-DD>
purpose: <short description>
type: <brainstorm|design|test|data|other>
tags: [tag1, tag2, ...]
format: <markdown|json|yaml|pseudocode|raw text|mixed>
related: [other_artifact, script_name]
---
```

---

## Automation Scripts: Key Workflows
- **Onboarding:** `guidedOnboarding.js` (auto-fills onboarding gaps, outputs JSON)
- **Task Management:** `aiTaskManager.js` (create, list, update, sync, index, plugin any script)
- **Artifact Indexing:** `listScripts.js --update-index`, `taskIndexUpdate.js`, `generateArtifactIndex.js`
- **Feedback/Retrospective:** `promptFeedbackLinkage.js`, `autoRepairArtifacts.js`
- **Self-Prompting:** `selfPromptPipeline.js` (persistent, JSON-based self-prompt queue)
- **Project Dashboard:** `project_dashboard.js` (summarizes state, outputs next actions)
- **Hygiene:** Pre-commit hooks run all hygiene and indexing scripts automatically
- **AI Autonomous Dev Loop:** Run `node scripts/aiAutonomousDevLoop.js` to let Copilot/AI automatically select, implement, test, and close tasks in a loop with minimal human input. See ONBOARDING.md for details.

---

## AI-Driven Project Philosophy
- **Artifacts are the AI’s memory.**
- **Scripts are the AI’s tools.**
- **The command center (`aiTaskManager.js`) is the AI’s brain.**
- **Everything is discoverable, automatable, and self-healing.**
- **Human contributors are copilots, not gatekeepers.**

---

## Pre-commit Automation & Husky Integration

This project uses a pre-commit hook (via Husky) to enforce artifact, task, and context hygiene before every commit. This ensures that all persistent memory, indexes, and automation metadata are always up to date for both AI and human contributors.

- **Artifact Indexing:** Regenerates the artifact index for discoverability and traceability.
- **Task Indexing:** Updates the task index for tracking and onboarding.
- **Artifact Cleanup:** Summarizes and optionally cleans up unused artifacts.

These are run via the `precommit-autoindex` npm script, which chains the following scripts:
- `scripts/generateArtifactIndex.js`
- `scripts/taskIndexUpdate.js`
- `scripts/summarizeAndCleanUnusedArtifacts.js`

**How to Customize:**
- To add more checks (e.g., linting, formatting, or tests), edit `.husky/pre-commit` and extend the npm script or add new commands.
- For code hygiene, consider adding ESLint or Prettier and running them here.
- For test coverage, add a fast test command (e.g., `npm test` or `npm run test:fast`).

**Best Practices:**
- Keep pre-commit output concise and actionable for both humans and AIs.
- Document any changes to the pre-commit flow in this file and in `artifacts/instructions.md`.
- Use the pre-commit hook as a central point for all automation and hygiene scripts.

See also: `artifacts/precommit_automation.md` for a detailed guide.

---

# Linting, Formatting, and Test Automation

In addition to artifact and task hygiene, the pre-commit hook enforces code quality and reliability by running linting, formatting, and tests before every commit.

- **ESLint**: Checks for code quality and potential errors in JavaScript/TypeScript files.
- **Prettier**: Enforces consistent code formatting.
- **Jest**: Runs the test suite to catch regressions and ensure reliability.

The pre-commit hook runs:
- `npx eslint .`
- `npx prettier --check .`
- `npm test -- --bail --passWithNoTests`

If any of these fail, the commit will be blocked until issues are resolved.

See also: `artifacts/lint_format_test_automation.md` for details and customization tips.

---

For any new contributor (AI or human):
- Start with `.primer` and this file.
- Use the command center for all actions.
- Keep everything indexed, cross-linked, and up to date.
- Let Copilot/AI automate, recall, and expand context as much as possible.
