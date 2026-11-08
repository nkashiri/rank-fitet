#!/usr/bin/env node
// Scrapes the FITET national rankings, men's and women's (all Italian athletes), plus the extra athletes
// listed in atleti_extra.txt (e.g. foreign players, who have no national position), and writes a page
// charting their ranking history: the page embeds the athlete list, and each athlete's history goes in
// its own file (storico/<id>.json next to the page), loaded only when the athlete is selected.
//
// Usage: node fitet.js [output.html] [--limit N]
//        output defaults to site/index.html; --limit N only takes the top N athletes of each ranking (for testing).
//        node fitet.js --add "COGNOME NOME [gg/mm/aaaa]"   add a player to atleti_extra.txt
//        node fitet.js --remove "COGNOME NOME"             remove a player from it
// Requires Node 18+ (built-in fetch). No dependencies.

const fs = require('fs');
const path = require('path');

const BASE = 'https://portale.fitet.org';
const RANK = `${BASE}/risultati/new_rank`;
const CONCURRENCY = 4;
const EXTRA_FILE = path.join(__dirname, 'atleti_extra.txt');
const args = process.argv.slice(2);
const limitAt = args.indexOf('--limit');
const LIMIT = limitAt >= 0 ? +args.splice(limitAt, 2)[1] : Infinity;
const OUT = args[0] || path.join(__dirname, 'site', 'index.html');

const HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': `${RANK}/testaclassifica_auto.php`,
  'User-Agent': 'Mozilla/5.0 (fitet-chart)',
};

async function get(url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.text()).replace(/^﻿/, '');
    } catch (err) {
      if (i >= tries) throw new Error(`${url}: ${err.message}`);
      await new Promise(r => setTimeout(r, 1000 * i));
    }
  }
}

const strip = s => s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const cells = row => [...row.matchAll(/<td[^>]*>([^]*?)<\/td>/gi)].map(m => strip(m[1]));
const norm = s => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

async function pool(items, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }));
  return out;
}

// --- 1. National ranking: the latest ranking ID, from the "Classifiche" links in the portal menu ---

async function latestRankingId() {
  const menu = await get(`${BASE}/menu.php`);
  return Math.max(...[...menu.matchAll(/ID_CLASS=(\d+)/g)].map(m => +m[1]));
}

