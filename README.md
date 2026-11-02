**English** | [Italiano](README.it.md)

# FITET Liguria: athletes' ranking progress

A chart of the ranking progress (points and position) of the athletes in the Liguria regional
table tennis championships (C/2, D/1, D/2), with data from [portale.fitet.org](https://portale.fitet.org).

**Page:** https://nkashiri.github.io/rank-fitet-liguria/ (the page itself is in Italian)

## Using the page

- The chart starts empty: click rows in the table to add or remove athletes,
  or use **Top 8** for the 8 athletes with the most points among those filtered.
- **Punti / Posizione**: the chart metric, points or position (the position is in the national ranking).
- **Stagione 26/27 / Da 25/26 / Da 23/24 / Tutto**: the period shown (this season, since
  2025/26, since 2023/24, everything); the Δ columns show the change over that period.
- Filters by championship, club and name; table columns are sortable.

## Data updates

- **Automatic:** every Monday at 06:00 UTC (07:00 or 08:00 in Italy).
- **Manual:** [Actions](https://github.com/nkashiri/rank-fitet-liguria/actions) tab →
  **Aggiorna classifica** → **Run workflow**. The page is updated in about 2 minutes.
- Each update also saves `index.html` in the repository: the "Aggiorna dati ..." commit
  history keeps the previous versions.

## Extra athletes (not in the Liguria championships)

They are listed in `atleti_extra.txt`, one per line: `SURNAME NAME (dd/mm/yyyy)`.

- **Add:** on the page, type the name in "Aggiungi un atleta" and click **Aggiungi atleta**;
  GitHub opens with the request already filled in: click **Create**.
  After about 3 minutes the athlete appears in the table with the "Extra" label.
- **Remove:** click the **rimuovi** link next to "Extra" in the athlete's row, then **Create**.
- The reply in the issue says whether it worked. If several athletes share the name, it
  lists their birth dates: try again with `SURNAME NAME dd/mm/yyyy`.
- You can also edit `atleti_extra.txt` directly on GitHub (pencil icon → Commit):
  it takes effect at the next update.
- Only the repository owner and collaborators can add or remove athletes;
  requests from other users are ignored.

## Files

- `fitet_liguria.js`: downloads the data and generates the page.
- `template.html`: the page (chart and table) the data is inserted into.
- `atleti_extra.txt`: extra athletes.
- `.github/workflows/update.yml`: weekly update and publishing to GitHub Pages.
- `.github/workflows/extra.yml`: handles the "Aggiungi:" / "Rimuovi:" requests opened from the page.
- `index.html`: the latest generated page (written by the workflow, don't edit it by hand).

## Running locally (Node 18+, no dependencies)

```
node fitet_liguria.js                         # writes fitet_liguria.html
node fitet_liguria.js out.html                # or another file
node fitet_liguria.js --add "ROSSI MARIO"     # adds an athlete to atleti_extra.txt
node fitet_liguria.js --remove "ROSSI MARIO"  # removes them
```

In a local copy the "Aggiungi atleta" button doesn't appear (it needs GitHub).

## Season change

At the start of each season (July), check:

1. **Championship numbers** (`CAMS` at the top of `fitet_liguria.js`, currently 301–307): they are
   the `CAM=` parameter of the Liguria championship links on portale.fitet.org
   (e.g. `risultati/campionati/campionati.php?CAM=301`). They may change from one season
   to the next; you can also add other championships here (women's, other series).
2. **Period buttons** in `template.html` (`id="range"`): labels and season start dates,
   e.g. `data-v="2026-07-01"` → `2027-07-01` and "Stagione 27/28".

## How the data is collected

1. `risultati/campionati/statistiche_atleti.php?CAM=<n>`: the athletes of each championship
   (name, club, matches won/lost). The title comes from `testa_campionati.php`.
2. `ajax.php?term=<name>`: the search box of "Ricerca e verifica attività atleta", used to find
   the athlete's ID (with the `X-Requested-With: XMLHttpRequest` and `Referer` headers).
   For athletes with the same name, the one playing in the championship is chosen; if the
   same athlete has two cards, the one in the current ranking.
3. `scheda_unica_i.php?ATLETA=<id>`: the athlete's card (card number, club, ranking ID).
4. `risultati/new_rank/dettaglioatleta_unica.php?ATLETA=<id>&ID_CLASS=<c>`: the
   "Storico Classifica" tab (date, position, points, category). For unranked athletes ("FQ")
   the latest ranking listed in `menu.php` is used.

A browser can't read portale.fitet.org directly (the site doesn't allow it), which is why
the data is collected by the script and embedded in the page.

## Troubleshooting

- **The workflow fails:** open the run in the Actions tab and look at the step in red.
  If "Scarica i dati" fails, the FITET portal may be unreachable or may have changed its
  structure (see "How the data is collected"); try again later with Run workflow.
- **A championship athlete is missing or has no history:** the script prints the names it
  couldn't find in the log of the "Scarica i dati" step (`Not resolved`).
- **Weekly updates stop:** GitHub pauses scheduled workflows after 60 days without activity
  in the repository. The weekly commits prevent this, but if it happens you can re-enable
  it from the Actions tab.
