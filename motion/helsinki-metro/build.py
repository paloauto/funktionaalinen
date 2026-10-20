# Inline the clipped coastline into the page template.
src = open('src.html').read()
land = open('land.js').read().strip()
open('index.html', 'w').write(src.replace('/*LAND*/', land))
print('index.html', len(src) + len(land), 'bytes')
# standalone copy with its own document skeleton, for local rendering and the repo
page = open('index.html').read()
open('standalone.html', 'w').write('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n' + page + '\n</body>\n</html>\n')
