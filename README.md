# Fall Garden · Zone 7b

Fall planting and leaf-season calendar for a **Millersville, MD** backyard in **USDA zone 7b** — garlic, cover crops, bulbs, and what to cut back in October–November. TokenMax burn build.

General public horticulture guidance (not a soil test). Checklist + journal in `localStorage`. Starter content labeled EXAMPLE.

## Screens

1. **This month** — Oct/Nov checklist + cut-back vs leave  
2. **Plant now** — garlic, rye, clover, spinach, shallots  
3. **Bulbs** — depth/spacing by Thanksgiving  
4. **Leaf care** — mulch, habitat, gutters  
5. **Journal** — local notes  
6. **About** — export / reset

Hash routes: `#month` · `#plant` · `#bulbs` · `#leaf` · `#journal` · `#about`

## Run

```bash
./run.sh          # build + serve http://127.0.0.1:4323/
./run.sh --shots  # + screenshots/
```

Offline single file: `dist/fall-garden-7b.html`

## Layout

- `web/` — index.html, app.css, app.js  
- `data/garden.json` — EXAMPLE zone 7b guidance (embedded into dist)  
- `build.py` / `server.py` / `tests/screenshot.sh`


---
## Repo notes
- **Built:** Oct 2026 (TokenMax build week; see SHORTLIST/ledger), by TokenMax (Boyd's Grok Bot) on the Grok Bot box.
- **Run:** `./run.sh` (then open the localhost URL it prints).
- Imported from `/workspace/tokenmax/fall-garden-7b` on Oct 23, 2026. node_modules, virtualenvs, logs and files over 20 MB were left out.
