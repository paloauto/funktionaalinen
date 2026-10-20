# Clip OSM-derived land polygons to the Helsinki box; output local km coords (origin Rautatientori) as JS.
import json, math, sys
import shapely
from shapely.geometry import Polygon, MultiPolygon, GeometryCollection
from shapely.ops import unary_union
LAT0, LON0 = 60.1709, 24.9418
KX = math.cos(math.radians(LAT0)) * 111.32
KZ = 110.57
X0, Y0, X1, Y1 = 24.50, 60.06, 25.32, 60.34
d = json.load(open(sys.argv[1]))
gs = [ft['geometry'] for ft in d['features']] if 'features' in d else d.get('geometries', [d])
parts = []
for gj in gs:
    polys = gj['coordinates'] if gj['type'] == 'MultiPolygon' else [gj['coordinates']]
    for pc in polys:
        xs = [c[0] for c in pc[0]]; ys = [c[1] for c in pc[0]]
        if max(xs) < X0 or min(xs) > X1 or max(ys) < Y0 or min(ys) > Y1: continue
        # cut rings to points near the box first so huge continental rings stay cheap
        g = shapely.clip_by_rect(Polygon(pc[0], [h for h in pc[1:] if len(h) > 3]), X0, Y0, X1, Y1)
        if not g.is_empty: parts.append(g)
land = unary_union(parts).simplify(0.00025, preserve_topology=True)
polys = []
for g in getattr(land, 'geoms', [land]):
    if isinstance(g, Polygon): polys.append(g)
out = []
for p in polys:
    if p.area < 2e-7: continue
    out.append([[round((x - LON0) * KX, 3), round(-(y - LAT0) * KZ, 3)] for x, y in p.exterior.coords[:-1]])
open(sys.argv[2], 'w').write('const LAND = ' + json.dumps(out, separators=(',', ':')) + ';\n')
print(len(out), 'polys', sum(map(len, out)), 'pts')
