"""Draws the RK Ayadi Kanitham app mark and writes every Android icon,
splash image and web icon. Pure standard library: no Pillow needed.

    py scripts/make-icons.py

Shapes are described in a 0..1 box and rasterised with 4x supersampling,
so edges stay smooth at every density.
"""

import os
import struct
import zlib

SS = 4  # supersampling factor

BG = (29, 92, 99, 255)        # deep teal, the app accent
CREAM = (246, 241, 228, 255)  # temple silhouette
GOLD = (215, 164, 74, 255)    # kalasam and ground line
WHITE = (255, 255, 255, 255)  # themed (monochrome) icon
CLEAR = (0, 0, 0, 0)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# --------------------------------------------------------------------------- png
def write_png(path, width, height, pixels):
    """pixels: bytearray of width*height*4 RGBA bytes."""
    stride = width * 4
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter type: none
        raw += pixels[y * stride:(y + 1) * stride]

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data +
                struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    header = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    blob = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) +
            chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b""))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as handle:
        handle.write(blob)


# ---------------------------------------------------------------------- canvas
class Canvas:
    def __init__(self, width, height, fill=CLEAR):
        self.w = width
        self.h = height
        self.buf = bytearray(bytes(fill) * (width * height))

    def _put(self, x, y, colour):
        if 0 <= x < self.w and 0 <= y < self.h:
            i = (y * self.w + x) * 4
            self.buf[i:i + 4] = bytes(colour)

    def rect(self, x0, y0, x1, y1, colour):
        for y in range(max(0, int(y0)), min(self.h, int(round(y1)))):
            for x in range(max(0, int(x0)), min(self.w, int(round(x1)))):
                self._put(x, y, colour)

    def poly(self, points, colour):
        ys = [p[1] for p in points]
        for y in range(max(0, int(min(ys))), min(self.h, int(max(ys)) + 1)):
            crossings = []
            for i, (x0, y0) in enumerate(points):
                x1, y1 = points[(i + 1) % len(points)]
                if y0 == y1:
                    continue
                if (y0 <= y < y1) or (y1 <= y < y0):
                    crossings.append(x0 + (y - y0) * (x1 - x0) / (y1 - y0))
            crossings.sort()
            for i in range(0, len(crossings) - 1, 2):
                for x in range(max(0, int(crossings[i])), min(self.w, int(crossings[i + 1]) + 1)):
                    self._put(x, y, colour)

    def circle(self, cx, cy, r, colour):
        for y in range(max(0, int(cy - r)), min(self.h, int(cy + r) + 1)):
            for x in range(max(0, int(cx - r)), min(self.w, int(cx + r) + 1)):
                if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                    self._put(x, y, colour)

    def blit(self, width, height, data, x0, y0):
        """Alpha-composite an RGBA block onto this canvas at (x0, y0)."""
        for y in range(height):
            ty = y0 + y
            if not (0 <= ty < self.h):
                continue
            for x in range(width):
                tx = x0 + x
                if not (0 <= tx < self.w):
                    continue
                s = (y * width + x) * 4
                a = data[s + 3]
                if not a:
                    continue
                d = (ty * self.w + tx) * 4
                if a == 255:
                    self.buf[d:d + 4] = data[s:s + 4]
                    continue
                inv = 255 - a
                for k in range(3):
                    self.buf[d + k] = (data[s + k] * a + self.buf[d + k] * inv) // 255

    def downsample(self, factor):
        w = self.w // factor
        h = self.h // factor
        out = bytearray(w * h * 4)
        area = factor * factor
        for y in range(h):
            for x in range(w):
                r = g = b = a = 0
                for dy in range(factor):
                    base = ((y * factor + dy) * self.w + x * factor) * 4
                    for dx in range(factor):
                        i = base + dx * 4
                        r += self.buf[i]
                        g += self.buf[i + 1]
                        b += self.buf[i + 2]
                        a += self.buf[i + 3]
                o = (y * w + x) * 4
                out[o] = r // area
                out[o + 1] = g // area
                out[o + 2] = b // area
                out[o + 3] = a // area
        return w, h, out


