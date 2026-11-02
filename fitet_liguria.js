#!/usr/bin/env node
// Scrapes the FITET portal for the athletes of the Liguria regional championships
// and writes a self-contained HTML page charting their ranking history.
//
// Usage: node fitet_liguria.js [output.html]
//        node fitet_liguria.js --add "COGNOME NOME [gg/mm/aaaa]"   add a player to atleti_extra.txt
//        node fitet_liguria.js --remove "COGNOME NOME"             remove a player from it
// Requires Node 18+ (built-in fetch). No dependencies.

const fs = require('fs');
const path = require('path');

const BASE = 'https://portale.fitet.org';
const CAMS = [301, 302, 303, 304, 305, 306, 307];
const CONCURRENCY = 4;
const EXTRA_FILE = path.join(__dirname, 'atleti_extra.txt');
const OUT = (!process.argv[2]?.startsWith('--') && process.argv[2]) || path.join(__dirname, 'fitet_liguria.html');

const HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': `${BASE}/cerca.php`,
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

// --- 1. Championship athletes ("Statistiche atleti") ---

async function championship(cam) {
  const head = await get(`${BASE}/risultati/campionati/testa_campionati.php?CAM=${cam}&CONC=0`);
  const title = (strip(head).match(/CAMPIONATO[^]*?(?=\s+Calendario)/) || [`CAM ${cam}`])[0];
  const html = await get(`${BASE}/risultati/campionati/statistiche_atleti.php?CAM=${cam}`);
  const athletes = [];
  for (const row of html.split(/<tr>/i).slice(1)) {
    const cells = [...row.matchAll(/<td[^>]*>([^]*?)<\/td>/gi)].map(m => strip(m[1]));
    if (cells.length < 12 || !/^\d+$/.test(cells[3])) continue;
    const [, name, club, pd, pav, pv, pp, sv, sp, ptv, ptp, pct] = cells;
    athletes.push({ name, club, played: +pav, won: +pv, lost: +pp, pct: parseFloat(pct) || 0 });
  }
  return { cam, title: title.replace(/^CAMPIONATO\s+/, ''), athletes };
}

// --- 2. Resolve athlete IDs via the search autocomplete ---

async function search(term) {
  return JSON.parse(await get(`${BASE}/ajax.php?term=${encodeURIComponent(term)}`) || '[]');
}

async function resolveId(name, cam) {
  let hits = (await search(name)).filter(h => h.id && h.id !== '#' && norm(h.value) === norm(name));
  // The search chokes on some punctuation (e.g. hyphens): retry with the surname only.
  if (hits.length === 0) {
    hits = (await search(name.split(/[\s-]/)[0])).filter(h => h.id && h.id !== '#' && norm(h.value) === norm(name));
  }
  if (hits.length === 0) return null;
  if (hits.length === 1) return { id: hits[0].id };
  // Homonyms: pick the one whose card lists this championship.
  for (const h of hits) {
    const card = await get(`${BASE}/scheda_unica_i.php?ATLETA=${h.id}`);
    if (card.includes(`CAM=${cam}&`)) return { id: h.id, card };
  }
  return { id: hits[0].id };
}

// --- Extra players (atleti_extra.txt: one "COGNOME NOME (gg/mm/aaaa)" per line, # for comments) ---

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

// --- 3. Ranking history ("Storico Classifica") ---

// Latest ranking ID, from the "Classifiche" links in the portal menu. Used for athletes
// whose card has no ranking link (unranked "FQ"), whose history is still available.
async function latestRankingId() {
  const menu = await get(`${BASE}/menu.php`);
  return Math.max(...[...menu.matchAll(/ID_CLASS=(\d+)/g)].map(m => +m[1]));
}

