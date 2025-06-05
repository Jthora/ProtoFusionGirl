# ProtoFusionGirl Task System

This folder contains all actionable development, design, and research tasks for the project, organized in `.task` files for easy indexing, automation, and onboarding.

## .task Format
- Each `.task` file is a single actionable item or tightly related set of subtasks.
- Tasks are written in YAML or JSON, with fields for title, description, status, priority, tags, related artifacts/docs, and dependencies.
- Tasks are indexed and referenced by onboarding, automation, and dashboard scripts.
- **New:** Tasks may include automation-friendly metadata fields for AI-driven workflows (see below).

## Example .task File (YAML)
```yaml
title: Universal Magic Puzzle Integration for Warp Anchors
description: Require solving a Universal Language puzzle to create or restore a warp anchor. Add puzzle modal/UI and block anchor actions until solved.
status: todo
priority: 1
created: 2025-06-04
tags: [universal-magic, warp-anchor, ui, puzzle]
related:
  - artifacts/copilot_universal_language_puzzles_2025-06-04.artifact
  - artifacts/copilot_warp_anchor_systems_2025-06-04.artifact
dependencies: []
automation_hooks:
  - type: script
    trigger: status:done
    action: scripts/generate_feedback_artifact.js --task universal-magic-puzzle-integration.task
error_artifact: artifacts/auto_error_universal_magic_puzzle_integration_2025-06-04.artifact
ai_notes: |
  This task requires puzzle UI logic and modal integration. Block anchor creation until puzzle is solved. See related artifacts for puzzle logic and UI guidelines.
```

## Automation Metadata Fields
- `automation_hooks`: List of automation triggers and actions (e.g., run a script when status changes).
- `error_artifact`: Path to an artifact where errors/feedback for this task should be logged.
- `ai_notes`: Freeform field for AI-specific context, hints, or workflow notes.

## Indexing
- The onboarding and automation scripts will scan this folder and index all `.task` files.
- Each task should reference related artifacts and documentation for full context.
- Automation hooks and error artifacts are indexed for AI-driven workflows and feedback loops.

## Task Index Automation
- The file `task_index.json` is auto-generated from all `.task` files in this folder.
- To update the index manually, run:
  ```sh
  node scripts/updateTaskIndex.js
  ```
- To update automatically on file changes, run:
  ```sh
  node scripts/watchTasksAndUpdateIndex.js
  ```
- These scripts parse all YAML/JSON `.task` files and output a machine-readable index for onboarding, automation, and AI workflows.
- Add or edit `.task` files, then re-run (or keep running) the watcher script to keep the index up to date.

## Conventions
- Use lowercase, hyphen-separated filenames (e.g., `universal-magic-puzzle-integration.task`)
- Update task status as work progresses: `todo`, `in-progress`, `done`, `blocked`
- Add new tasks as needed for new features, bugs, or research items.
- Include automation metadata for tasks that benefit from AI or script-driven workflows.

## Artifact Hygiene
- All actionable TODOs, next steps, and tasks have been migrated from `artifacts/` to `tasks/`.
- Only keep high-level design, roadmap, and technical reference artifacts in `artifacts/`.
- If you add a new actionable item, create it as a `.task` file in this folder.
