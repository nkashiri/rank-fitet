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
  const html = await get(`${RANK}/dettaglioatleta_unica.php?ATLETA=${id}&ID_CLASS=${rankId}&ZU=1&AVVERSARIO=0`);
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
    won, lost, best: rec ? [+rec[1], `${rec[4]}-${rec[3]}-${rec[2]}`] : null,
    // For extra athletes, who are not in the ranking list: the "Dettaglio Punti" frame path names the ranking.
    reg: field(html, 'Regione')[0] || '', sex: /\/Femminile\//.test(html) ? 'F' : 'M' };
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
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const ranges = periods();
  let done = 0, failed = [], rankDate = '';
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
      fs.writeFileSync(path.join(dir, `${p.id}.json`), JSON.stringify(d.history));
    } catch (err) {
      failed.push(`${p.name} (${err.message})`);
      p.clubs = []; p.delta = null; p.won = p.lost = 0; p.best = null;
    }
    if (++done % 500 === 0) console.log(`  ${done}/${list.length}`);
  });
  if (failed.length) console.log(`Failed (${failed.length}): ${failed.slice(0, 50).join(', ')}${failed.length > 50 ? ', ...' : ''}`);

  const data = {
    generated: new Date().toISOString(),
    repo: process.env.GITHUB_REPOSITORY || '',
    rankId, rankDate, ranges,
    players: list,
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  fs.writeFileSync(OUT, template.replace('/*__DATA__*/null', json));
  console.log(`Wrote ${OUT} and ${list.length - failed.length} histories in ${dir}`);
})().catch(err => { console.error(err); process.exit(1); });