// One page (100 athletes) of the general men's (M) or women's (F) ranking, as shown on the portal's ranking page.
// Same list as fpdf2/excel_classifica.php, plus the athlete ID, sector and region.
async function rankingPage(rankId, sex, page) {
  const html = await get(`${RANK}/ranking_unica.php?SESSO=${sex}&ID_CLASS=${rankId}&ZU=1&TIPO=1&SETT=0&page=${page}&S=0&FQ=0&G=0&V=0`);
  const athletes = [];
  for (const row of html.split(/<tr/i).slice(1)) {
    const id = (row.match(/getScheda\((\d+)/) || [])[1];
    const c = cells(row);
    if (!id || c.length < 8) continue;
    const [pos, name, birth, sett, pts, diff, reg, cat] = c;
    athletes.push({ id, name, sex, birth, sett, reg, cat, pos: +pos, pts: parseFloat(pts) || 0, diff: +diff || 0 });
  }
  return { athletes, pages: +(html.match(/totalPages:\s*(\d+)/) || [])[1] || 1 };
}

async function ranking(rankId, sex) {
  const first = await rankingPage(rankId, sex, 1);
  const pages = Math.min(first.pages, Math.ceil(LIMIT / 100));
  const rest = await pool(Array.from({ length: pages - 1 }, (_, i) => i + 2), p => rankingPage(rankId, sex, p));
  return [first, ...rest].flatMap(p => p.athletes).slice(0, LIMIT);
}

// --- 2. Athlete detail: clubs, sector label, season matches, best position and ranking history ("Storico Classifica") ---

// The value cell next to a label in the "Riepilogo Dati" table, one entry per line.
function field(html, label) {
  const td = (html.split(`>${label}</p>`)[1] || '').match(/<td[^>]*>([^]*?)<\/td>/i);
  return td ? [...td[1].matchAll(/<p[^>]*>([^]*?)<\/p>/gi)].map(m => strip(m[1])).filter(Boolean) : [];
}

async function detail(id, rankId) {
  const url = `${RANK}/dettaglioatleta_unica.php?ATLETA=${id}&ID_CLASS=${rankId}&ZU=1&AVVERSARIO=0`;
  const html = await get(url);
  // The season's matches are on a separate static page, linked from a frame of the detail page.
  const matchSrc = (html.match(/src="([^"]*details_page_\d+\.html)"/) || [])[1];
  const frag = (html.split('id="fragment-4"')[1] || '').split('id="fragment-5"')[0];
  const history = [];
  for (const r of frag.matchAll(/<tr>([^]*?)<\/tr>/gi)) {
    const c = cells(r[1]);
    if (c.length >= 4 && /^\d{4}-\d{2}-\d{2}$/.test(c[0])) {
      history.push([c[0], +c[1] || null, +c[2] || null, c[3]]);  // [date, position, points, category]
    }
  }
  history.sort((a, b) => a[0].localeCompare(b[0]));
  // "Riepilogo Dati" season table: the last columns are matches played, won, lost and the portal's %
  // (not used: it is sometimes wrong). The protection column before them is not always there.
  const summary = (html.split('id="fragment-1"')[1] || '').split('id="fragment-3"')[0];
  const season = [...summary.matchAll(/<tr[^>]*>([^]*?)<\/tr>/gi)].map(r => cells(r[1])).find(c => c.length >= 7 && /^\d+$/.test(c[c.length - 2]));
  const [won, lost] = season ? season.slice(-3, -1).map(Number) : [0, 0];
  // "Record classifica": best position ever, e.g. "n.97 il 30/11/2017".
  const rec = (field(html, 'Record classifica')[0] || '').match(/n\.\s*(\d+)\s+il\s+(\d{2})\/(\d{2})\/(\d{4})/);
  return { clubs: field(html, "Societa' appartenenza"), sett: field(html, 'Settore Agonistico')[0], history,
    matchUrl: matchSrc ? new URL(matchSrc, url).href : null,
    won, lost, best: rec ? [+rec[1], `${rec[4]}-${rec[3]}-${rec[2]}`] : null,
    // For extra athletes, who are not in the ranking list: the "Dettaglio Punti" frame path names the ranking.
    reg: field(html, 'Regione')[0] || '', sex: /\/Femminile\//.test(html) ? 'F' : 'M' };
}

// --- 3. Season matches ("Incontri in campionato" and "Incontri in gare di torneo") ---

// [{d: ISO date, k: 'C' league | 'T' tournament, comp, gara, opp: name, win, off: not counted in the ranking}].
// The tables are told apart by their headers; columns are found by name, so their order does not matter.
async function matches(url) {
  const html = await get(url);
  const out = [];
  for (const table of html.split(/<table/i).slice(1)) {
    const head = [...(table.match(/<thead>([^]*?)<\/thead>/i) || [, ''])[1].matchAll(/<th[^>]*>([^]*?)<\/th>/gi)].map(m => strip(m[1]));
    const col = name => head.indexOf(name);
    const league = col('Campionato') >= 0, tourn = col('Nome gara') >= 0 && col('Fase') >= 0;
    if (!(league || tourn) || col('Nome avversario') < 0) continue;  // the points tables have no opponent
    for (const r of ((table.match(/<tbody>([^]*?)<\/tbody>/i) || [, ''])[1]).matchAll(/<tr([^>]*)>([^]*?)<\/tr>/gi)) {
      const c = cells(r[2]), dm = (c[col('Data')] || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (!dm) continue;
      out.push({ d: `${dm[3]}-${dm[2]}-${dm[1]}`, k: league ? 'C' : 'T',
        comp: c[col(league ? 'Campionato' : 'Competizione')] || '', gara: tourn ? `${c[col('Nome gara')] || ''} · ${c[col('Fase')] || ''}` : '',
        opp: c[col('Nome avversario')] || '', win: (c[col('Risultato')] || '').trim().toUpperCase() === 'V', off: /discarded/.test(r[1]) });
    }
  }
  return out.sort((a, b) => b.d.localeCompare(a.d));
}

// Writes partite/<id>.json for each athlete with matches. Opponents are named, not numbered: a name is linked to an
// athlete of the page when exactly one has it. Each row also gets the opponent's points and position at the last
// ranking before the match (so a "best win" means the strongest opponent at that time).
// Row: [date, 'C'|'T', competition, event · round, opponent, opponent id or '', 1 won | 0 lost, points, position, 1 = not counted].
function writeMatches(list, histories, all, dir) {
  const byName = new Map();
  for (const p of list) { const k = norm(p.name); byName.set(k, byName.has(k) ? null : p); }
  const at = (id, d) => { let r = null; for (const x of histories.get(id) || []) { if (x[0] <= d) r = x; else break; } return r; };
  for (const [id, ms] of all) {
    const rows = ms.map(m => {
      const o = byName.get(norm(m.opp)), h = o && at(o.id, m.d);
      return [m.d, m.k, m.comp, m.gara, m.opp, o ? o.id : '', m.win ? 1 : 0, h ? h[2] : null, h ? h[1] ?? h[4] ?? null : null, m.off ? 1 : 0];
    });
    fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(rows));
  }
}

// --- 4. Range of the projection: how athletes of the same sex, age and level actually moved ---

// For every athlete and month of the last 5 seasons: the ratio position after k months / position now (k = 1..12),
// grouped by sex, age band and position band. Stores the 10th, 25th, 50th, 75th and 90th percentiles of each group
// (as ratios), and the same without the age band as a fallback for small groups. The page multiplies the athlete's
// current position by them to draw the band.
const SIM_AGES = [12, 15, 18, 22, 30, 40, 50, Infinity];   // upper limits (exclusive): <12, 12-14, ..., 50+
const SIM_POS = [50, 150, 400, 1000, 2500, 5000, Infinity];
function similarRanges(list, histories) {
  const from = `${new Date().getUTCFullYear() - 5}-07-01`, groups = new Map();
  const add = (key, k, v) => { if (!groups.has(key)) groups.set(key, Array.from({ length: 12 }, () => [])); groups.get(key)[k - 1].push(v); };
  for (const p of list) {
    const m = (p.birth || '').match(/(\d{2})\/(\d{2})\/(\d{4})/), h = histories.get(p.id);
    if (!h) continue;
    const born = m ? Date.UTC(+m[3], m[2] - 1, +m[1]) : null;
    const months = new Map();  // last position of each month
    for (const x of h) { const v = x[1] ?? x[4]; if (v != null && x[0] >= from) months.set(x[0].slice(0, 7), [Date.parse(x[0]), v]); }
    const idx = [...months].map(([ym, [t, v]]) => ({ i: ym.slice(0, 4) * 12 + (ym.slice(5) - 1), t, v }));
    const byI = new Map(idx.map(x => [x.i, x]));
    for (const x of idx) {
      const pb = SIM_POS.findIndex(l => x.v <= l), ab = born == null ? -1 : SIM_AGES.findIndex(l => (x.t - born) / 31556952000 < l);
      for (let k = 1; k <= 12; k++) {
        const y = byI.get(x.i + k);
        if (!y) continue;
        add(`${p.sex}|${pb}`, k, y.v / x.v);
        if (ab >= 0) add(`${p.sex}|${pb}|${ab}`, k, y.v / x.v);
      }
    }
  }
  const q = (a, f) => a[Math.min(a.length - 1, Math.floor(f * a.length))];
  const out = {};
  for (const [key, ks] of groups) {
    if (ks[11].length < 30) continue;  // too few cases for 12 months ahead: use the fallback
    out[key] = ks.map(a => { a.sort((x, y) => x - y); return [0.1, 0.25, 0.5, 0.75, 0.9].map(f => Math.round(q(a, f) * 1000) / 1000); });
  }
  return { ages: SIM_AGES.slice(0, -1), pos: SIM_POS.slice(0, -1), q: out };
}

// --- Extra athletes (atleti_extra.txt: one "COGNOME NOME (gg/mm/aaaa)" per line, # for comments) ---

async function search(term) {
  return JSON.parse(await get(`${BASE}/ajax.php?term=${encodeURIComponent(term)}`) || '[]');
}

function parseExtra(line) {
  const m = line.trim().match(/^(.*?)\s*(?:\(?(\d{1,2}\/\d{1,2}\/\d{4})\)?)?$/);
  return { name: m[1].toUpperCase().replace(/\s+/g, ' '), birth: m[2] || '' };
}

function readExtras() {
  if (!fs.existsSync(EXTRA_FILE)) return [];
  return fs.readFileSync(EXTRA_FILE, 'utf8').split('\n')
    .map(l => l.replace(/#.*/, '').trim()).filter(Boolean).map(parseExtra);
}

// Athletes matching a name (and birth date, when given): [{id, name, birth}].
async function findAthletes(name, birth) {
  const res = [...await search(name), ...await search(name.split(/[\s-]/)[0])];
  const seen = new Set();
  const hits = res.filter(h => h.id && h.id !== '#' && norm(h.value) === norm(name) && !seen.has(h.id) && seen.add(h.id))
    .map(h => ({ id: h.id, name: h.value, birth: (strip(h.label).match(/\((\d{2}\/\d{2}\/\d{4})\)/) || [])[1] || '' }))
    .filter(h => !birth || h.birth === birth.replace(/\b(\d)\//g, '0$1/'));
  // Same name and birth date: one person with an old and a new card. Keep the one in the current ranking.
  if (hits.length > 1 && new Set(hits.map(h => h.birth)).size === 1) {
    for (const h of hits) {
      if (!(await get(`${BASE}/scheda_unica_i.php?ATLETA=${h.id}`)).includes('non e\' presente in questa classifica')) return [h];
    }
    return [hits[0]];
  }
  return hits;
}

// Adds or removes a line in atleti_extra.txt. Prints an Italian message (used as the GitHub
// issue reply) and exits 1 when nothing was changed.
async function editExtras(op, arg) {
  const { name, birth } = parseExtra(arg || '');
  const lines = fs.existsSync(EXTRA_FILE) ? fs.readFileSync(EXTRA_FILE, 'utf8').split('\n') : [];
  const matches = l => { const e = parseExtra(l.replace(/#.*/, '')); return e.name && norm(e.name) === norm(name) && (!birth || !e.birth || e.birth === birth); };
  if (!name) { console.log('Nome mancante.'); process.exit(1); }

  if (op === '--remove') {
    const kept = lines.filter(l => !matches(l));
    if (kept.length === lines.length) { console.log(`${name} non è nella lista degli atleti extra.`); process.exit(1); }
    fs.writeFileSync(EXTRA_FILE, kept.join('\n'));
    console.log(`Rimosso ${name} dagli atleti extra.`);
    return;
  }

  const hits = await findAthletes(name, birth);
  if (hits.length === 0) {
    console.log(`Nessun atleta trovato con il nome "${name}"${birth ? ` nato il ${birth}` : ''}. Controlla il nome su portale.fitet.org (prima il cognome, poi il nome).`);
    process.exit(1);
  }
  if (hits.length > 1) {
    console.log(`Ci sono più atleti con il nome "${name}". Riprova aggiungendo la data di nascita, ad esempio:\n` +
      hits.map(h => `- Aggiungi: ${h.name} ${h.birth}`).join('\n'));
    process.exit(1);
  }
  const line = `${hits[0].name} (${hits[0].birth})`;
  if (lines.some(matches)) { console.log(`${line} è già nella lista degli atleti extra.`); process.exit(1); }
  const body = lines.join('\n').replace(/\n*$/, '\n');
  fs.writeFileSync(EXTRA_FILE, (body === '\n' ? '' : body) + line + '\n');
  console.log(`Aggiunto ${line}. La pagina sarà aggiornata tra circa 3 minuti.`);
}

// --- Periods (the page's buttons): this season, since last season, since 3 seasons ago, everything ---

function periods(now = new Date()) {
  const y = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  const yy = n => String(n % 100).padStart(2, '0');
  return [
    { label: `Stagione ${yy(y)}/${yy(y + 1)}`, since: `${y}-07-01` },
    { label: `Da ${yy(y - 1)}/${yy(y)}`, since: `${y - 1}-07-01` },
    { label: `Da ${yy(y - 3)}/${yy(y - 2)}`, since: `${y - 3}-07-01` },
    { label: 'Tutto', since: '' },
  ];
}

// Change in points and position over each period: [[dPts, dPos], ...], null when unknown.
// Positive dPos = climbed. Old rankings have positions but no points, so each uses its own first value.
function deltas(history, ranges) {
  const last = history[history.length - 1];
  return ranges.map(({ since }) => {
    const h = history.filter(x => x[0] >= since);
    const firstPos = h.find(x => x[1] != null), firstPts = h.find(x => x[2] != null);
    return [
      firstPts && last[2] != null ? Math.round((last[2] - firstPts[2]) * 100) / 100 : null,
      firstPos && last[1] != null ? firstPos[1] - last[1] : null,
    ];
  });
}

// Last position of each category (1ª, 2ª, ...) in the current ranking of one sex. FITET assigns categories from
// the ranking at the start of the season and they overlap afterwards, so for each pair this is the position
// that best separates them: the fewest athletes of 1..k below it plus athletes of k+1.. above it.
function catLimits(list, sex) {
  const a = list.filter(p => p.sex === sex && p.pos && +p.cat).map(p => [p.pos, +p.cat]).sort((x, y) => x[0] - y[0]);
  const n = Math.max(0, ...a.map(x => x[1]));
  const limits = [];
  for (let k = 1; k < n; k++) {
    let err = a.filter(x => x[1] <= k).length, best = [err, 0];
    for (const [pos, c] of a) { err += c <= k ? -1 : 1; if (err < best[0]) best = [err, pos]; }
    limits.push(best[1]);
  }
  return limits;
}

// Foreign athletes have points but no position: adds to each of their history rows (as a 5th value) the
// position they would have had, from the Italians of the same sex at the same ranking date
// (the position of the last Italian with more points, + 1). Returns the latest estimate.
function estimatePositions(list, histories) {
  const scale = new Map();  // "sex date" -> [[pts, pos], ...], most points first
  for (const p of list) {
    for (const [date, pos, pts] of histories.get(p.id) || []) {
      if (pos == null || pts == null) continue;
      const k = `${p.sex} ${date}`;
      if (!scale.has(k)) scale.set(k, []);
      scale.get(k).push([pts, pos]);
    }
  }
  for (const s of scale.values()) s.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (const p of list) {
    const h = histories.get(p.id);
    if (!p.extra || p.pos != null || !h || !h.length) continue;
    for (const x of h) {
      const s = scale.get(`${p.sex} ${x[0]}`);
      if (x[1] != null || x[2] == null || !s) continue;
      let lo = 0, hi = s.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (s[m][0] > x[2]) lo = m + 1; else hi = m; }
      x[4] = lo ? s[lo - 1][1] + 1 : 1;
    }
    p.estPos = h[h.length - 1][4] ?? null;
  }
}

// Change since the previous ranking (the latest date before rankDate in any history): [dPts, dPos] per athlete,
// null when they were not in it. Positive dPos = climbed. Uses the estimated position of foreign athletes.
function sinceLast(list, histories, rankDate) {
  let prevDate = '';
  for (const h of histories.values()) for (const x of h) if (x[0] < rankDate && x[0] > prevDate) prevDate = x[0];
  for (const p of list) {
    const h = histories.get(p.id) || [];
    const a = h.find(x => x[0] === prevDate), b = h.find(x => x[0] === rankDate);
    const pos = x => x[1] ?? x[4] ?? null;
    p.last = a && b ? [a[2] != null && b[2] != null ? Math.round((b[2] - a[2]) * 100) / 100 : null,
      pos(a) != null && pos(b) != null ? pos(a) - pos(b) : null] : null;
  }
  return prevDate;
}

// Refuses to publish a scrape that looks broken (portal down or changed): far fewer athletes than the
// previous page in the repository, or many failed detail pages. The workflow then fails and GitHub
// emails the owner, and the previous page stays online. FORCE=1 skips the check.
function checkScrape(list, failed) {
  if (process.env.FORCE === '1' || LIMIT !== Infinity) return;
  const prevFile = path.join(__dirname, 'index.html');
  const prev = fs.existsSync(prevFile) ? (fs.readFileSync(prevFile, 'utf8').match(/"id":"\d+"/g) || []).length : 0;
  const problems = [];
  if (prev && list.length < prev * 0.9) problems.push(`${list.length} athletes, previous page had ${prev}`);
  if (failed.length > Math.max(50, list.length * 0.02)) problems.push(`${failed.length} detail pages failed`);
  if (problems.length) throw new Error(`Scrape looks broken, not publishing: ${problems.join('; ')}. Run with FORCE=1 to publish anyway.`);
}

// Date of the last change to the page code (template.html), shown in the footer: from the GitHub API when the
// repository is known (the workflow's checkout has no history), otherwise from the local git history.
async function templateDate(repo) {
  try {
    if (repo) {
      const res = await fetch(`https://api.github.com/repos/${repo}/commits?path=template.html&per_page=1`,
        { headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {} });
      if (res.ok) return (await res.json())[0]?.commit?.committer?.date || '';
    }
    return require('child_process').execSync('git log -1 --format=%cI -- template.html', { cwd: __dirname, encoding: 'utf8' }).trim();
  } catch { return ''; }
}

// --- main ---

(async () => {
  if (args[0] === '--add' || args[0] === '--remove') return editExtras(args[0], args[1]);

  const rankId = await latestRankingId();
  console.log(`Fetching national rankings ${rankId}...`);
  const list = [];
  for (const sex of ['M', 'F']) {
    const l = await ranking(rankId, sex);
    console.log(`  ${sex}: ${l.length} athletes`);
    list.push(...l);
  }

  // Extra athletes: marked if already in the ranking, otherwise added (their details come from the detail page).
  const extras = readExtras();
  if (extras.length) console.log(`Finding ${extras.length} extra athletes...`);
  const byId = new Map(list.map(p => [p.id, p]));
  await pool(extras, async e => {
    try {
      const hit = (await findAthletes(e.name, e.birth))[0];
      if (!hit) { console.log(`  Extra not found: ${e.name} ${e.birth}`); return; }
      if (!byId.has(hit.id)) {
        byId.set(hit.id, { id: hit.id, name: hit.name, sex: '', birth: hit.birth, sett: '', reg: '', cat: '', pos: null, pts: null, diff: 0 });
        list.push(byId.get(hit.id));
      }
      byId.get(hit.id).extra = true;
    } catch (err) {
      console.log(`  Extra failed: ${e.name} (${err.message})`);
    }
  });

  const dir = path.join(path.dirname(path.resolve(OUT)), 'storico');
  const matchDir = path.join(path.dirname(path.resolve(OUT)), 'partite');
  for (const d of [dir, matchDir]) { fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); }

  const ranges = periods();
  const histories = new Map(), allMatches = new Map();
  let done = 0, failed = [], matchFailed = 0, rankDate = '';
  await pool(list, async p => {
    try {
      const d = await detail(p.id, rankId);
      p.clubs = d.clubs;
      if (d.sett) p.sett = d.sett;
      p.delta = d.history.length ? deltas(d.history, ranges) : null;
      p.won = d.won; p.lost = d.lost; p.best = d.best;
      if (p.pos == null) {  // extra athlete, not in the ranking list
        const last = d.history[d.history.length - 1] || [];
        Object.assign(p, { sex: d.sex, reg: d.reg, pts: last[2] ?? null, cat: last[3] || '' });
      }
      if (d.history.length && d.history[d.history.length - 1][0] > rankDate) rankDate = d.history[d.history.length - 1][0];
      histories.set(p.id, d.history);
      if (d.matchUrl && d.won + d.lost > 0) {  // no matches this season: no page to fetch
        try { allMatches.set(p.id, await matches(d.matchUrl)); } catch { matchFailed++; }
      }
    } catch (err) {
      failed.push(`${p.name} (${err.message})`);
      p.clubs = []; p.delta = null; p.won = p.lost = 0; p.best = null;
    }
    if (++done % 500 === 0) console.log(`  ${done}/${list.length}`);
  });
  if (failed.length) console.log(`Failed (${failed.length}): ${failed.slice(0, 50).join(', ')}${failed.length > 50 ? ', ...' : ''}`);
  console.log(`Matches: ${allMatches.size} athletes${matchFailed ? `, ${matchFailed} match pages failed` : ''}`);
  checkScrape(list, failed);

  estimatePositions(list, histories);
  const prevDate = sinceLast(list, histories, rankDate);
  for (const p of list) {
    const h = histories.get(p.id);
    if (p.estPos != null) p.delta = deltas(h.map(x => [x[0], x[1] ?? x[4] ?? null, x[2]]), ranges);
    if (h) fs.writeFileSync(path.join(dir, `${p.id}.json`), JSON.stringify(h));
    p.nm = allMatches.get(p.id)?.length || 0;  // number of season matches (0: no partite file)
  }
  writeMatches(list, histories, allMatches, matchDir);

  const repo = process.env.GITHUB_REPOSITORY || '';
  const data = {
    generated: new Date().toISOString(),
    repo, rankId, rankDate, prevDate, ranges, templateDate: await templateDate(repo),
    cats: { M: catLimits(list, 'M'), F: catLimits(list, 'F') },
    sim: similarRanges(list, histories),
    players: list,
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  // Absolute page address for the link previews (WhatsApp, Facebook, ...), which need a full URL for the image:
  // the custom domain when the repository has a CNAME file (e.g. "fitet.eu.org"), otherwise the github.io address.
  const [owner, name] = repo.split('/');
  const cname = fs.existsSync(path.join(__dirname, 'CNAME')) ? fs.readFileSync(path.join(__dirname, 'CNAME'), 'utf8').trim() : '';
  const site = cname ? `https://${cname}/` : repo ? `https://${owner.toLowerCase()}.github.io/${name}/` : '';
  const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  fs.writeFileSync(OUT, template.replace('/*__DATA__*/null', json).replaceAll('__SITE__', site));
  const outDir = path.dirname(path.resolve(OUT));
  if (outDir !== __dirname && fs.existsSync(path.join(__dirname, 'og.png'))) fs.copyFileSync(path.join(__dirname, 'og.png'), path.join(outDir, 'og.png'));
  console.log(`Wrote ${OUT} and ${list.length - failed.length} histories in ${dir}`);
})().catch(err => { console.error(err); process.exit(1); });
