# QMD Quick Reference

**Status:** ✅ Installed and operational  
**Version:** 1.1.0  
**Backend:** 192.168.1.212:8000 (connected)

---

## Installation Verification ✅

```bash
# Check installation
which qmd                    # /home/svalbuena/.bun/bin/qmd
qmd --version                # 1.1.0

# Check status
qmd status                   # View health + GPU status
```

---

## Getting Started

```bash
# Add a collection (markdown files to index)
qmd collection add /path/to/docs
qmd collection list

# Build vector embeddings (first time is slow)
qmd embed

# Search
qmd query "your search query"
qmd search "keyword"         # BM25 only
qmd vsearch "concept"        # Vector only
```

---

## Common Commands

| Task | Command |
|------|---------|
| **Search** | `qmd query "what you're looking for"` |
| **Show file** | `qmd get path/to/file.md` |
| **Show lines** | `qmd get path/to/file.md:10-20` |
| **List indexed files** | `qmd ls` |
| **Add collection** | `qmd collection add ./docs` |
| **Update index** | `qmd update` |
| **Start MCP server** | `qmd mcp` |
| **Cleanup cache** | `qmd cleanup` |

---

## Search Options

```bash
qmd query "search term" -n 10              # Get 10 results
qmd query "term" --full                    # Show full docs
qmd query "term" --json                    # JSON output
qmd query "term" -c my-collection          # Search one collection
qmd query "term" --min-score 0.7           # Min similarity threshold
```

---

## Query Syntax

```bash
# Simple query (auto-expanded)
qmd query "how does auth work"

# Exact phrases
qmd query "exact phrase match"

# Combined lex/vector/hyde
qmd query $'lex: keyword\nvec: concept\nhyde: hypothetical answer'

# Negation in lex search
qmd query 'lex: "feature -bug"'
```

---

## Backend Status

✅ **Memory Backend Ready**
- Address: `192.168.1.212:8000`
- API: FastAPI
- Endpoints:
  - `POST /tokenize` 
  - `POST /scale_elastic_ep`
  - `POST /is_scaling_elastic_ep`
- Swagger UI: http://192.168.1.212:8000/docs

```bash
# Test backend
curl -s http://192.168.1.212:8000/ | jq .
```

---

## Current System Info

```
Location:       /home/svalbuena/.bun/bin/qmd
Version:        1.1.0
Index DB:       ~/.cache/qmd/index.sqlite
Collections:    0 (ready to add)
GPU:            CPU only (CUDA optional)
Node.js:        v22.22.0 ✅
Bun:            v1.3.9 ✅
Backend:        192.168.1.212:8000 ✅
```

---

## GPU Acceleration (Optional)

Currently running on **CPU only** (slower).

To enable CUDA:
```bash
# Install CUDA toolkit, then rebuild:
cd ~/.bun/install/global/node_modules/@tobilu/qmd
npm run build
qmd status  # Should show GPU available
```

---

## Files

| File | Purpose |
|------|---------|
| `QMD_SETUP_CHECKLIST.md` | Full setup details + troubleshooting |
| `QMD_QUICK_REFERENCE.md` | This file — quick lookups |
| `~/.cache/qmd/index.sqlite` | Local search index |
| `~/.bun/bin/qmd` | Executable (symlink) |

---

## Tips

✨ **For agents:** `qmd mcp` exposes search to Claude/other AI  
⚡ **For speed:** Use GPU acceleration if available  
📚 **For scale:** Remote backend at 192.168.1.212:8000  
🔄 **For updates:** Run `qmd update --pull` to re-index + git pull  

---

**More info:** See `QMD_SETUP_CHECKLIST.md` or run `qmd --help`
