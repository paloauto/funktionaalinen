# Helsinki Metro – 3D model and showcase

- **`standalone.html`**: the interactive 3D site. Open it in a browser to rotate the network, toggle M1/M2, change depth exaggeration, click stations, or press **Ride M1**. Three.js and fonts load from CDNs.
- **`helsinki-metro-3d.mp4`**: 30 s showcase video, 1920×1080 at 30 fps.

Both come from one scene. `window.renderFrame(t)` drives the showcase timeline deterministically, so every video frame is reproducible.

## Data

- **Coastline:** OpenStreetMap land polygons via [`@geo-maps/earth-lands-100m`](https://www.npmjs.com/package/@geo-maps/earth-lands-100m), © OpenStreetMap contributors, ODbL. Clipped and simplified by `tools/land.py` into `land.js`.
- **Stations:** the `STATIONS` list in `src.html`. Coordinates and platform depths are approximate, hand-entered values, not survey data.

## Files

- `src.html`: page source with a `/*LAND*/` placeholder
- `build.py`: inlines `land.js` and writes `index.html` (body-only, used for the claude.ai artifact) and `standalone.html`
- `render.mjs`: renders screenshots or video frames with headless Chromium

## Rebuild and render

```sh
npm install
python3 build.py
node render.mjs shots interactive     # desktop + phone screenshots
node render.mjs frames                # all 900 showcase frames
ffmpeg -framerate 30 -i frames/f%04d.png -c:v libx264 -crf 18 -pix_fmt yuv420p helsinki-metro-3d.mp4
```

To regenerate the coastline: `npm pack @geo-maps/earth-lands-100m`, extract it, then run `python3 tools/land.py <map.geo.json> land.js` (needs `shapely`).
