# Install WikiKB With an Agent

This is an operating guide for a coding agent. Walk the user through the install, perform every step you can, and ask for the smallest necessary human action when permissions or GitHub UI access block you.

The install is not complete until at least one real GitHub repository has an enabled, initialized wiki and passes the verification checklist below.

For security, prefer a **private repository** for every WikiKB knowledge base.
Knowledge-base content may be confidential, can persist in Git history after
deletion, and can contain prompt-injection attempts. A private repository is
mandatory when installing the Agentic Workflows.

## What You Are Installing

WikiKB adds:

- issue-driven Agentic Workflows under `.github/workflows/`;
- issue templates and the WikiKB memory skill under `.github/`;
- an isolated CLI runtime under `.github/wikikb/`;
- a local `wkb` launcher, normally under `~/.local/bin/`.

Do not replace the target repository's root `package.json`, lockfile, source, or build system. Do not overwrite changed files without showing the conflicts and receiving approval.

## 1. Inspect Before Asking

Check that `node`, `npm`, `git`, and `gh` are available. Require Node.js 22 or newer. Run `gh auth status`, identify the signed-in GitHub account, and confirm `git config user.name` and `git config user.email` are set.

If `gh aw` is unavailable, explain that WikiKB's workflows require the public GitHub Agentic Workflows extension, ask for approval, and install the release-tested version:

```bash
gh extension install github/gh-aw --pin v0.83.4
gh aw --version
```

From the intended target worktree, inspect:

```bash
git remote -v
git status --short
gh repo view --json nameWithOwner,defaultBranchRef,visibility,url
gh api "repos/OWNER/REPO" --jq '{default_branch,has_wiki,visibility,permissions}'
```

Recommend private visibility for all WikiKB knowledge bases. Require
`visibility` to be `PRIVATE` before installing Agentic Workflows. This is a hard
workflow security boundary: issue bodies and wiki content can contain prompt
injection, and knowledge-base history can retain sensitive material. If the
repository is public, stop the Agentic Workflow installation. The user may
still use the local CLI after acknowledging the increased exposure, or choose
a private repository.

Read existing repository guidance, workflows, issue templates, labels, and Actions settings. Preserve unrelated changes. If no target repository is apparent, ask the user to choose an existing repository or create one. Confirm the repository and explain that its wiki follows the repository's visibility.

Use a branch for installation. Do not push to the default branch directly.

## 2. Obtain a Trusted WikiKB Source

Prefer the latest public release archive and its SHA-256 checksum:

```bash
tmp="$(mktemp -d)"
gh release download --repo githubnext/wikikb --pattern 'wikikb-v*-cli-agentic-workflows.tar.gz*' --dir "$tmp"
(cd "$tmp" && shasum -a 256 -c ./*.sha256)
tar -xzf "$tmp"/wikikb-v*-cli-agentic-workflows.tar.gz -C "$tmp"
```

The extracted directory containing this `INSTALL.md` is the WikiKB source. When working from a trusted WikiKB checkout before its first release, tell the user that clearly and use that checkout only after they approve.

## 3. Enable the GitHub Wiki

Recheck `has_wiki`. If it is false and the authenticated account has administration permission, explain the setting change and ask for approval, then enable it:

```bash
gh api --method PATCH "repos/OWNER/REPO" -F has_wiki=true
```

Re-read the repository and require `has_wiki` to be `true`.

If the API call is unavailable or the account lacks permission, ask the user to open **Settings > General > Features**, enable **Wikis**, and tell you when it is done. Wait, recheck, and do not continue while the wiki is disabled.

## 4. Initialize the First Wiki Page

Test the wiki Git remote at `https://github.com/OWNER/REPO.wiki.git`. If it already has a `Home.md`, preserve it.

For an empty wiki, create a temporary Git repository with `Home.md` containing a short title and statement that WikiKB maintains the knowledge base. Use the configured Git author and a process-local GitHub authorization header, commit, and push to the wiki remote. Never place a token in a remote URL, file, command transcript, or commit.

One safe pattern is:

```bash
seed="$(mktemp -d)"
git -C "$seed" init --initial-branch master
printf '# Project Knowledge Base\n\nMaintained with WikiKB.\n' > "$seed/Home.md"
git -C "$seed" add Home.md
git -C "$seed" commit -m "kb: initialize wiki"
git -C "$seed" remote add origin "https://github.com/OWNER/REPO.wiki.git"
token="$(gh auth token)"
auth="$(printf 'x-access-token:%s' "$token" | base64 | tr -d '\n')"
GIT_CONFIG_COUNT=1 \
GIT_CONFIG_KEY_0=http.https://github.com/.extraheader \
GIT_CONFIG_VALUE_0="AUTHORIZATION: basic $auth" \
GIT_TERMINAL_PROMPT=0 \
git -C "$seed" push origin HEAD:master
unset token auth
```

