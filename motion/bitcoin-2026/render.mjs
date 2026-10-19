// usage: node render.mjs [outDir] [frame,frame,...]   (no frame list = all frames)
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const out = process.argv[2] || 'frames';
const only = process.argv[3] ? process.argv[3].split(',').map(Number) : null;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
}).catch(() => chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }));
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('console', m => console.log('[page]', m.text()));
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto('http://localhost:8765/index.html');
await page.waitForFunction('window.sceneReady === true', null, { timeout: 30000 });
await page.evaluate(() => document.fonts.ready);

const total = await page.evaluate('window.FRAMES');
const fps = await page.evaluate('window.FPS');
const list = only ?? [...Array(total).keys()];
const t0 = Date.now();
for (const f of list) {
  await page.evaluate(t => window.renderFrame(t), f / fps);
  await page.screenshot({ path: `${out}/f${String(f).padStart(4, '0')}.png` });
  if (f % 30 === 0) console.log(`frame ${f}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
