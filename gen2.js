const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = __dirname;                 // store/
const RAW = path.join(DIR, 'raw');
const OUT = path.join(DIR, 'out');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(OUT, { recursive: true });

// map raw filenames (sorted by capture time) to logical screens
const F = {
  list:    'Screenshot_20260726_134403.png',
  grid:    'Screenshot_20260726_134430.png',
  detail:  'Screenshot_20260726_135039.png',
  add:     'Screenshot_20260726_135130.png',
  stats:   'Screenshot_20260726_135835.png',
  setGreen:'Screenshot_20260726_135915.png',
  setPurp: 'Screenshot_20260726_135955.png',
  shelves: 'Screenshot_20260726_142033.png',
};

// 8 panels. bg cycles through subtle forest-green variants.
const PANELS = [
  { file: F.list,    eyebrow: 'Your library',    head: 'Every book you\u2019ve read, reading, and wishing for', bg: 'a' },
  { file: F.grid,    eyebrow: 'Browse',          head: 'Your covers, beautifully shelved',                     bg: 'b' },
  { file: F.detail,  eyebrow: 'Every title',     head: 'Rich detail for every book you own',                  bg: 'c' },
  { file: F.add,     eyebrow: 'Add in seconds',  head: 'Search, scan the barcode, or snap the cover',         bg: 'd' },
  { file: F.stats,   eyebrow: 'Insights & goals',head: 'Watch your reading trail climb toward the goal',      bg: 'a' },
  { file: F.shelves, eyebrow: 'Organize',        head: 'Custom shelves for every kind of book',               bg: 'b' },
  { file: F.setPurp, eyebrow: 'Make it yours',   head: 'Four themes, light or dark',                          bg: 'c' },
  { file: F.setGreen,eyebrow: 'Safe & portable', head: 'Private Drive backup, with export & import',          bg: 'd' },
];

const BG = {
  a: { g: 'linear-gradient(157deg,#154023 0%,#0e2f19 62%,#0a2413 100%)', shot: '#0a2413' },
  b: { g: 'linear-gradient(157deg,#1a4a2a 0%,#123920 64%,#0c2a17 100%)', shot: '#0c2a17' },
  c: { g: 'linear-gradient(157deg,#123d21 0%,#0d3019 60%,#091f11 100%)', shot: '#091f11' },
  d: { g: 'linear-gradient(157deg,#18492a 0%,#0f351d 66%,#0a2614 100%)', shot: '#0a2614' },
};

// crop the top status-bar strip out of every screenshot (px in the 1080x2400 source)
const CROP_TOP = 112;
const SRC_W = 1080, SRC_H = 2400;
const PHONE_W = 726;                    // device outer width on the 1080 canvas
const BEZEL = 10;
const SCREEN_W = PHONE_W - BEZEL * 2;
const scale = SCREEN_W / SRC_W;
const SCREEN_H = Math.round((SRC_H - CROP_TOP) * scale);
const IMG_SHIFT = Math.round(CROP_TOP * scale);

function page(p) {
  const b = BG[p.bg];
  const data = fs.readFileSync(path.join(RAW, p.file)).toString('base64');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:1080px;height:1920px;}
  body{position:relative;overflow:hidden;background:${b.g};
    font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
    display:flex;flex-direction:column;align-items:center;}
  .trail{position:absolute;inset:0;opacity:.55;pointer-events:none;}
  .cap{position:relative;z-index:2;text-align:center;padding:96px 90px 0;height:300px;}
  .eyebrow{font-size:26px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;
    color:#e7b455;margin-bottom:22px;}
  .head{font-size:56px;line-height:1.1;font-weight:800;letter-spacing:-.015em;
    color:#f1f8ee;max-width:900px;margin:0 auto;text-wrap:balance;}
  .phone{position:relative;z-index:2;width:${PHONE_W}px;background:#0a0f0b;
    border-radius:46px;padding:${BEZEL}px;box-shadow:0 30px 70px rgba(0,0,0,.45),
    0 0 0 1.5px rgba(255,255,255,.06);}
  .notch{position:absolute;top:15px;left:50%;transform:translateX(-50%);
    width:12px;height:12px;border-radius:50%;background:#05330f;z-index:3;
    box-shadow:0 0 0 2px rgba(255,255,255,.05);}
  .screen{width:${SCREEN_W}px;height:${SCREEN_H}px;overflow:hidden;border-radius:38px;background:#fff;}
  .screen img{display:block;width:${SCREEN_W}px;margin-top:-${IMG_SHIFT}px;}
  </style></head><body>
  <svg class="trail" viewBox="0 0 1080 1920" preserveAspectRatio="none">
    <path d="M-40 470 C 240 400, 430 560, 660 500 S 1000 380, 1140 430" fill="none"
      stroke="#7fb87f" stroke-width="4" stroke-dasharray="2 22" stroke-linecap="round" opacity=".5"/>
    <path d="M-40 1650 C 260 1600, 470 1720, 720 1660 S 1010 1560, 1140 1600" fill="none"
      stroke="#9FCB98" stroke-width="4" stroke-dasharray="2 24" stroke-linecap="round" opacity=".38"/>
  </svg>
  <div class="cap"><div class="eyebrow">${p.eyebrow}</div><div class="head">${p.head}</div></div>
  <div class="phone"><div class="notch"></div><div class="screen"><img src="data:image/png;base64,${data}"></div></div>
  </body></html>`;
}

PANELS.forEach((p, i) => {
  const n = String(i + 1).padStart(2, '0');
  const base = p.file.replace('.png', '');
  const html = path.join(OUT, `_page_${n}.html`);
  const png = path.join(OUT, `${n}-${p.eyebrow.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g,'')}.png`);
  fs.writeFileSync(html, page(p));
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1080,1920', '--screenshot=' + png, 'file:///' + html.replace(/\\/g, '/')
  ], { stdio: 'ignore' });
  fs.unlinkSync(html);
  console.log('rendered', path.basename(png));
});
console.log('DONE  screen=' + SCREEN_W + 'x' + SCREEN_H);
