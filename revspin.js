#!/usr/bin/env node
// Scrapes the rubber and blade ratings from revspin.net and writes the "Materiali" subpage, where they can be
// filtered and compared (table and radar chart).
//
// Sources, per kind (rubber / blade):
//  - revspin.net/<kind>/                 every product with its brand (for the brand filter);
//  - revspin.net/top-<kind>/overall-desc.html?p=N
//                                        every rating parameter of the products with at least 10 user ratings
//                                        (revspin lists only those there, 100 per page);
//  - revspin.net/<kind>/<slug>.html      the manufacturer's details (blade weight, plies, materials; rubber
//                                        tensor/anti, ...). These rarely change, so they are cached in
//                                        dettagli.json (data folder) and only new products are fetched.
//
// Two steps, so a change to the page doesn't download everything again:
//  --fetch  downloads from revspin into the data folder: materiali.json (and the dettagli.json cache).
//           In the workflow the data folder is the "data" branch.
//  --build  writes the page from materiali.json and materiali.html. No request to revspin.
// Without either flag, both.
//
// Usage: node revspin.js [--fetch|--build] [output.html] [--data DIR] [--limit N]
//        output defaults to site/materiali/index.html, the data folder to data/; --limit N only fetches N new
//        detail pages (for testing).
// Requires Node 18+ (built-in fetch). No dependencies.

const fs = require('fs');
const path = require('path');

const BASE = 'https://revspin.net';
const DELAY = 1000;   // between detail pages, to go easy on revspin
const args = process.argv.slice(2);
const limitAt = args.indexOf('--limit');
const LIMIT = limitAt >= 0 ? +args.splice(limitAt, 2)[1] : Infinity;
const dataAt = args.indexOf('--data');
const DATA_DIR = path.resolve(dataAt >= 0 ? args.splice(dataAt, 2)[1] : path.join(__dirname, 'data'));
const flag = f => { const i = args.indexOf(f); return i >= 0 && !!args.splice(i, 1); };
const [FETCH, BUILD] = (([f, b]) => f || b ? [f, b] : [true, true])([flag('--fetch'), flag('--build')]);
const OUT = args[0] || path.join(__dirname, 'site', 'materiali', 'index.html');
const CACHE = path.join(DATA_DIR, 'dettagli.json');
const DATA_FILE = path.join(DATA_DIR, 'materiali.json');

// Rating columns of the top lists, by their cell class.
const PARAMS = {
  rubber: ['speed', 'spin', 'control', 'tackiness', 'weight', 'sponge_hardness', 'gears', 'throw_angle',
    'consistency', 'durability', 'overall'],
  blade: ['speed', 'control', 'stiffness', 'hardness', 'consistency', 'overall'],
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (fitet-materiali)' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i >= tries) throw new Error(`${url}: ${err.message}`);
      await sleep(2000 * i);
    }
  }
}

