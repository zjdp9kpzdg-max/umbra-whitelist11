#!/usr/bin/env python3
"""32×32 radio-head stills + loops for public/signal/."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

OUT = Path("/workspace/public/signal")
OUT.mkdir(parents=True, exist_ok=True)
S = 32

# palette
K = (7, 7, 10)
PURPLE = (74, 28, 112)
MAROON = (88, 24, 64)
GRAYBG = (72, 74, 82)
HELMET = (36, 38, 46)
HELMET_LT = (86, 88, 98)
SILVER = (196, 200, 208)
FACE = (28, 108, 58)
FACE_DK = (14, 58, 32)
FACE_LT = (46, 150, 80)
CHEEK = (196, 72, 96)
RED = (224, 36, 48)
RED_DK = (160, 24, 40)
GOLD = (232, 192, 64)
TOAST = (232, 188, 74)
CRUST = (168, 112, 48)
CYAN = (90, 232, 255)
HANDLE = (48, 176, 80)
WHITE = (236, 236, 240)
BLUE = (56, 120, 196)
CONE = (220, 48, 64)
CONE_LT = (255, 96, 88)


def blank(bg):
    return [[bg for _ in range(S)] for _ in range(S)]


def setp(c, x, y, col):
    if 0 <= x < S and 0 <= y < S:
        c[y][x] = col


def rect(c, x, y, w, h, col):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            setp(c, xx, yy, col)


def circ(c, cx, cy, r, col):
    r2 = r * r
    for yy in range(S):
        for xx in range(S):
            if (xx - cx) ** 2 + (yy - cy) ** 2 <= r2:
                c[yy][xx] = col


def checker(c, x, y, w, h, a, b):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            setp(c, xx, yy, a if (xx + yy) % 2 == 0 else b)


def sparkle(c, x, y, col=CYAN):
    setp(c, x, y, col)
    setp(c, x - 1, y, col)
    setp(c, x + 1, y, col)
    setp(c, x, y - 1, col)
    setp(c, x, y + 1, col)


def to_img(c, scale=10):
    im = Image.new("RGB", (S, S))
    im.putdata([c[y][x] for y in range(S) for x in range(S)])
    return im.resize((S * scale, S * scale), Image.Resampling.NEAREST)


def save_gif(path: Path, frames, durations, scale=10):
    imgs = [to_img(f, scale) for f in frames]
    imgs[0].save(
        path,
        save_all=True,
        append_images=imgs[1:],
        duration=durations,
        loop=0,
        disposal=2,
    )


def base_head(c, helmet, face, *, dither=False, cx=15, cy=16, r=11):
    circ(c, cx, cy, r, helmet)
    if dither:
        checker(c, cx - 6, cy - 3, 13, 10, FACE, FACE_DK)
    else:
        circ(c, cx, cy + 1, r - 3, face)


def eyes(c, x0, y, w=3, h=2, col=RED, gap=5, pupils=False):
    rect(c, x0, y, w, h, col)
    rect(c, x0 + w + gap, y, w, h, col)
    if pupils:
        setp(c, x0 + 1, y, WHITE)
        setp(c, x0 + w + gap + 1, y, WHITE)


def mouth(c, x, y, w=6, col=RED_DK):
    rect(c, x, y, w, 2, col)


def toaster(blink=False, twitch=0):
    c = blank(PURPLE)
    base_head(c, HELMET, FACE)
    # bread on the head
    rect(c, 10, 2, 5, 5, TOAST)
    rect(c, 17, 2, 5, 5, TOAST)
    rect(c, 10, 6, 5, 1, CRUST)
    rect(c, 17, 6, 5, 1, CRUST)
    setp(c, 12, 3, CRUST)
    setp(c, 19, 4, CRUST)
    # visor
    rect(c, 8, 12, 16, 1, HELMET)
    if blink:
        rect(c, 9, 13, 5, 1, RED_DK)
        rect(c, 18, 13, 5, 1, RED_DK)
    else:
        eyes(c, 9, 13, 5, 3, RED, 4, pupils=True)
    # deadpan
    rect(c, 13, 20, 6, 1, RED_DK)
    rect(c, 11, 18, 2, 2, CHEEK)
    rect(c, 19, 18, 2, 2, CHEEK)
    rect(c, 24 + twitch, 13, 6, 6, TOAST)
    rect(c, 24 + twitch, 18, 6, 2, CRUST)
    rect(c, 4, 14, 3, 5, HELMET_LT)
    rect(c, 13, 27, 6, 3, K)
    return c


def duck(bob=0):
    c = blank(K)
    base_head(c, HELMET_LT, FACE, dither=True, cy=17)
    # helicopter / duck antennas
    rect(c, 6, 4 + bob, 8, 2, GOLD)
    rect(c, 4, 3 + bob, 3, 2, RED)
    rect(c, 20, 6 + bob, 7, 2, GOLD)
    rect(c, 26, 5 + bob, 3, 2, RED)
    # mast
    rect(c, 15, 4, 2, 4, GOLD)
    eyes(c, 10, 15, 3, 2, RED, 5)
    mouth(c, 13, 21, 5, FACE_DK)
    rect(c, 26, 16, 4, 7, HANDLE)
    return c


def pizza(spark=True, tilt=0):
    c = blank(GRAYBG)
    base_head(c, HELMET, FACE, dither=True)
    # cheese hat
    rect(c, 8, 4 + tilt, 16, 6, TOAST)
    setp(c, 10, 6 + tilt, RED)
    setp(c, 14, 5 + tilt, RED)
    setp(c, 18, 7 + tilt, RED)
    setp(c, 21, 5 + tilt, RED)
    # brim
    rect(c, 7, 9 + tilt, 18, 2, BLUE)
    eyes(c, 10, 14, 3, 2, RED, 5)
    mouth(c, 13, 20, 5, FACE_DK)
    if spark:
        sparkle(c, 27, 24)
    return c


def plunger(shift=0):
    c = blank(MAROON)
    base_head(c, SILVER, FACE)
    # red cap
    rect(c, 12, 3, 8, 3, CONE)
    rect(c, 14, 2, 4, 2, CONE_LT)
    # glasses
    rect(c, 9, 13, 5, 3, RED)
    rect(c, 18, 13, 5, 3, RED)
    setp(c, 10, 14, WHITE)
    setp(c, 19, 14, WHITE)
    rect(c, 14, 14, 4, 1, RED_DK)
    mouth(c, 13, 20, 6)
    rect(c, 26 + shift, 15, 4, 8, HANDLE)
    return c


def idle(closed=False, spark=True):
    c = blank(K)
    circ(c, 15, 16, 11, FACE_DK)
    circ(c, 15, 16, 9, FACE)
    # headphones
    rect(c, 4, 13, 4, 7, HELMET)
    rect(c, 24, 13, 4, 7, HELMET)
    rect(c, 6, 8, 20, 2, HELMET)
    if closed:
        rect(c, 10, 15, 4, 1, FACE_DK)
        rect(c, 18, 15, 4, 1, FACE_DK)
    else:
        eyes(c, 10, 14, 3, 2, K, 5)
        setp(c, 11, 14, WHITE)
        setp(c, 19, 14, WHITE)
    # smile
    rect(c, 12, 20, 8, 1, FACE_DK)
    setp(c, 12, 19, FACE_DK)
    setp(c, 19, 19, FACE_DK)
    if spark:
        sparkle(c, 26, 24)
    return c


def cone(spark=True, hop=0):
    c = blank(MAROON)
    rect(c, 14, 1 + hop, 4, 3, CONE_LT)
    rect(c, 12, 4 + hop, 8, 3, CONE)
    rect(c, 10, 7 + hop, 12, 3, CONE)
    rect(c, 11, 8 + hop, 10, 1, WHITE)
    cx, cy, r = 15, 18, 10
    for yy in range(S):
        for xx in range(S):
            if (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r:
                if xx < 13:
                    c[yy][xx] = FACE
                elif xx < 19:
                    c[yy][xx] = K
                else:
                    c[yy][xx] = CYAN
    eyes(c, 10, 16, 3, 2, RED, 5)
    mouth(c, 13, 22, 6, RED_DK)
    if spark:
        sparkle(c, 26, 25)
    return c


def glitch(a, b, band_y, band_h, flash=False):
    c = [row[:] for row in a]
    for yy in range(band_y, min(S, band_y + band_h)):
        c[yy] = b[yy][:]
    if flash:
        for yy in range(0, S, 5):
            for xx in range(S):
                if (xx + yy) % 4 == 0:
                    setp(c, xx, yy, CYAN if (xx % 2 == 0) else GOLD)
    return c


def main():
    t0, t1, t2 = toaster(), toaster(twitch=1), toaster(blink=True)
    d0, d1 = duck(0), duck(1)
    p0, p1 = pizza(True, 0), pizza(False, 1)
    u0, u1 = plunger(0), plunger(1)
    i0, i1, i2 = idle(False, True), idle(True, False), idle(False, False)
    n0, n1 = cone(True, 0), cone(False, 1)

    to_img(t0, 16).save(OUT / "407.png")

    save_gif(OUT / "signal_407_toaster.gif", [t0, t0, t1, t0, t2], [220, 220, 160, 220, 90])
    save_gif(OUT / "signal_073_duck.gif", [d0, d1, d0, d0], [180, 180, 180, 280])
    save_gif(OUT / "signal_198_pizza.gif", [p0, p0, p1, p0], [200, 240, 160, 260])
    save_gif(OUT / "signal_592_plunger.gif", [u0, u1, u0, u0], [200, 160, 200, 280])
    save_gif(OUT / "signal_146_cone.gif", [n0, n1, n0, n0], [180, 160, 180, 260])
    save_gif(OUT / "signal_idle_blink.gif", [i0, i0, i0, i1, i2, i0], [280, 280, 280, 80, 140, 220])

    faces = [t0, d0, p0, u0, n0, i0]
    morph = []
    durs = []
    for i, face in enumerate(faces):
        nxt = faces[(i + 1) % len(faces)]
        morph.extend([face, face, face])
        durs.extend([180, 180, 180])
        morph.append(glitch(face, nxt, 8, 6, flash=True))
        durs.append(70)
        morph.append(glitch(nxt, face, 16, 5, flash=False))
        durs.append(60)
        morph.append(nxt)
        durs.append(90)
    save_gif(OUT / "signal_morph_wtf.gif", morph, durs)

    for p in sorted(OUT.iterdir()):
        print(f"{p.name:28} {p.stat().st_size:7} bytes")


if __name__ == "__main__":
    main()
