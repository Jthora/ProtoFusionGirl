#!/bin/zsh
# Run artifact index update and show summary
node --loader ts-node/esm scripts/generateArtifactIndex.ts
cat artifacts/artifact_index.artifact | head -30
