"""Turn a palace backdrop with a solid maroon arch into a frame with a see-through arch.

Usage: python3 scripts/arch_frame.py backdrop.jpg public/story/mughal-frame.png
Prints the arch box (x0, y0, x1, y1 as fractions of the image) for MughalArch.tsx.
"""
import sys
from collections import deque
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
w, h = im.size
px = im.load()

def maroon(p):
    r, g, b = p
    return r > 35 and r < 150 and g < 0.45 * r and b < 0.6 * r and r - g > 25

# flood fill the maroon region from the centre of the image
seen = bytearray(w * h)
q = deque()
cx, cy = w // 2, int(h * 0.55)
for dy in range(-40, 41, 8):
    for dx in range(-40, 41, 8):
        x, y = cx + dx, cy + dy
        if maroon(px[x, y]):
            q.append((x, y)); seen[y * w + x] = 1
while q:
    x, y = q.popleft()
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
            # tolerate dark sparkles/text: accept very dark pixels too
            p = px[nx, ny]
            if maroon(p) or (sum(p) < 90):
                seen[ny * w + nx] = 1; q.append((nx, ny))

mask = Image.new("L", (w, h), 0)
mp = mask.load()
for y in range(h):
    for x in range(w):
        if seen[y * w + x]:
            mp[x, y] = 255
# close small holes (sparkles, petals) and make each row solid between its first and last pixel
mask = mask.filter(ImageFilter.MaxFilter(9 if w < 1000 else 17)).filter(ImageFilter.MinFilter(9 if w < 1000 else 17))
mp = mask.load()
edges = {}
for y in range(h):
    row = [x for x in range(w) if mp[x, y] > 127]
    if len(row) > w * 0.15:
        edges[y] = (row[0], row[-1])
# smooth the edges row by row (median of nearby rows) so leaks into dark pillars are ignored
rows = sorted(edges)
def med(v):
    v = sorted(v); return v[len(v) // 2]
smooth = {}
for y in rows:
    near = [edges[k] for k in range(y - h // 50, y + h // 50 + 1) if k in edges]
    l, r = med([a for a, _ in near]), med([b for _, b in near])
    smooth[y] = (max(l, edges[y][0]), min(r, edges[y][1]))
mask = Image.new("L", (w, h), 0); mp = mask.load()
for y, (l, r) in smooth.items():
    for x in range(l, r + 1):
        mp[x, y] = 255
xs = [v for lr in smooth.values() for v in lr]; ys = rows
mask = mask.filter(ImageFilter.GaussianBlur(1.2))
alpha = Image.eval(mask, lambda v: 255 - v)
frame = im.convert("RGBA"); frame.putalpha(alpha)
frame.save(out, optimize=True)
print(f"box: x0={min(xs)/w:.4f} y0={min(ys)/h:.4f} x1={max(xs)/w:.4f} y1={max(ys)/h:.4f}  size={w}x{h}")
