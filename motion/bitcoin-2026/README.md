# Bitcoin 2026 – 3D animated chart

`bitcoin-2026-3d.mp4`: 14 s, 1080×1920 (9:16), 30 fps. Three.js scene rendered frame by frame in headless Chromium and encoded with ffmpeg.

Data: approximate BTC/USD month-end closes (Jan–Sep 2026) plus ~$82k on Oct 19, collected via web search (StatMuse, Cryptoticker). Edit `DATA` in `index.html` to change it.

## Re-render

```sh
npm install
python3 -m http.server 8765 &        # ES modules need http://, not file://
node render.mjs frames               # all frames; or: node render.mjs test 90,240,410
ffmpeg -framerate 30 -i frames/f%04d.png -c:v libx264 -crf 18 -pix_fmt yuv420p bitcoin-2026-3d.mp4
```
