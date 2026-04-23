from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "brand"
OUT.mkdir(parents=True, exist_ok=True)


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/Avenir Next.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
        "/System/Library/Fonts/SFNS.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size, index=1 if bold else 0)
        except Exception:
            continue
    return ImageFont.load_default()


def text_center(draw, xy, text, face, fill, anchor="mm", stroke_width=0, stroke_fill=None):
    draw.text(xy, text, font=face, fill=fill, anchor=anchor, stroke_width=stroke_width, stroke_fill=stroke_fill)


def gradient(size, top, bottom):
    width, height = size
    img = Image.new("RGB", size, top)
    px = img.load()
    for y in range(height):
        t = y / max(1, height - 1)
        color = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(width):
            px[x, y] = color
    return img.convert("RGBA")


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_mark(size=512, with_bg=True):
    img = gradient((size, size), (34, 19, 6), (10, 7, 4))
    draw = ImageDraw.Draw(img, "RGBA")

    cx = cy = size / 2
    if with_bg:
        for angle in range(0, 360, 12):
            outer = size * 0.47
            inner = size * 0.18
            rad = math.radians(angle)
            draw.line(
                (cx + math.cos(rad) * inner, cy + math.sin(rad) * inner, cx + math.cos(rad) * outer, cy + math.sin(rad) * outer),
                fill=(255, 214, 107, 32),
                width=max(1, size // 130),
            )

    for offset, alpha in [(18, 50), (0, 110)]:
        tower = [
            (cx, size * 0.12 + offset),
            (size * 0.82, size * 0.88 + offset),
            (size * 0.18, size * 0.88 + offset),
        ]
        draw.polygon(tower, fill=(216, 161, 42, alpha))

    tower = [(cx, size * 0.11), (size * 0.82, size * 0.88), (size * 0.18, size * 0.88)]
    draw.polygon(tower, fill=(238, 171, 42, 255))
    draw.polygon([(cx, size * 0.11), (size * 0.82, size * 0.88), (cx, size * 0.78)], fill=(121, 65, 16, 170))
    draw.polygon([(cx, size * 0.11), (size * 0.18, size * 0.88), (cx, size * 0.78)], fill=(255, 226, 131, 160))

    left_ear = [(size * 0.34, size * 0.18), (size * 0.45, size * 0.36), (size * 0.25, size * 0.36)]
    right_ear = [(size * 0.66, size * 0.18), (size * 0.75, size * 0.36), (size * 0.55, size * 0.36)]
    draw.polygon(left_ear, fill=(255, 226, 131, 255))
    draw.polygon(right_ear, fill=(255, 226, 131, 255))

    for y, width in [(0.33, 0.24), (0.45, 0.34), (0.58, 0.45), (0.71, 0.56), (0.84, 0.66)]:
        bar_w = size * width
        bar_h = max(5, size * 0.03)
        rounded_rect(
            draw,
            (cx - bar_w / 2, size * y - bar_h / 2, cx + bar_w / 2, size * y + bar_h / 2),
            radius=int(bar_h / 2),
            fill=(41, 20, 4, 205),
        )

    face_r = size * 0.118
    draw.ellipse((cx - face_r, size * 0.51 - face_r, cx + face_r, size * 0.51 + face_r), fill=(255, 242, 196, 220), outline=(55, 25, 4, 185), width=max(3, size // 80))
    eye_r = max(3, size * 0.014)
    draw.ellipse((cx - size * 0.041 - eye_r, size * 0.49 - eye_r, cx - size * 0.041 + eye_r, size * 0.49 + eye_r), fill=(31, 15, 3, 255))
    draw.ellipse((cx + size * 0.041 - eye_r, size * 0.49 - eye_r, cx + size * 0.041 + eye_r, size * 0.49 + eye_r), fill=(31, 15, 3, 255))
    text_center(draw, (cx, size * 0.58), "50F", font(int(size * 0.07), bold=True), (31, 15, 3, 255))

    draw.ellipse((size * 0.12, size * 0.15, size * 0.23, size * 0.26), outline=(255, 226, 131, 210), width=max(3, size // 80))
    draw.ellipse((size * 0.75, size * 0.22, size * 0.86, size * 0.33), outline=(255, 226, 131, 180), width=max(3, size // 90))
    draw.ellipse((size * 0.72, size * 0.72, size * 0.84, size * 0.84), outline=(255, 226, 131, 150), width=max(3, size // 90))

    return img


def wordmark():
    width, height = 1500, 420
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    mark = draw_mark(330).resize((320, 320), Image.Resampling.LANCZOS)
    img.alpha_composite(mark, (42, 52))
    draw = ImageDraw.Draw(img, "RGBA")

    draw.text((400, 92), "GOLDEN", font=font(72, bold=True), fill=(255, 214, 107, 255), anchor="la")
    draw.text((400, 166), "NYANKO TOWER", font=font(96, bold=True), fill=(255, 242, 196, 255), anchor="la")
    draw.line((404, 282, 1190, 282), fill=(216, 161, 42, 210), width=4)
    draw.ellipse((1220, 36, 1344, 160), fill=(255, 214, 107, 235), outline=(255, 242, 196, 180), width=5)
    draw.text((1282, 92), "50F", font=font(62, bold=True), fill=(31, 15, 3, 255), anchor="mm")
    draw.text((408, 306), "OGON NYANKO TO / battlecats.lol", font=font(42), fill=(216, 193, 141, 255), anchor="la")
    return img


def social_card():
    width, height = 1200, 630
    img = gradient((width, height), (38, 21, 6), (9, 6, 4))
    draw = ImageDraw.Draw(img, "RGBA")

    for angle in range(0, 360, 8):
        rad = math.radians(angle)
        draw.line((880, 315, 880 + math.cos(rad) * 410, 315 + math.sin(rad) * 410), fill=(255, 214, 107, 26), width=2)

    rounded_rect(draw, (60, 60, 1140, 570), 44, fill=(255, 214, 107, 18), outline=(255, 214, 107, 70), width=2)
    rounded_rect(draw, (88, 88, 666, 542), 30, fill=(25, 15, 7, 188), outline=(255, 214, 107, 44), width=2)
    rounded_rect(draw, (704, 108, 1122, 520), 18, fill=(25, 15, 7, 228), outline=(255, 214, 107, 90), width=2)
    mark = draw_mark(420).filter(ImageFilter.SHARPEN)
    img.alpha_composite(mark, (704, 100))
    draw.text((118, 144), "GOLDEN", font=font(56, bold=True), fill=(255, 214, 107, 255), anchor="la")
    draw.text((118, 224), "NYANKO TOWER", font=font(78, bold=True), fill=(255, 242, 196, 255), anchor="la")
    draw.text((122, 334), "rewards up / 50F / metal prep", font=font(32), fill=(216, 193, 141, 255), anchor="la")
    draw.text((122, 386), "fan strategy memo", font=font(32), fill=(216, 193, 141, 255), anchor="la")
    draw.text((104, 494), "battlecats.lol", font=font(36, bold=True), fill=(255, 214, 107, 255), anchor="la")
    return img


def main():
    mark = draw_mark(512)
    mark.save(OUT / "logo-mark.png")
    mark.resize((256, 256), Image.Resampling.LANCZOS).save(OUT / "favicon.png")
    mark.resize((180, 180), Image.Resampling.LANCZOS).save(OUT / "apple-touch-icon.png")
    mark.resize((256, 256), Image.Resampling.LANCZOS).save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (128, 128), (256, 256)])
    wordmark().save(OUT / "logo-wordmark.png")
    social_card().save(OUT / "social-card.png")


if __name__ == "__main__":
    main()
