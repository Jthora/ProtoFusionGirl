# ProtoFusionGirl: AI-Driven Game Development

Welcome to ProtoFusionGirl! This project uses a next-generation, agent-optimized, self-documenting environment. All onboarding, automation, and persistent context are managed through structured, machine-readable files and automated scripts.

---

## 🚀 Quick Start for Humans & AI Agents

- **Run the VS Code task `AI Agent Workspace Setup`** (Command Palette > `Tasks: Run Task > AI Agent Workspace Setup`) immediately after cloning the repo. This will generate all required dotfiles and directories for onboarding.
- **Read `.primer`** for project philosophy, onboarding, and automation conventions.
- **Consult `.manifest`** for a live, machine-readable index of all key files, artifacts, scripts, and folders.
- **For agent-specific context and rules, see `.priming`.**
- **Run VS Code tasks** (see Command Palette > `Tasks: Run Task`) for all onboarding, validation, and context sync:
  - `Project Sync` (runs all validation and context update scripts)
  - Or run individual tasks: `Validate Schemas`, `Update Manifest`, `Aggregate Personas`, `Sync Datapack`, `Update Dashboard`
  - **For Copilot/AI agent onboarding, run `Copilot Onboarding` (see below).**
- **For project status and open tasks, see `.dashboard`.**
- **For feedback/issues, see `.feedback` and the `tasks/` folder.**

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

## 🤖 Copilot/AI Agent Onboarding

- **To onboard GitHub Copilot or any AI agent:**
  - Run the VS Code task: `Copilot Onboarding` (Command Palette > `Tasks: Run Task > Copilot Onboarding`).
  - Onboarding is complete only after Copilot (or any AI agent) has read and processed the output JSON files generated by all onboarding scripts as well as the essential reference files listed below.
  - **Copilot/AI agents must also read and use the generated documentation indexes:**
    - `docs/docs_index_L1.json` for high-level document discovery and navigation
    - `docs/docs_index_L2.json` for deep, section-level context and metadata
  - No manual review or additional scripts are required unless the JSON file reports errors.
  - If errors are present, follow the remediation hints in the JSON file or terminal output.

---

## 🛠️ Automation & Validation
- All onboarding, validation, and context sync is automated via scripts in `scripts/` and available as VS Code tasks.
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

## 🧩 VS Code Task: Copilot Onboarding

The `Copilot Onboarding` task is already set up in `.vscode/tasks.json` to run the onboarding script and output the result to `artifacts/copilot_onboarding_status.json`. No further configuration is needed.

This task can be run from the Command Palette or the VS Code Tasks panel.

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

> **Upgrade Roadmap:**
> See `artifacts/upgrade_roadmap_2025-06-05.artifact` for the prioritized, artifact-driven upgrade plan. All contributors and AI agents must reference this roadmap and the foundational artifacts in `artifacts/` for every codebase change. For each upgrade, consult the relevant artifact(s) before making changes, and reference them in code comments and PRs.

---

> **Note:** Some features and directories are still in-progress or incomplete. For the latest status and open tasks, see the `tasks/` folder and `.dashboard`. Placeholder code and TODOs are tracked and will be addressed in future updates. Some TODOs and code may have been abandoned, so don't assume everything is being used: always verify.

---

> **Gameplay Experience Alignment:**
> All contributors and AI agents must use the checklist in `artifacts/gameplay_alignment_checklist_2025-06-05.artifact` to ensure every feature, PR, and system aligns with the intended gameplay experience. Reference the gameplay blueprint and checklist in all major code reviews and merges.

---