Do not enable shell tracing around credentials. Remove the temporary directory after verifying the remote.

If GitHub rejects the first push, ask the user to create the first page at `https://github.com/OWNER/REPO/wiki/_new`. Then clone the wiki and verify that `Home.md` exists. Do not claim initialization succeeded from the setting alone.

## 5. Install Repository Files

From the WikiKB source, run the conflict-aware copier with the target's actual default branch:

```bash
node tools/install-agentic.js --target /absolute/path/to/target --confirm-private-repo --default-branch DEFAULT_BRANCH
```

The copier is idempotent. If it reports conflicts, review each one with the user. Merge compatible repository-specific content where practical. Use `--force` only after explicit approval to replace all listed files.

Install and build the isolated runtime:

```bash
npm ci --prefix .github/wikikb
npm run --prefix .github/wikikb build:wkb
```

## 6. Configure GitHub

Create or update the labels from `.github/wikikb/labels.yml`. The installed `Sync Labels` workflow will keep them synchronized; during installation, use `gh label create --force` so the issue forms work immediately.

Inspect Actions and Agentic Workflow requirements before changing settings. Explain any proposed permissions change and ask first. Configure the GitHub Agentic Workflows extension if needed, then compile and validate the installed workflow sources:

```bash
gh aw compile
gh aw validate
```

Commit the generated workflow locks and `.github/aw/actions-lock.json`. Do not hand-edit generated lock files.

The workflows use GitHub Copilot for generation. Check the target repository explicitly:

```bash
gh aw secrets bootstrap --non-interactive --engine copilot --repo OWNER/REPO
```

If `COPILOT_GITHUB_TOKEN` is missing, explain that this is a fine-grained PAT with **Copilot Requests** permission, not an ordinary `gh auth token`. Ask the user to create or provide it, accept it without echoing it, and set it through stdin with `gh aw secrets set COPILOT_GITHUB_TOKEN --repo OWNER/REPO`. Retrieval itself does not use this token. Do not claim the workflows are ready while the required secret is absent.

The installed models have no direct Bash, GitHub, or network tools. They can
only emit declared text safe outputs; constrained Actions jobs perform exact
CLI operations. Do not add model tools during installation.

## 7. Install and Register the Local CLI

Install from the target's isolated runtime:

```bash
bash .github/wikikb/tools/wikikb-local/install.sh
export PATH="$HOME/.local/bin:$PATH"
export WIKIKB_GITHUB_TOKEN="$(gh auth token)"
wkb add REPO_ALIAS OWNER/REPO
```

Use a short, valid alias. The launcher remains backed by the installed target checkout, so keep `.github/wikikb/` in place.

Local AI generation is optional and separate from retrieval. When requested, configure it explicitly. For Copilot:

```bash
wkb config set ai.provider copilot
wkb config set ai.model claude-sonnet-4.6
wkb REPO_ALIAS query "How does this project work?"
```

WikiKB uses `WIKIKB_COPILOT_TOKEN` when explicitly set and otherwise obtains
the active credential from `gh auth token`. If the wrong account is active,
select or add the intended account first with `gh auth switch` or `gh auth
login`. Never include placeholder quotes, an `Authorization:` prefix, or the
word `Bearer` in an explicit variable; `wkb` formats the header itself.

Do not run the generation verification unless the user wants to spend a Copilot request. Local Copilot authentication is distinct from the repository secret configured for Agentic Workflows.

## 8. Verify End to End

Run all of these against the selected repository:

```bash
wkb REPO_ALIAS sync
wkb REPO_ALIAS status
wkb REPO_ALIAS lint
wkb REPO_ALIAS index
wkb REPO_ALIAS search "knowledge base" --top 3
gh aw validate
git status --short
```

The first retrieval may download the checksum-pinned public retrieval model. A failed runtime, model install, index, or empty retrieval is a failed installation; do not substitute another search method.

Confirm all of the following:

- the repository API reports `has_wiki: true`;
- the wiki Git repository contains `Home.md`;
- `wkb sync`, `status`, `lint`, `index`, and `search` succeed;
- the Agentic Workflow sources and generated locks validate;
- required labels exist;
- the repository still reports `visibility: PRIVATE`;
- Agentic Workflow lock files expose no direct model tools;
- no credential appears in Git remotes, files, diffs, or commits;
- unrelated target-repository files remain unchanged.

## 9. Deliver the Change

Show the user the final diff, tests, settings changes, wiki URL, and any remaining human action. Commit on the install branch and open a small pull request when authorized. Include upgrade notes for pre-existing workflow files that required a merge.

Only report success after the checklist passes for at least one repository. Offer to configure additional repositories after the first verified install.