const strip = s => s.replace(/<!--[^]*?-->/g, '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim();
const num = s => { const v = parseFloat(String(s).replace(/[^0-9.]/g, '')); return isNaN(v) ? null : v; };

// Brand of every product, from the full list (each name is "<span class="hidden-xs">Brand</span> Model").
async function brands(kind) {
  const html = await get(`${BASE}/${kind}/`);
  const out = {};
  for (const m of html.matchAll(/<td class="cell_name"><a href="[^"]*?([^"/]+)\.html"[^>]*><span class="hidden-xs">([^<]*)<\/span>([^<]*)<\/a>/g))
    out[m[1]] = { brand: strip(m[2]), model: strip(m[3]) };
  return out;
}

// Products with all their ratings, from the top list pages.
async function topList(kind) {
  const rows = [];
  for (let p = 1; p < 100; p++) {
    const html = await get(`${BASE}/top-${kind}/overall-desc.html?p=${p}`);
    const page = [...html.matchAll(/<tr[^>]*>\s*<td class="rank">[^]*?<\/tr>/g)].map(([tr]) => {
      const link = tr.match(/<td class="product">\s*<a href="[^"]*?([^"/]+)\.html">([^<]*)<\/a>/);
      if (!link) return null;
      const cell = k => { const m = tr.match(new RegExp(`<td class="[^"]*\\b${k}\\b[^"]*">([^]*?)</td>`)); return m ? num(strip(m[1])) : null; };
      const r = { slug: link[1], name: strip(link[2]) };
      for (const k of PARAMS[kind]) r[k] = cell(k);
      r.ratings = cell('ratings');
      r.price = cell('price');
      return r;
    }).filter(Boolean);
    rows.push(...page);
    if (page.length < 100) break;
    await sleep(DELAY);
  }
  return rows;
}

// Manufacturer details: the label/value rows of the table after "Manufacturer Details".
function details(html) {
  const i = html.indexOf('Manufacturer Details');
  if (i < 0) return {};
  const table = html.slice(i, html.indexOf('</table>', i));
  const out = {};
  for (const m of table.matchAll(/<td class="cell_label">([^]*?)<\/td>\s*<td class="cell_rating">([^]*?)<\/td>/g)) {
    const key = strip(m[1].replace(/<img[^]*?\/>/g, '')).toLowerCase().replace(/\W+/g, '_');
    const val = strip(m[2]);
    if (key && val) out[key] = val;
  }
  return out;
}

// Manufacturer ratings use their own scale ("13 / 15", "9.5 / 10", "120"): rescaled to 10,
// dropped when the scale is unknown.
const scaled = s => {
  const m = String(s || '').match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (m) return Math.round(100 * m[1] / m[2]) / 10;
  const v = num(s); return v != null && v <= 10 ? v : null;
};

// Keeps the useful manufacturer details, as numbers or short strings.
function specs(kind, d) {
  if (kind === 'blade') return {
    weight_g: num(d.weight), plies: num(d.plies) || null, materials: d.materials || '',
    m_speed: scaled(d.speed), m_control: scaled(d.control),
  };
  const yes = v => v == null ? null : /^yes/i.test(v);
  return {
    tensor: yes(d.tensor), anti: yes(d.anti), m_speed: scaled(d.speed), m_spin: scaled(d.spin), m_control: scaled(d.control),
  };
}

// Downloads the ratings into the data folder.
async function fetchData() {
  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : { rubber: {}, blade: {} };
  const data = { generated: new Date().toISOString() };
  let fetched = 0;
  for (const kind of ['rubber', 'blade']) {
    const [names, rows] = [await brands(kind), await topList(kind)];
    console.log(`${kind}: ${rows.length} products with 10+ ratings (of ${Object.keys(names).length} listed)`);
    for (const r of rows) {
      const n = names[r.slug];
      if (n) { r.brand = n.brand; r.model = n.model; } else { r.brand = r.name.split(' ')[0]; r.model = r.name.slice(r.brand.length).trim(); }
      if (!cache[kind][r.slug] && fetched < LIMIT) {
        try {
          cache[kind][r.slug] = details(await get(`${BASE}/${kind}/${r.slug}.html`));
          if (++fetched % 50 === 0) { console.log(`  ${fetched} detail pages`); fs.writeFileSync(CACHE, JSON.stringify(cache)); }
        } catch (err) { console.warn(`  ${err.message}`); }
        await sleep(DELAY);
      }
      Object.assign(r, specs(kind, cache[kind][r.slug] || {}));
    }
    data[kind] = rows;
  }
  // Safety check: refuse to save a scrape with fewer than 90% of the products of the last one
  // (revspin down or changed its layout). FORCE=1 saves anyway. The details cache is kept either way.
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));
  if (fs.existsSync(DATA_FILE) && !process.env.FORCE) {
    const prev = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    for (const kind of ['rubber', 'blade']) {
      const before = (prev[kind] || []).length;
      if (data[kind].length < 0.9 * before) throw new Error(`${kind}: ${data[kind].length} products, the last scrape had ${before}`);
    }
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data));
  console.log(`Wrote ${DATA_FILE}${fetched ? ` (${fetched} new detail pages)` : ''}`);
}

// Writes the page from the data folder: no request to revspin.
function build() {
  if (!fs.existsSync(DATA_FILE)) throw new Error(`${DATA_FILE} not found: run node revspin.js --fetch first`);
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const repo = process.env.GITHUB_REPOSITORY || '';
  const [owner, name] = repo.split('/');
  const cname = fs.existsSync(path.join(__dirname, 'CNAME')) ? fs.readFileSync(path.join(__dirname, 'CNAME'), 'utf8').trim() : '';
  const site = cname ? `https://${cname}/` : repo ? `https://${owner.toLowerCase()}.github.io/${name}/` : '';
  const template = fs.readFileSync(path.join(__dirname, 'materiali.html'), 'utf8');
  fs.mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true });
  fs.writeFileSync(OUT, template.replace('/*__DATA__*/null', json).replaceAll('__SITE__', site));
  console.log(`Wrote ${OUT}`);
}

(async () => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (FETCH) await fetchData();
  if (BUILD) build();
})().catch(err => { console.error(err); process.exit(1); });
