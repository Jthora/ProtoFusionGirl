#!/bin/zsh
# Run artifact index update and show summary
node scripts/generateArtifactIndex.js
cat artifacts/artifact_index.artifact | head -30
