#!/usr/bin/env node
// Scrapes the FITET national rankings, men's and women's (all Italian athletes), and writes a page charting
// their ranking history: the page embeds the athlete list, and each athlete's history goes in
// its own file (storico/<id>.json next to the page), loaded only when the athlete is selected.
//
// Usage: node fitet_liguria.js [output.html] [--limit N]
//        output defaults to site/index.html; --limit N only takes the top N athletes of each ranking (for testing).
// Requires Node 18+ (built-in fetch). No dependencies.

const fs = require('fs');
const path = require('path');

const BASE = 'https://portale.fitet.org';
const RANK = `${BASE}/risultati/new_rank`;
const CONCURRENCY = 4;
const args = process.argv.slice(2);
const limitAt = args.indexOf('--limit');
const LIMIT = limitAt >= 0 ? +args.splice(limitAt, 2)[1] : Infinity;
const OUT = args[0] || path.join(__dirname, 'site', 'index.html');

const HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': `${RANK}/testaclassifica_auto.php`,
  'User-Agent': 'Mozilla/5.0 (fitet-liguria-chart)',
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
    won, lost, best: rec ? [+rec[1], `${rec[4]}-${rec[3]}-${rec[2]}`] : null };
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

// Form: change in points over the last 3 ranking updates (monthly), within the current season:
// points are reset every July 1, so comparing across that date means nothing.
function form(history, since) {
  const h = history.filter(x => x[2] != null && x[0] >= since);
  return h.length > 1 ? Math.round((h[h.length - 1][2] - h[Math.max(0, h.length - 4)][2]) * 100) / 100 : null;
}

// --- main ---

(async () => {
  const rankId = await latestRankingId();
  console.log(`Fetching national rankings ${rankId}...`);
  const list = [];
  for (const sex of ['M', 'F']) {
    const l = await ranking(rankId, sex);
    console.log(`  ${sex}: ${l.length} athletes`);
    list.push(...l);
  }

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
      p.form = form(d.history, ranges[0].since);
      p.won = d.won; p.lost = d.lost; p.best = d.best;
      if (d.history.length && d.history[d.history.length - 1][0] > rankDate) rankDate = d.history[d.history.length - 1][0];
      fs.writeFileSync(path.join(dir, `${p.id}.json`), JSON.stringify(d.history));
    } catch (err) {
      failed.push(`${p.name} (${err.message})`);
      p.clubs = []; p.delta = null; p.form = null; p.won = p.lost = 0; p.best = null;
    }
    if (++done % 500 === 0) console.log(`  ${done}/${list.length}`);
  });
  if (failed.length) console.log(`Failed (${failed.length}): ${failed.slice(0, 50).join(', ')}${failed.length > 50 ? ', ...' : ''}`);

  const data = {
    generated: new Date().toISOString(),
    rankId, rankDate, ranges,
    players: list,
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  fs.writeFileSync(OUT, template.replace('/*__DATA__*/null', json));
  console.log(`Wrote ${OUT} and ${list.length - failed.length} histories in ${dir}`);
})().catch(err => { console.error(err); process.exit(1); });
