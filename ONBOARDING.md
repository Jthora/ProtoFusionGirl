# ProtoFusionGirl: AI-Driven Game Development

Welcome to the ProtoFusionGirl video game project! This environment is a showcase for next-generation, AI-optimized, artifact-driven workflows. It is designed for AI agents to onboard, synchronize, and operate autonomously, with persistent context and automation as first-class citizens.

## 0. Understand the Project Root and Directory Structure

- **Identify the Project Root:**
  - The root directory is where `.primer`, `.datapack`, `ONBOARDING.md`, `scripts/`, and the `artifacts/` folder are located.
  - All relative paths in scripts and documentation are based on this root.
- **Map the Directory Structure:**
  - List all top-level folders and files in the root to understand the workspace layout (e.g., `artifacts/`, `scripts/`, `src/`, `contracts/`, `docs/`, etc.).
  - Review `artifacts/directory_structure_YYYY-MM-DD.artifact` (if present) for a machine-readable snapshot of the current directory structure.
  - Use the `List Scripts (JSON)` and `Project Dashboard (JSON)` tasks to discover automation scripts and their locations.
- **Navigation Best Practices:**
  - Always resolve paths relative to the project root unless otherwise specified.
  - When onboarding or automating, verify the current working directory is set to the project root for all scripts and tasks.

## AI Agent Onboarding: Immediate Actions Checklist

**All onboarding, automation, and project context actions are performed via the pre-configured VS Code tasks.**

### 1. Load Project Rules and Context
- Open and read `.primer` in the repo root to understand project purpose, conventions, and best practices.
- Open and read `artifacts/instructions.md` for artifact structure, automation workflows, and collaboration guidelines.
- Open and read `.datapack` for the game's story, world context, technical stack, and conceptual patterns.

### 2. Discover Automation and Capabilities
- Run the VS Code task: **List Scripts (JSON)**
  - Parse the output to discover all available scripts and their descriptions.
- Run the VS Code task: **Project Dashboard (JSON)**
  - Parse the output for a summary of project state, open tasks, and next actions.

### 3. Synchronize and Index Tasks
- Run the VS Code task: **AI Task Manager: List Tasks**
  - Parse the output to understand all current tasks, priorities, and project focus.
- Run the VS Code task: **AI Task Manager: Sync Tasks with Code**
  - Ensure all code TODOs are reflected as task artifacts.
- Run the VS Code task: **AI Task Manager: Update Task Index**
  - Ensure all new artifacts and tasks are indexed for discoverability.

### 4. Take Action and Expand Context
- If a new task or context node is needed, run the VS Code task: **AI Task Manager: New Task** and provide a description.
- If context is missing, run onboarding or dashboard tasks to auto-create missing artifacts and bootstrap the AI agent.
- If a script fails, check logs and create a repair or feedback artifact as needed.

### 5. Feedback and Retrospective
- Create feedback or retrospective artifacts to record onboarding blockers, insights, or improvements.

---

## Key VS Code Tasks for AI Onboarding & Automation

- **List Scripts (JSON):** Discover all scripts and their descriptions.
- **Project Dashboard (JSON):** Get a project summary and next actions.
- **AI Task Manager: List Tasks:** List all open tasks and priorities.
- **AI Task Manager: Sync Tasks with Code:** Sync code TODOs with task artifacts.
- **AI Task Manager: New Task:** Create a new task artifact.
- **AI Task Manager: Update Task Index:** Regenerate the task index artifact.

> For more, see `.primer`, `.datapack`, and `artifacts/instructions.md` in the repo root.

## Troubleshooting Common Issues

- **Node Path Issues:**
  - If a VS Code task fails with a `no such file or directory: node ...` error, it means the shell could not find the `node` executable in the expected path.
  - To resolve this, run scripts using the absolute path to Node (e.g., `/Users/jono/.nvm/versions/node/v22.12.0/bin/node`) as determined by running `which node` in your terminal.
  - You can update your VS Code tasks or shell commands to use this absolute path if you encounter similar issues.
- **Script Fails or Errors:**
  - If a script fails, check the terminal output and logs for error messages.
  - For Node path issues, see the Node Path Issues section above.
  - If the error is not related to Node, create a repair or feedback artifact using the provided scripts (see below) to document and address the issue.
  - Use `autoRepairArtifacts.js` to detect and fix artifact issues, or `newFeedbackOrRetrospective.js` to record blockers and insights.
