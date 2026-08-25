# Vendored LexCAT runtime

WikiKB ships LexCAT 0.0.11, a model-free lexical retrieval CLI, as binary-only
platform archives. WikiKB uses LexCAT as its indexing and retrieval runtime.
The runtime is mandatory for indexing and retrieval; no source checkout,
runtime download, or alternate retrieval path is included.

`manifest.json` is authoritative for platform selection and SHA-256
verification. WikiKB verifies the archive and executable before extracting the
runtime into the user's private cache. `WIKIKB_LEXCAT_BIN` can select an
approved, operator-managed executable for controlled testing and deployment.

The macOS arm64, Linux x64, and Windows x64 packages contain unchanged
executable bytes from the LexCAT team's authorized binary release. WikiKB
packages the executable as `lexcat` or `lexcat.exe` for runtime-path
compatibility and wraps it in a checksum-pinned archive. The manifest also pins
the digest of the original release asset. No private source-repository locator
or executable network fetch is part of the release.

Microsoft has authorized the WikiKB maintainer to redistribute these unchanged
compiled LexCAT binaries with WikiKB. The executable remains a separately
licensed component: WikiKB's MIT license does not grant source, modification,
or relicensing rights for LexCAT. Runtime source is not included. The licensing
boundary is recorded in `THIRD_PARTY_NOTICES.txt`.

Unlike the retrieval runtime it replaces, LexCAT is model-free: ranking is
BM25 over an analyzer-built term-document matrix, so there is no model to
download, pin, verify, or cache, and retrieval never contacts a network
service.

## Platform coverage

| Platform | Archive |
| --- | --- |
| `linux/x64` | `lexcat-v0.0.11-linux-x86_64.tar.gz` |
| `darwin/arm64` | `lexcat-v0.0.11-macos-arm64.tar.gz` |
| `win32/x64` | `lexcat-v0.0.11-windows-x86_64.zip` |

LexCAT 0.0.11 publishes no `linux/arm64`, `win32/arm64`, or `darwin/x64`
binary. On those platforms WikiKB fails with an explicit error and requires
`WIKIKB_LEXCAT_BIN` to point at an approved executable.

## Index compatibility

LexCAT writes a single SQLite index whose schema version is pinned in
`manifest.json`. LexCAT rejects an index written by a different schema version,
and WikiKB's index contract (`index_config`) changes whenever the pinned
runtime or schema changes, so cached indexes rebuild rather than load a
mismatched file.
