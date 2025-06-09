# ProtoFusionGirl: AI-Driven Game Development

## Onboarding
use this document to onboard yourself. Be sure to fully onboard and don't mis a phase or step. Iterate if you must.

---

## 📚 Essential References
- `.primer`: Project purpose, conventions, best practices
- `.manifest`: Live index of all key files, artifacts, and scripts
- `.priming`: Agent-specific context and rules
- `.dashboard`: Project status, open tasks, and metrics
- `.feedback`: Feedback log and escalation
- `artifacts/`, `tasks/`, `persona_core/`, `data/`, `docs/`, `scripts/`: See each folder's `README.md` for details
- `docs/docs_index_L1.json`: **L1 (summary) documentation index for fast lookup and discovery**
- `docs/docs_index_L2.json`: **L2 (deep) documentation index for full metadata, headings, and navigation**

---

## 🚦 Central Copilot/AI Agent Onboarding Flow

**Step 1: Run the Full Copilot Onboarding Task**
- Open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`).
- Select `Tasks: Run Task` > `Full Copilot Onboarding`.
- This will automatically:
  - Read all required context, artifacts, and documentation
  - Run all onboarding, validation, and context sync scripts
  - Check directory structure, tasks, and documentation
  - Run all tests for validation
  - Output a status summary to `artifacts/copilot_onboarding_status_summary.json`
  - Escalate errors if onboarding fails

**Step 2: Review the Onboarding Status**
- After the task completes, review both `artifacts/copilot_onboarding_status_summary.json` **and** `artifacts/copilot_onboarding_status_full.json` for results, errors, and detailed onboarding information.
- If errors are detected in either file, escalate via a feedback artifact in `tasks/`.

**Step 3: (Optional) Use Legacy or Individual Tasks**
- For advanced or legacy workflows, you may run:
  - `Copilot Onboarding (Legacy)` (original script)
  - Individual validation or sync tasks as needed

> **Tip:** Always rerun the `Full Copilot Onboarding` task after any major change. This is the single source of truth for Copilot/AI onboarding and validation.

---

## 🚀 Quick Start

- **Run the VS Code task `AI Agent Workspace Setup`** (Command Palette > `Tasks: Run Task > AI Agent Workspace Setup`) immediately after cloning the repo. This will generate all required dotfiles and directories for onboarding.
- **To run all automated tests, use the VS Code task `Run All Tests` (see below).**
- **Read `.primer`** for project philosophy, onboarding, and automation conventions.
- **Consult `.manifest`** for a live, machine-readable index of all key files, artifacts, scripts, and folders.
- **For agent-specific context and rules, see `.priming`.**
- **Run VS Code tasks** (see Command Palette > `Tasks: Run Task`) for all onboarding, validation, and context sync:
  - `Project Sync` (runs all validation and context update scripts)
  - Or run individual tasks: `Validate Schemas`, `Update Manifest`, `Aggregate Personas`, `Sync Datapack`, `Update Dashboard`
  - **For Copilot/AI agent onboarding, run `Copilot Onboarding` (see below).**
- **For project status and open tasks, see `.dashboard`.**
- **For feedback/issues, see `.feedback` and the `tasks/` folder.**
- **After updating, scan and review `directory-structure.txt` to familiarize yourself with the current project structure and quickly locate files and directories.**

> **Always:** Update and scan **directory-structure.txt** using the VS Code task `Update Directory Structure` (Command Palette > `Tasks: Run Task > Update Directory Structure`). This will run `tree -a -I 'node_modules|venv' > directory-structure.txt` for you.

> **Note:** To run a single test file (for Copilot/AI agent or developer one-off runs), use the VS Code task `Run Single Jest Test`.

> **Note:** Assume that artifacts may-or-may-not be already complete and out of date, which means you will have to check to be sure.

---

# About the Game Project & Directory Structure

ProtoFusionGirl is an AI-driven, agent-optimized video game project. The codebase is organized for both rapid development and deep automation. Below is a high-level overview of the main directories and their roles:

- **src/**: Main game source code. Contains all TypeScript/JavaScript files for game logic, UI, scenes, core systems, and assets.
  - `core/`: State machines, event bus, and core engine logic.
  - `scenes/`: Game scenes (e.g., GameScene, StartScene, PauseMenuScene).
  - `ui/`: UI components and layouts.
  - `assets/`: Game assets (JSON, tilesets, recipes, etc.).
  - `lang/`: Localization and language files.
  - `mods/`: Modding support and extension points.
  - `services/`: Service classes for game features.
  - `world/`: World state and related logic.
  - `main.ts`: Game entry point.
  - `style.css`: Main stylesheet.
- **artifacts/**: All persistent context, design docs, onboarding status, and automation outputs. Artifacts are the backbone of the agent-driven workflow.
- **data/**: Game data, persona definitions, and context files (JSON).
- **docs/**: Game design documents, technical docs, and onboarding guides.
- **scripts/**: Automation, onboarding, validation, and context sync scripts.
- **tasks/**: All open, completed, and feedback tasks for the project. Each `.task` file is machine-readable.
- **persona_core/**: Persona core definitions, heuristics, and agent context files.
- **contracts/**: Smart contracts (e.g., for web3 integration).
- **public/**: Static assets for web deployment.

For more details, see each folder's `README.md` (where available) or consult `.manifest` for a live index of all files and scripts.

---

**Always:** Rerun onboarding after any major change, and keep all context, memory, and cross-links up to date.

---

## 🛠️ Automation & Validation
- All onboarding, validation, and context sync is automated via scripts in `scripts/` and available as VS Code tasks.
- **Automated test validation:** Use the `Run All Tests` VS Code task to run all `npx jest` tests for the project. Use the `Run Single Jest Test` task to run a specific test file (prompted for the path). This is especially useful for Copilot/AI agent workflows and targeted debugging.
- Pre-commit hooks (see `.husky/`) enforce schema validation and manifest updates.
- All context and relationships are always up to date—no need to manually update this file.
- **Copilot/AI agent onboarding is tracked in `artifacts/copilot_onboarding_status_summary.json`.**

---

## For More Information
- For deep context, see `.datapack` and `docs/`.
- For artifact structure and best practices, see `artifacts/instructions.md`.
- For troubleshooting, see `.dashboard` and `.feedback`.

---

> **Note:** This file is a pointer to the real sources of truth. For all onboarding, automation, and context, use the structured files and scripts listed above.

---

## 🧩 VS Code Task: Full Copilot Onboarding (Central Onboarding Task)

> **This is now the central and recommended way to onboard Copilot/AI agents and validate the workspace.**

The `Full Copilot Onboarding` VS Code task automates every step of onboarding, validation, and context sync for Copilot/AI agents. It:
- Reads all required context, artifacts, and documentation
- Runs all onboarding, validation, and context sync scripts
- Checks directory structure, tasks, and documentation
- Runs all tests for validation
- Outputs a status summary to `artifacts/copilot_onboarding_status_summary.json`
- Escalates errors if onboarding fails

**How to use:**

1. Open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`).
2. Select `Tasks: Run Task`.
3. Choose `Full Copilot Onboarding`.
4. Review the onboarding summary output in both `artifacts/copilot_onboarding_status_summary.json` and `artifacts/copilot_onboarding_status_full.json`.
5. If errors are detected in either file, check the details and escalate via a feedback artifact if needed.

> **Tip:** Always rerun this task after any major change. This is the single source of truth for Copilot/AI onboarding and validation.

---

## 🧩 VS Code Task: Copilot Onboarding (Legacy)

The `Copilot Onboarding (Legacy)` task runs the original onboarding script. For full onboarding, always use `Full Copilot Onboarding` above.

---

> **Note:** Some features and directories are still in-progress or incomplete. For the latest status and open tasks, see the `tasks/` folder and `.dashboard`. Placeholder code and TODOs are tracked and will be addressed in future updates. Some TODOs and code may have been abandoned, so don't assume everything is being used: always verify.

---