async function history(id, card, rankId) {
  card = card || await get(`${BASE}/scheda_unica_i.php?ATLETA=${id}`);
  const m = card.match(/getScheda\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/) || [null, id, rankId, 0, 0];
  const tessera = (strip(card).match(/\((\d{5,})\)/) || [])[1] || '';
  const detail = await get(`${BASE}/risultati/new_rank/dettaglioatleta_unica.php?ATLETA=${m[1]}&ID_CLASS=${m[2]}&ZU=${m[3]}&AVVERSARIO=${m[4]}`);
  const frag = (detail.split('id="fragment-4"')[1] || '').split('id="fragment-5"')[0];
  const points = [];
  for (const r of frag.matchAll(/<tr>([^]*?)<\/tr>/gi)) {
    const c = [...r[1].matchAll(/<td[^>]*>([^]*?)<\/td>/gi)].map(x => strip(x[1]));
    if (c.length >= 4 && /^\d{4}-\d{2}-\d{2}$/.test(c[0])) {
      points.push({ d: c[0], pos: +c[1] || null, pts: +c[2] || null, cat: c[3] });
    }
  }
  points.sort((a, b) => a.d.localeCompare(b.d));
  return { tessera, points };
}

// --- main ---

(async () => {
  if (process.argv[2] === '--add' || process.argv[2] === '--remove') return editExtras(process.argv[2], process.argv[3]);

  console.log('Fetching championships...');
  const champs = await pool(CAMS, championship);
  const players = new Map();
  for (const ch of champs) {
    console.log(`  ${ch.cam} ${ch.title}: ${ch.athletes.length} athletes`);
    for (const a of ch.athletes) {
      const key = norm(a.name) + '|' + norm(a.club);
      if (!players.has(key)) players.set(key, { name: a.name, club: a.club, cam: ch.cam, champs: [] });
      players.get(key).champs.push({ cam: ch.cam, title: ch.title, played: a.played, won: a.won, lost: a.lost, pct: a.pct });
    }
  }

  const list = [...players.values()];
  const rankId = await latestRankingId();
  console.log(`Fetching ranking history for ${list.length} athletes (ranking ${rankId})...`);
  let done = 0, missing = [];
  await pool(list, async p => {
    try {
      const r = await resolveId(p.name, p.cam);
      if (!r) { missing.push(p.name); p.history = []; return; }
      p.id = r.id;
      const h = await history(r.id, r.card, rankId);
      p.tessera = h.tessera;
      p.history = h.points;
    } catch (err) {
      missing.push(`${p.name} (${err.message})`);
      p.history = [];
    }
    if (++done % 20 === 0) console.log(`  ${done}/${list.length}`);
  });
  if (missing.length) console.log(`Not resolved (${missing.length}): ${missing.join(', ')}`);

  const extras = readExtras();
  if (extras.length) console.log(`Fetching ${extras.length} extra athletes...`);
  const known = new Set(list.map(p => p.id));
  await pool(extras, async e => {
    try {
      const hit = (await findAthletes(e.name, e.birth))[0];
      if (!hit) { console.log(`  Extra not found: ${e.name} ${e.birth}`); return; }
      if (known.has(hit.id)) { list.find(p => p.id === hit.id).extra = true; return; }
      known.add(hit.id);
      const card = await get(`${BASE}/scheda_unica_i.php?ATLETA=${hit.id}`);
      const cells = [...card.matchAll(/<td><h6>([^]*?)<\/h6><\/td>/g)].map(m => strip(m[1]));
      const h = await history(hit.id, card, rankId);
      list.push({ name: hit.name, club: cells[1] || '', champs: [], extra: true,
        id: hit.id, tessera: h.tessera, history: h.points });
    } catch (err) {
      console.log(`  Extra failed: ${e.name} (${err.message})`);
    }
  });

  const data = {
    generated: new Date().toISOString(),
    repo: process.env.GITHUB_REPOSITORY || '',
    championships: champs.map(c => ({ cam: c.cam, title: c.title })),
    players: list.map(({ cam, ...p }) => p),
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  fs.mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true });
  fs.writeFileSync(OUT, template.replace('/*__DATA__*/null', json));
  console.log(`Wrote ${OUT}`);
})().catch(err => { console.error(err); process.exit(1); });
