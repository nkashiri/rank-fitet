**English** | [Italiano](README.it.md)

# FITET: athletes' ranking progress

A chart of the ranking progress (points and position) of all the athletes in the Italian men's
and women's table tennis rankings (about 8,900 men and 900 women), with data from [portale.fitet.org](https://portale.fitet.org).

**Page:** https://nkashiri.github.io/rank-fitet/ (the page itself is in Italian)

## Using the page

- **Filters:** Sesso (gender: both by default, or only Maschile / Femminile), Settore (sector: Seniores, Master, Giovanili, ...), Società (club), Regione (region),
  Categoria (category) and Elenco (national rankings or extra athletes). Each one can take several values; the number next to each value is how
  many athletes it would add given the other filters. The Società list has a search box.
  With no filter chosen the table lists everyone (300 rows at a time: **Mostra altri** for more).
- On the first visit the page opens on Regione = Liguria; **Azzera filtri** clears all filters.
- The filters, the selected athletes, the metric and the period are kept in the page address:
  bookmark or share it to come back to the same view.
- Click rows in the table (or focus a row and press Enter) to add or remove athletes from the chart,
  or use **Top 8** for the 8 athletes with the most points among those filtered. On the first visit the chart
  shows the top 8 of the default region.
- **Athlete profile (ⓘ next to the name):** points, position and their change in the selected period, category,
  change since the previous ranking, win %, best position; the athlete's rank by points among those born the same
  year, in their club, region, category and sector (same gender); and the distance from the estimated category
  thresholds above and below. **Condividi** shares the link (or copies it), which reopens the profile with the athlete
  in the chart.
  The profile also lists the **season's matches** (league and tournaments, from the portal), with the best wins and
  the heaviest losses (by the opponent's points at the ranking before the match), and a **Confronto diretto**
  (head-to-head) with any selected athlete or season opponent: key figures side by side and their matches this season.
- **Chi sale e chi scende** (movers): the 10 biggest climbs and falls among the filtered athletes, since the previous
  ranking or over one of the periods (buttons in the card). By default they are ordered by the absolute change
  (points or positions gained or lost); **Percentuale** orders them by the percentage change instead,
  (starting − current) / starting, so a jump near the top counts as much as a longer one further down.
  Click a name for the profile.
- **Club and region card:** choose exactly one club in Società (or one region in Regione) to see a card with the
  number of athletes, average points, average age, win %, the best athletes and the biggest improvers, and the counts
  by category and sector. The region card also ranks its clubs by strength (sum of the points of their 4 best
  athletes); click a club to open its card.
- **Per stagione:** a chart axis that draws one line per season of the athlete chosen in the analysis, aligned on
  July 1 (the points restart every July 1, so seasons are comparable); the last 5 are shown, older ones in the legend.
- **Range of the projection:** with Proiezione 12 mesi, the position chart also shows a shaded band: where athletes
  of the same sex, age band and position band actually were after 1–12 months, over the last 5 seasons (darker 25–75%
  of cases, lighter 10–90%). The analysis's Previsione box gives the same figures for 12 months.
- **Zoom / Sposta** (buttons with icons above the chart, for all charts): with **Zoom** drag a box to zoom in
  (Shift+drag pans), with **Sposta** drag to move around; Ctrl+wheel zooms in both. Click the active button again to
  turn it off. Double click or **Reimposta zoom** to go back. With a mouse Zoom is on by default and switching keeps
  the current zoom. On phones both start off, so the page scrolls normally: Zoom enables two-finger zoom, Sposta also
  one-finger dragging (switching redraws the charts).
- **Downloads:** **Scarica PNG** saves the main chart as an image; **Scarica CSV** (under the table) saves all the
  filtered athletes in the table's order, for Excel (semicolons, decimal commas).
- **Punti / Posizione**: the chart metric, points or position in the national ranking (the men's or the women's one).
  The analyses follow it too (Chi sale e chi scende, club and region cards, head-to-head, the analysis's month-by-month
  chart), but points restart every July 1, so they use points only within the current season: over longer periods,
  and for the 12-month projection, moving averages, year by year and the forecast, they use the position, and the page
  says so.
- **Period** (this season, since last season, since three seasons ago, everything): the Δ columns
  show the change over that period. The buttons follow the season (from July 1) automatically.
  Points are reset every July 1, so Δ Punti over more than one season mixes different seasons' scales;
  Δ Pos. is comparable across seasons.
- **Distribuzione dei punti:** a histogram of the current points of the filtered athletes; a colored
  line marks each selected athlete, listed below with their rank and percentile in the group.
- **Other columns:** **% vitt.** (win percentage this season; matches won and lost in the tooltip) and
  **Miglior pos.** (best position ever, with the year; the date is in the tooltip).
  **#** numbers the rows in the table's current order, so it is the position among the filtered athletes.
- **Per data / Per età / Per anni in classifica:** the chart's horizontal axis. *Per età* aligns athletes by
  age (ranking date − birth date), to compare a 12-year-old today with what an older athlete did at 12;
  *Per anni in classifica* aligns them by years since their first ranking (the portal's history starts in July 2011).
  Both show the whole history. When the selected athletes are more than 3 years apart, a banner offers the age view.
- **Position chart:** dashed horizontal lines where the categories change (1ª … 6ª men, 1ª … 5ª women),
  estimated from the current ranking: the position that best separates two categories, since categories
  are set at the start of the season and overlap afterwards. Triangles mark category changes
  (green ▲ promotion, red ▼ relegation). **Proiezione 12 mesi** draws a dotted projection of the next 12 months.
- **Analisi della posizione** (below the chart, for one of the selected athletes):
  - month-by-month improvement, migl. % = (previous position − position) / previous position × 100,
    using the last ranking of each month (a gap of several months is split evenly);
  - moving averages over 6 and 12 months, with the overall average dashed;
  - **Previsione:** months to a target position (10° by default) at the current pace,
    months = log(target / start) / log(1 − rate), with rate = average of the last 12 months;
    also the linear trend of the last 12 months (positions per month) with its R².
    The projection on the chart uses the same rate;
  - year by year: average monthly %, start and end position, gain and best position;
  - the list of category changes.

## Data updates

Downloading the data and building the pages are separate steps: the data is saved in the **`data` branch**, and the
pages are built from it. A change to the pages or the scripts doesn't download anything again.

- **Rankings ("Aggiorna classifica"):** automatically on the 1st of every month at 06:00 UTC (07:00 or 08:00 in Italy);
  FITET publishes a new ranking about once a month. Saves the new data in the `data` branch, then publishes the site.
- **Rubbers and blades ("Aggiorna materiali"):** on the 1st of every month at 07:00 UTC, independently: if one
  source fails, the other is still updated.
- **Manual:** [Actions](https://github.com/nkashiri/rank-fitet/actions) tab → the workflow → **Run workflow**.
- **Pages and scripts ("Pubblica sito"):** pushing a change to `template.html`, `materiali.html`, `fitet.js`,
  `revspin.js`, `og.png` or `CNAME` rebuilds and publishes the site from the saved data in about a minute.
- **History:** each update is a commit in the `data` branch ("Classifica ...", "Materiali ..."), so the previous
  data is kept.
- **Safety check:** an update refuses to save if the scrape has fewer than 90% of the athletes (or products) of the
  saved data, or if more than 2% (at least 50) of the athlete pages failed. The workflow then fails, GitHub emails
  the repository owner, and the site stays as it was. To save anyway, run the script with `FORCE=1` (in the workflow:
  add `FORCE: 1` to the `env` of the download step, run, then remove it).

## Footer: updates and visits

- The footer shows when the data was last updated (date and time of the scrape) and when the page code
  (`template.html`) was last changed (from the GitHub API at build time).
- **Visits:** counted with [Abacus](https://abacus.jasoncameron.dev), a free counter service that needs no account:
  one visit per browser per day, only on the published site (not in local copies), with today's count in brackets.
  The count starts on 08/11/2026. It is a free hobby service: if it stops answering, the counter is simply not shown.
  The counter lives at `abacus.jasoncameron.dev/get/nkashiri-rank-fitet/visite`.

## Phones and link previews

- The page adapts to phones: filters two per row, scrollable button groups, a shorter chart and fewer table
  columns (the full data is in the athlete profile).
- Links shared on WhatsApp, Facebook, Telegram etc. show a preview card with `og.png` (1200×630). To change the
  image, replace `og.png` in the repository: the next update publishes it.

## Foreign players and extra athletes (not in the national rankings)

Foreign players have points and a ranking history but no national position. The page includes all of them by
default, from the portal's "Stranieri" lists (men's and women's); the "Elenco" filter can show only them. They have,
in italics, a fictitious position (≈): the one an Italian with the same points would have had, at each ranking
date. The chart and the analysis use it too, marked as estimated.

Other athletes in neither list (e.g. a foreign player no longer in the Stranieri list) can be listed in
`atleti_extra.txt`, one per line: `SURNAME NAME (dd/mm/yyyy)`. In the table they have the "extra" label.

- **Add:** on the page, type the name in "Aggiungi un atleta" and click **Aggiungi atleta**;
  GitHub opens with the request already filled in: click **Create**.
  After about 3 minutes the athlete appears in the table.
- **Remove:** click the red **×** next to "extra" in the athlete's row, then **Create**.
- The reply in the issue says whether it worked. If several athletes share the name, it
  lists their birth dates: try again with `SURNAME NAME dd/mm/yyyy`.
- You can also edit `atleti_extra.txt` directly on GitHub (pencil icon → Commit), then run "Aggiorna classifica" to update the page.
- Only the repository owner and collaborators can add or remove athletes;
  requests from other users are ignored.

## Rubbers and blades subpage

**Page:** https://nkashiri.github.io/rank-fitet/materiali/ (linked from the main page header, "Gomme e telai")

The user ratings of the rubbers and blades on [revspin.net](https://revspin.net), to filter and compare.
Only the models with at least 10 ratings are included (revspin's own threshold for its top lists):
about 600 rubbers and 560 blades.

- **Gomme / Telai** switches between rubbers and blades; the search box filters by name.
- **Filters:** Marca (brand); for rubbers Tipo (tensor, non tensor, anti); for blades Strati (plies) and
  Materiali (fibre family, from the manufacturer's materials: Carbonio, Arylate, Zylon, Kevlar, other fibres, all-wood);
  **Parametri** sets a min and/or max for every rating, the number of ratings, the price and the blade weight.
- **Table:** click a header to sort; the shading of each rating column is relative to its range. The ↗ link opens
  the model on revspin.net.
- **Comparison:** click up to 6 rows to compare them in a radar chart and a side-by-side table (best value of the
  "more is better" ratings highlighted). The chips under the radar choose its axes. The compared models are kept
  in the address (e.g. `materiali/#gomme=...`), so a comparison can be shared.

Data: `revspin.js` reads revspin's full lists (brands), its top lists (all the ratings, 100 per page) and, once per
model, the product page for the manufacturer's details (blade weight, plies, materials; rubber tensor/anti), cached in
`dettagli.json` (`data` branch) so a monthly run only fetches new models. The ratings are saved in `materiali.json`
(`data` branch) by their own workflow, "Aggiorna materiali".

```
node revspin.js --fetch              # downloads into data/materiali.json (and data/dettagli.json)
node revspin.js --build              # writes site/materiali/index.html from data/, no download
node revspin.js --fetch --limit 20   # fetch at most 20 new product pages (quick test)
```

## Files

Branch `main` (code and pages):

- `fitet.js`: downloads the rankings (`--fetch`) and builds the page (`--build`).
- `template.html`: the page (chart and table) the data is inserted into.
- `revspin.js`, `materiali.html`: the same for the rubbers and blades subpage.
- `atleti_extra.txt`: extra athletes.
- `og.png`: the image of the link previews.
- `.github/workflows/update.yml`: monthly (or manual) rankings update.
- `.github/workflows/materiali.yml`: monthly (or manual) rubbers and blades update.
- `.github/workflows/build.yml`: builds the pages from the saved data and publishes them on GitHub Pages.
- `.github/workflows/extra.yml`: handles the "Aggiungi:" / "Rimuovi:" requests opened from the page.

Branch `data` (written by the workflows, don't edit it by hand):

- `fitet.json`: the athlete list and the statistics of the page.
- `storico/<id>.json` (ranking history) and `partite/<id>.json` (season matches) for each athlete, copied next
  to the published page.
- `materiali.json`, `dettagli.json`: the rubber and blade ratings, and the cache of the manufacturer's details.

## Running locally (Node 18+, no dependencies)

The scripts read and write the data in `data/`. To work on the pages with the published data, check out the
`data` branch there first:

```
git fetch origin data && git worktree add data data   # the published data in data/
node fitet.js --build                # writes site/index.html (+ storico/, partite/) from data/, no download
node revspin.js --build              # writes site/materiali/index.html
node fitet.js --fetch                # downloads the rankings into data/ (about 10 minutes)
node fitet.js                        # both
node fitet.js --fetch --limit 200    # only the top 200 of each list (quick test)
node fitet.js --add "ROSSI MARIO"    # adds an athlete to atleti_extra.txt
node fitet.js --remove "ROSSI MARIO" # removes them
```

In a local copy the "Aggiungi atleta" form doesn't appear (it needs GitHub).

The page loads the histories from `storico/`, which a browser doesn't allow from a file opened
directly: serve the folder, e.g. `cd site && python3 -m http.server`, then open http://localhost:8000.

## How the data is collected

1. `menu.php`: the latest ranking ID (`ID_CLASS`, the highest in the "Classifiche" links).
2. `risultati/new_rank/ranking_unica.php?SESSO=<M|F>&ID_CLASS=<id>&TIPO=1&page=<n>`: the general men's
   and women's rankings, 100 athletes per page (the same list as `fpdf2/excel_classifica.php`, plus the athlete ID).
   It needs the `X-Requested-With: XMLHttpRequest` and `Referer` headers. With `TIPO=0&S=1` instead of `TIPO=1`:
   the "Stranieri" lists (foreign players), whose position is within that list.
3. `risultati/new_rank/dettaglioatleta_unica.php?ATLETA=<id>&ID_CLASS=<id>&ZU=1&AVVERSARIO=0`, one
   per athlete: "Riepilogo Dati" (Settore Agonistico, Societa' appartenenza, Record classifica, the season's
   matches played/won/lost) and the "Storico
   Classifica" tab (date, position, points, category).
4. For athletes with matches this season: the static page linked from a frame of the detail page
   (`risultati/new_rank/html/<ranking>/<Maschile|Femminile>/.../details_page_<n>.html`), with the tables
   "Incontri in campionato" and "Incontri in gare di torneo" (date, competition, opponent, round, result; matches
   not counted for the ranking are marked). Opponents are named, not numbered: a name is linked to an athlete of the
   page when exactly one has it. This roughly doubles the time of the scrape.

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
  in the repository. The monthly commits prevent this, but if it happens you can re-enable
  it from the Actions tab.
