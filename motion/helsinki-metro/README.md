# Helsinki Metro Animated

- **`standalone.html`**: the interactive site, a lit cutaway diorama. Grass, water and illustrative buildings sit on top; the bedrock is cut open along the underground route to show the tunnels, track and platforms. Rotate it, toggle M1/M2, change depth exaggeration, click stations, or press **Ride M1** to follow a train. Three.js and fonts load from CDNs.
- **`helsinki-metro-animated.mp4`**: 36 s showcase video, 1920×1080 at 30 fps. It follows an M300-style train from Kivenlahti via Tapiola and Rautatientori to Itäkeskus.

Trains run a timetable: each run between stations is eased in and out (sine ease) with a short dwell at the platform. Camera moves and text plates use cubic ease-in-out. For visibility, trains are drawn about 4× real size and buildings 4× taller.

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
node render.mjs frames                # all 1080 showcase frames
ffmpeg -framerate 30 -i frames/f%04d.png -c:v libx264 -crf 18 -pix_fmt yuv420p helsinki-metro-animated.mp4
```

To regenerate the coastline: `npm pack @geo-maps/earth-lands-100m`, extract it, then run `python3 tools/land.py <map.geo.json> land.js 24.59867 60.11212 25.19463 60.26134` (needs `shapely`). The four numbers are the diorama's bounding box in degrees.
