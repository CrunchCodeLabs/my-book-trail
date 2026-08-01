const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = __dirname;
const RAW = path.join(DIR, 'raw');
const OUT = path.join(DIR, 'out-tablet');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(OUT, { recursive: true });

const F = {
  list:'Screenshot_20260726_134403.png', grid:'Screenshot_20260726_134430.png',
  detail:'Screenshot_20260726_135039.png', add:'Screenshot_20260726_135130.png',
  stats:'Screenshot_20260726_135835.png', setGreen:'Screenshot_20260726_135915.png',
  setPurp:'Screenshot_20260726_135955.png', shelves:'Screenshot_20260726_142033.png',
};

const PANELS = [
  { file:F.list,    eyebrow:'Your library',     head:'Every book you\u2019ve read, reading, and wishing for', sub:'Three shelves, one tap apart \u2014 plus your own labels.', bg:'a' },
  { file:F.grid,    eyebrow:'Browse',           head:'Your covers, beautifully shelved',        sub:'See your whole collection at a glance.',              bg:'b' },
  { file:F.detail,  eyebrow:'Every title',      head:'Rich detail for every book you own',      sub:'Ratings, pages, series, ISBN, notes and more.',       bg:'c' },
  { file:F.add,     eyebrow:'Add in seconds',   head:'Search, scan, or snap to add a book',     sub:'Details auto-fill from Google Books.',                bg:'d' },
  { file:F.stats,   eyebrow:'Insights & goals', head:'Watch your reading trail climb',          sub:'Goals, pages read, and year-by-year insights.',       bg:'a' },
  { file:F.shelves, eyebrow:'Organize',         head:'Custom shelves for every kind of book',   sub:'Favourites, Book Club, Signed Copies\u2026 anything.', bg:'b' },
  { file:F.setPurp, eyebrow:'Make it yours',    head:'Four themes, light or dark',              sub:'A look for every reader.',                            bg:'c' },
  { file:F.setGreen,eyebrow:'Safe & portable',  head:'Private Drive backup, export & import',   sub:'Your library, always yours.',                         bg:'d' },
];

const BG = {
  a:'linear-gradient(118deg,#0a2413 0%,#0e2f19 52%,#154023 100%)',
  b:'linear-gradient(118deg,#0c2a17 0%,#123920 54%,#1a4a2a 100%)',
  c:'linear-gradient(118deg,#091f11 0%,#0d3019 52%,#123d21 100%)',
  d:'linear-gradient(118deg,#0a2614 0%,#0f351d 56%,#18492a 100%)',
};

const CROP_TOP = 112, SRC_W = 1080, SRC_H = 2400, BEZEL = 10;
const SCREEN_W = 444;
const dScale = SCREEN_W / SRC_W;
const SCREEN_H = Math.round((SRC_H - CROP_TOP) * dScale);
const IMG_SHIFT = Math.round(CROP_TOP * dScale);

function page(p) {
  const data = fs.readFileSync(path.join(RAW, p.file)).toString('base64');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1920px;height:1080px}
  body{position:relative;overflow:hidden;background:${BG[p.bg]};
    font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
    display:flex;align-items:center}
  .trail{position:absolute;inset:0;opacity:.55;pointer-events:none}
  .copy{position:relative;z-index:2;flex:1;padding:0 90px 0 130px}
  .eyebrow{font-size:30px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:#e7b455;margin-bottom:28px}
  .head{font-size:78px;line-height:1.08;font-weight:800;letter-spacing:-.02em;color:#f1f8ee;max-width:1000px;text-wrap:balance}
  .sub{font-size:34px;font-weight:500;color:#c7dcc0;margin-top:30px;max-width:840px}
  .phone{position:relative;z-index:2;flex:0 0 auto;margin-right:150px;width:${SCREEN_W + BEZEL*2}px;
    background:#0a0f0b;border-radius:44px;padding:${BEZEL}px;
    box-shadow:0 34px 74px rgba(0,0,0,.5),0 0 0 1.5px rgba(255,255,255,.06)}
  .notch{position:absolute;top:15px;left:50%;transform:translateX(-50%);width:11px;height:11px;border-radius:50%;background:#05330f;z-index:3}
  .screen{width:${SCREEN_W}px;height:${SCREEN_H}px;overflow:hidden;border-radius:36px;background:#fff}
  .screen img{display:block;width:${SCREEN_W}px;margin-top:-${IMG_SHIFT}px}
  </style></head><body>
  <svg class="trail" viewBox="0 0 1920 1080" preserveAspectRatio="none">
    <path d="M-60 300 C 360 200, 640 420, 980 340 S 1600 180, 1990 280" fill="none" stroke="#9FCB98" stroke-width="5" stroke-dasharray="2 26" stroke-linecap="round" opacity=".4"/>
    <path d="M-60 860 C 380 780, 720 940, 1080 860 S 1620 720, 1990 800" fill="none" stroke="#7fb87f" stroke-width="5" stroke-dasharray="2 28" stroke-linecap="round" opacity=".3"/>
  </svg>
  <div class="copy"><div class="eyebrow">${p.eyebrow}</div><div class="head">${p.head}</div><div class="sub">${p.sub}</div></div>
  <div class="phone"><div class="notch"></div><div class="screen"><img src="data:image/png;base64,${data}"></div></div>
  </body></html>`;
}

PANELS.forEach((p, i) => {
  const n = String(i + 1).padStart(2, '0');
  const html = path.join(OUT, `_t_${n}.html`);
  const png = path.join(OUT, `${n}-${p.eyebrow.toLowerCase().replace(/[^a-z]+/g,'-').replace(/^-|-$/g,'')}.png`);
  fs.writeFileSync(html, page(p));
  execFileSync(CHROME, ['--headless=new','--disable-gpu','--hide-scrollbars','--force-device-scale-factor=1',
    '--window-size=1920,1080','--screenshot=' + png, 'file:///' + html.replace(/\\/g,'/')], { stdio:'ignore' });
  fs.unlinkSync(html);
  console.log('rendered', path.basename(png));
});
console.log('DONE  screen=' + SCREEN_W + 'x' + SCREEN_H);
