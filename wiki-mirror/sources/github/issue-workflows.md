# Issue Workflows

**Type:** note
**Original:** repository workflow design
**Ingested:** 2026-07-08
**Tags:** #github #agentic-workflows #issueops

## Full Text

WikiKB uses GitHub issue labels as commands. `kb-ingest` adds source material, `kb-remember` stores durable notes or decisions, `kb-question` asks the KB for an answer, `kb-search` searches the KB, `kb-lint` checks health, and `kb-explore` suggests gaps. Compilation turns these inputs into cited, linked wiki pages. Write operations use narrow, reviewable paths.

## Summary

Issue workflows provide a human-friendly control plane and an audit log for agent actions.

## Key Concepts

- [[concepts/agentic-workflows]] - The orchestration layer.
- [[concepts/agent-memory]] - What the workflows preserve.
- [[concepts/wiki-compilation]] - How source material becomes maintained knowledge.
- [[concepts/safe-outputs]] - How write operations should be controlled.

## Notes

- Issue threads should link to any wiki page they create or update.
- Agents should say when the KB is unavailable rather than pretending memory was updated.
