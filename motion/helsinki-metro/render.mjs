// usage: node render.mjs <outDir> [interactive | frame,frame,...]   (no list = all showcase frames)
// CDN and Google Fonts requests are served from local copies (node_modules/three, fonts/).
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || 'frames';
const mode = process.argv[3];
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const interactive = mode === 'interactive';
const page = await browser.newPage({ viewport: interactive ? { width: 1440, height: 900 } : { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('[pageerror]', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('[console]', m.text()); });
await page.route('https://cdn.jsdelivr.net/npm/three@0.169.0/**', r => {
  const rel = new URL(r.request().url()).pathname.replace('/npm/three@0.169.0/', '');
  r.fulfill({ body: readFileSync(join(here, 'node_modules/three', rel)), contentType: 'text/javascript' });
});
// optional local font cache (fonts/), for machines whose browser can't reach Google Fonts
await page.route('https://fonts.googleapis.com/**', r => existsSync(join(here, 'fonts/fonts.css'))
  ? r.fulfill({ body: readFileSync(join(here, 'fonts/fonts.css')), contentType: 'text/css' }) : r.continue());
await page.route('https://fonts.gstatic.com/**', r => {
  const f = join(here, 'fonts', new URL(r.request().url()).pathname.slice(1).replace(/\//g, '_'));
  existsSync(f) ? r.fulfill({ body: readFileSync(f), contentType: 'font/woff2' }) : r.continue();
});
await page.goto('file://' + join(here, 'standalone.html'));
await page.waitForFunction('window.sceneReady === true', null, { timeout: 180000 });
await page.evaluate(() => document.fonts.ready);

if (interactive) {
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/interactive.png` });
  await page.setViewportSize({ width: 400, height: 860 });
  await page.reload();
  await page.waitForFunction('window.sceneReady === true', null, { timeout: 180000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/phone.png` });
} else {
  await page.evaluate(() => window.enterRenderMode(1920, 1080));
  const total = await page.evaluate('window.FRAMES'), fps = await page.evaluate('window.FPS');
  const list = mode ? mode.split(',').map(Number) : [...Array(total).keys()];
  const t0 = Date.now();
  for (const f of list) {
    const file = `${out}/f${String(f).padStart(4, '0')}.png`;
    if (existsSync(file)) continue;                      // resume: skip frames already rendered
    for (let attempt = 0; ; attempt++) {
      try {
        await page.evaluate(t => window.renderFrame(t), f / fps);
        await page.screenshot({ path: file, timeout: 180000 });
        break;
      } catch (e) { if (attempt >= 2) throw e; console.log('retry frame', f, e.message.split('\n')[0]); }
    }
    if (f % 90 === 0) console.log(`frame ${f}/${total} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
}
await browser.close();
