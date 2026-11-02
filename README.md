**English** | [Italiano](README.it.md)

# FITET: athletes' ranking progress

A chart of the ranking progress (points and position) of all the athletes in the Italian men's
and women's table tennis rankings (about 8,900 men and 900 women), with data from [portale.fitet.org](https://portale.fitet.org).

**Page:** https://nkashiri.github.io/rank-fitet/ (the page itself is in Italian)

## Using the page

- **Filters:** Sesso (gender: both by default, or only Maschile / Femminile), Settore (sector: Seniores, Master, Giovanili, ...), Società (club), Regione (region)
  and Categoria (category). Each one can take several values; the number next to each value is how
  many athletes it would add given the other filters. The Società list has a search box.
  With no filter chosen the table lists everyone (300 rows at a time: **Mostra altri** for more).
- On the first visit the page opens on Regione = Liguria; **Azzera filtri** clears all filters.
- The filters, the selected athletes, the metric and the period are kept in the page address:
  bookmark or share it to come back to the same view.
- The chart starts empty: click rows in the table to add or remove athletes,
  or use **Top 8** for the 8 athletes with the most points among those filtered.
- **Punti / Posizione**: the chart metric, points or position in the national ranking (the men's or the women's one).
- **Period** (this season, since last season, since three seasons ago, everything): the Δ columns
  show the change over that period. The buttons follow the season (from July 1) automatically.
  Points are reset every July 1, so Δ Punti over more than one season mixes different seasons' scales;
  Δ Pos. is comparable across seasons.
- **Other columns:** **Forma** (form: points gained over the last 3 monthly rankings of the current
  season), **V-P** and **% vitt.** (matches won-lost and win percentage this season) and
  **Miglior pos.** (best position ever, with the year; the date is in the tooltip).

## Data updates

- **Automatic:** every Monday at 06:00 UTC (07:00 or 08:00 in Italy).
- **Manual:** [Actions](https://github.com/nkashiri/rank-fitet/actions) tab →
  **Aggiorna classifica** → **Run workflow**. The page is updated in about 3 minutes.
- **On code changes:** pushing a change to `fitet_liguria.js` or `template.html` also updates the page.
- Each update also saves `index.html` (the athlete list, without the histories) in the repository:
  the "Aggiorna dati ..." commit history keeps the previous versions.

## Files

- `fitet_liguria.js`: downloads the data and generates the page.
- `template.html`: the page (chart and table) the data is inserted into.
- `.github/workflows/update.yml`: weekly update (and on code changes) and publishing to GitHub Pages.
- `index.html`: the latest generated page (written by the workflow, don't edit it by hand).

## Running locally (Node 18+, no dependencies)

```
node fitet_liguria.js                        # writes site/index.html and site/storico/
node fitet_liguria.js out/index.html         # or another folder
node fitet_liguria.js --limit 200            # only the top 200 men and 200 women (quick test)
```

The page loads the histories from `storico/`, which a browser doesn't allow from a file opened
directly: serve the folder, e.g. `cd site && python3 -m http.server`, then open http://localhost:8000.

## How the data is collected

1. `menu.php`: the latest ranking ID (`ID_CLASS`, the highest in the "Classifiche" links).
2. `risultati/new_rank/ranking_unica.php?SESSO=<M|F>&ID_CLASS=<id>&TIPO=1&page=<n>`: the general men's
   and women's rankings, 100 athletes per page (the same list as `fpdf2/excel_classifica.php`, plus the athlete ID).
   It needs the `X-Requested-With: XMLHttpRequest` and `Referer` headers.
3. `risultati/new_rank/dettaglioatleta_unica.php?ATLETA=<id>&ID_CLASS=<id>&ZU=1&AVVERSARIO=0`, one
   per athlete: "Riepilogo Dati" (Settore Agonistico, Societa' appartenenza, Record classifica, the season's
   matches played/won/lost) and the "Storico
   Classifica" tab (date, position, points, category).

The page embeds the athlete list with the Δ of each period already computed; each athlete's history
is a separate file, `storico/<id>.json`, loaded only when the athlete is shown in the chart, so the
page stays light (about 2 MB, compressed to a fraction by GitHub Pages) whatever the filters.

A browser can't read portale.fitet.org directly (the site doesn't allow it), which is why
the data is collected by the script and published with the page.

## Troubleshooting

- **The workflow fails:** open the run in the Actions tab and look at the step in red.
  If "Scarica i dati" fails, the FITET portal may be unreachable or may have changed its
  structure (see "How the data is collected"); try again later with Run workflow.
- **An athlete has no club or history:** the script lists the athletes whose detail page failed
  in the log of the "Scarica i dati" step (`Failed`).
- **Weekly updates stop:** GitHub pauses scheduled workflows after 60 days without activity
  in the repository. The weekly commits prevent this, but if it happens you can re-enable
  it from the Actions tab.
