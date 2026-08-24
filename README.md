# WikiKB

WikiKB is an efficient, semantic knowledge base for humans and agents. It lives in a GitHub repository's wiki, and is accessible from the command line or through GitHub Issues.

Indexing the knowledge base does not require a model. Searching uses a small local static embedding model, without calling a generative model or hosted inference service. Both operations run entirely on CPU, either on the client machine or within GitHub Actions. Storage is provided by the repository's GitHub Wiki.

Retrieval-augmented generation (RAG) operations such as summarization and question-answering can use any configured AI provider.

## Install

### Agent-guided (recommended)

Give this prompt to your coding agent:

```text
Install WikiKB using https://github.com/githubnext/wikikb/blob/main/INSTALL.md
```

The agent confirms a target repository, enables and initializes its GitHub Wiki, installs the CLI and workflows, and verifies a real retrieval. It will stop for approval before repository or settings changes.

### Manual

Requires Node.js 22+, Git, GitHub CLI, an initialized GitHub Wiki, and a configured Git author for writes.

```bash
npm ci
bash tools/wikikb-local/install.sh
export PATH="$HOME/.local/bin:$PATH"
export WIKIKB_GITHUB_TOKEN="$(gh auth token)"
```

The manual installer places a checkout-backed launcher in `~/.local/bin`; `WKB_INSTALL_DIR` changes the destination. The release includes the SOMA executables for macOS arm64, Linux x64/arm64, and Windows x64/arm64. Other platforms are not supported.

### GitHub CLI extension

The release includes a `gh-wikikb` extension launcher. Publish or mirror this
repository as `githubnext/gh-wikikb` (GitHub CLI requires the `gh-` repository
prefix), then install and run it as `gh wikikb`:

```bash
gh extension install githubnext/gh-wikikb --pin main
gh wikikb --help
```

Install the WikiKB agent skill for the current user:

```bash
gh wikikb skills install
```

This writes `~/.agents/skills/wikikb-memory/SKILL.md` and its agent metadata. Existing changed files are preserved unless `--force` is provided.

## Use

```bash
wkb add ai-research owner/repository
wkb ai-research sync
wkb ai-research search "hybrid retrieval methods" --top 5
wkb ai-research query "How does graph-based retrieval differ from vector search?" --no-ai
```

Here, `ai-research` is the local name registered for `owner/repository`. The
`search` command returns the five best-matching wiki entries. The `query` command
retrieves evidence for the question and prints that evidence without asking an
AI model to synthesize an answer.

Dots after the registered name select namespace slices. This example stores a
paper note under the `papers.transformers` slice, then searches only that slice
rather than the entire wiki:

```bash
wkb ai-research.papers.transformers ingest ./attention-is-all-you-need.md --tag paper,transformers
wkb ai-research.papers.transformers search "positional encoding" --top 5
```

Namespaces can have different purposes. This example archives up to 50 GitHub
issues from an open-source research tool under `sources.tool-discussions`,
without mixing them into the paper-notes slice, then searches only those issue
discussions:

```bash
wkb ai-research.sources.tool-discussions ingest-issues tool-owner/tool-repository --state all --limit 50 --comments
wkb ai-research.sources.tool-discussions search "embedding quality" --top 10
```

Finally, retrieve relevant entries from the whole `ai-research` wiki and
generate a topic summary with the configured AI provider. `--show-prompt` displays the
exact retrieved context and instructions without making an AI call; `--ai` sends
that prompt to the configured provider:

```bash
wkb ai-research summarize "Summarize the main approaches to retrieval-augmented generation" --show-prompt
wkb ai-research summarize "Summarize the main approaches to retrieval-augmented generation" --ai
```

## Commands

| Command | Purpose |
| --- | --- |
| `wkb add <name> <owner/repo>` | Register a wiki |
| `wkb list` | List registered wikis |
| `wkb skills install [--force] [--path directory]` | Install the WikiKB agent skill |
| `wkb <target> sync` | Clone or update the wiki |
| `wkb <target> status` | Show local state |
| `wkb <target> index [--force]` | Restore, update, and share an index |
| `wkb <target> search <query> [--top N] [--tag tags]` | Return ranked context |
| `wkb <target> query <question> [options]` | Retrieve context and optionally answer |
| `wkb <target> summarize\|rewrite\|extract\|timeline <request>` | Retrieve and run a prompt task |
| `wkb <target> ingest <file-or-url> [--tag tags] [--no-push]` | Add source material |
| `wkb <target> ingest-issues [owner/repo] [options]` | Archive GitHub issues |
| `wkb <target> lint [--tag tags]` | Check wiki structure |
| `wkb <target> explore [--tag tags]` | Report gaps and weak links |
| `wkb <target> tags` | List tags |
| `wkb prompts list\|init\|path\|show` | Manage prompt overrides |

Run `wkb --help` for options.

## Retrieval And Cache

WikiKB uses the local SOMA indexing and retrieval backend, distributed as checksum-verified platform binaries.

Generated indexes are stored as bounded, checksum-verified archives on the wiki repository's parentless `wikikb-cache-v1` branch. The cache branch contains no wiki Markdown. Reads sync, restore a compatible index, or build and publish one. Offline work stays local and retries later; `--no-push` content never enters the shared cache.

AI generation is optional and uses the configured provider and model. Use `search`, or `query --no-ai`, for retrieval without generation. See [Configuration](docs/configuration.md).

## Agentic Workflows

WikiKB can optionally install six GitHub Agentic Workflows controlled through labeled issues: `kb-ingest` and `kb-remember` write; `kb-question` and `kb-search` retrieve; `kb-lint` and `kb-explore` maintain.

Workflow source files live beside generated `*.lock.yml` files in `.github/workflows/`. Edit Markdown sources, then run `gh aw compile` and `gh aw validate`.

## Security

Treat all ingested content as untrusted. Prefer a private repository for every knowledge base: content may be confidential, can remain in Git history after deletion, and can contain prompt-injection attempts.

## Development

```bash
npm ci
npm run release:check
```

The live suite is documented in [Integration Tests](tests/integration/README.md). The supported artifact contains only the CLI, Agentic Workflows, approved runtime binaries, and supporting source. WikiKB source is MIT-licensed; the vendored SOMA binaries are distributed under separate terms.

Reference: [Architecture](docs/architecture.md), [Agent Memory](docs/agent-memory.md), [Release Scope](docs/release-scope.md), [Release Checklist](docs/release-checklist.md), [Contributing](CONTRIBUTING.md), and [License](LICENSE).
