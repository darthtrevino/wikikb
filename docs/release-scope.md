# Release Scope

WikiKB 0.1 supports:

- The Node.js `wkb` CLI.
- Issue-driven Agentic Workflows and their GitHub Actions support files.
- The agent-guided installer and its conflict-aware target-repository copier.

The GitHub release attaches an allowlisted `cli-agentic-workflows` archive and SHA-256 checksum. It includes supporting source plus checksum-pinned SOMA executables for macOS arm64, Linux x64/arm64, and Windows x64/arm64.

WikiKB source is provided under the MIT License. The bundled SOMA executables are unchanged third-party binary-only components, are expressly excluded from the MIT grant, and remain subject to their separate terms. Microsoft authorized the WikiKB maintainer to redistribute these binaries with WikiKB; that authorization does not grant source, modification, relicensing, or separate-redistribution rights. The bundle includes their third-party notice.

SOMA is the only retrieval backend. Unsupported hosts cannot index, search, or query.

The SOMA runtime installs its pinned public static retrieval model on first retrieval. Installation is locked, staged, checksum-verified, and atomically activated; invalid or unavailable files stop retrieval.

The archive excludes dependency trees, generated output, caches, credentials, `.env` files, and deferred product paths. Runtime source is not included.

At runtime, `wikikb-cache-v1` stores bounded generated indexes and integrity manifests in the wiki Git repository. It contains no rendered Markdown and is not embedded in the release archive.

GitHub's automatic tag snapshots are repository snapshots. The reproducible attached archive is the supported artifact.

Agentic Workflows are supported only in private repositories with trusted
collaborators and wiki writers. Their models receive no direct Bash, GitHub, or
network tools; constrained jobs apply declared text safe outputs. The local CLI
may be used without those workflows.