# ------------------------------------------------------------------------ mark
def draw_mark(c, cx, cy, size, include_ground=True, body=CREAM, accent=GOLD, bg=BG):
    """Temple tower: plinth, body, three tapering tiers, kalasam."""
    def map_pt(u, v):
        return (cx + (u - 0.5) * size, cy + (v - 0.5) * size)

    def poly(points, colour):
        c.poly([map_pt(u, v) for u, v in points], colour)

    def rect(u0, v0, u1, v1, colour):
        x0, y0 = map_pt(u0, v0)
        x1, y1 = map_pt(u1, v1)
        c.rect(x0, y0, x1, y1, colour)

    def disc(u, v, r, colour):
        px, py = map_pt(u, v)
        c.circle(px, py, r * size, colour)

    # kalasam
    poly([(0.500, 0.020), (0.466, 0.150), (0.534, 0.150)], accent)
    disc(0.500, 0.183, 0.050, accent)

    # tapering tiers
    poly([(0.420, 0.243), (0.580, 0.243), (0.548, 0.352), (0.452, 0.352)], body)
    poly([(0.388, 0.352), (0.612, 0.352), (0.566, 0.470), (0.434, 0.470)], body)
    poly([(0.330, 0.470), (0.670, 0.470), (0.616, 0.622), (0.384, 0.622)], body)

    # body and plinth
    rect(0.404, 0.622, 0.596, 0.800, body)
    rect(0.306, 0.800, 0.694, 0.868, body)

    # doorway punched back to the background colour
    rect(0.472, 0.700, 0.528, 0.800, bg)

    if include_ground:
        rect(0.230, 0.888, 0.770, 0.912, accent)


def icon(size, rounded=False, pad=1.0):
    """Full launcher icon: background plus mark."""
    canvas = Canvas(size * SS, size * SS)
    centre = size * SS / 2
    if rounded:
        canvas.circle(centre, centre, centre - 0.5, BG)
    else:
        canvas.rect(0, 0, canvas.w, canvas.h, BG)
    draw_mark(canvas, centre, centre, size * SS * pad * 0.94)
    w, h, data = canvas.downsample(SS)
    return w, h, data


def adaptive_foreground(size):
    """Mark only, on transparency, inside the 66% adaptive safe zone."""
    canvas = Canvas(size * SS, size * SS)
    centre = size * SS / 2
    draw_mark(canvas, centre, centre, size * SS * 0.60, include_ground=False)
    w, h, data = canvas.downsample(SS)
    return w, h, data


def adaptive_monochrome(size):
    """Themed icon (Android 13+): the same silhouette in one flat colour."""
    canvas = Canvas(size * SS, size * SS)
    centre = size * SS / 2
    draw_mark(canvas, centre, centre, size * SS * 0.60, include_ground=False,
              body=WHITE, accent=WHITE, bg=CLEAR)
    w, h, data = canvas.downsample(SS)
    return w, h, data


def splash(width, height):
    """Flat background; only the mark is supersampled, then blitted in."""
    canvas = Canvas(width, height, BG)
    size = int(min(width, height) * 0.42)
    mark = Canvas(size * 2, size * 2)
    draw_mark(mark, size, size, size * 2)
    mw, mh, mdata = mark.downsample(2)
    canvas.blit(mw, mh, mdata, (width - mw) // 2, (height - mh) // 2)
    return canvas.w, canvas.h, canvas.buf


# ----------------------------------------------------------------------- write
DENSITIES = [("mdpi", 48, 108), ("hdpi", 72, 162), ("xhdpi", 96, 216),
             ("xxhdpi", 144, 324), ("xxxhdpi", 192, 432)]

RES = os.path.join(ROOT, "resources", "android", "res")
WEB = os.path.join(ROOT, "www", "icons")


def main():
    for name, legacy, foreground in DENSITIES:
        folder = os.path.join(RES, "mipmap-" + name)
        write_png(os.path.join(folder, "ic_launcher.png"), *icon(legacy))
        write_png(os.path.join(folder, "ic_launcher_round.png"), *icon(legacy, rounded=True))
        write_png(os.path.join(folder, "ic_launcher_foreground.png"), *adaptive_foreground(foreground))
        write_png(os.path.join(folder, "ic_launcher_monochrome.png"), *adaptive_monochrome(foreground))

    write_png(os.path.join(RES, "drawable", "splash.png"), *splash(1080, 1920))
    write_png(os.path.join(RES, "drawable-land", "splash.png"), *splash(1920, 1080))

    write_png(os.path.join(WEB, "icon-192.png"), *icon(192))
    write_png(os.path.join(WEB, "icon-512.png"), *icon(512))
    write_png(os.path.join(WEB, "maskable-512.png"), *icon(512, pad=0.72))
    write_png(os.path.join(WEB, "favicon-32.png"), *icon(32))

    write_png(os.path.join(ROOT, "store", "icon-512.png"), *icon(512))
    print("icons and splash written")


if __name__ == "__main__":
    main()
