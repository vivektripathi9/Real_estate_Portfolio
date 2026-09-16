from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def to_webp(src: Path, dest: Path, max_w: int, quality: int, keep_alpha: bool = False) -> None:
    im = Image.open(src)
    if keep_alpha and im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
    else:
        im = im.convert("RGB")

    w, h = im.size
    if w > max_w:
        h = max(1, round(h * max_w / w))
        im = im.resize((max_w, h), Image.Resampling.LANCZOS)

    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "WEBP", quality=quality, method=6)
    before = src.stat().st_size
    after = dest.stat().st_size
    print(f"{src.name:40} {before/1024:8.0f} KB -> {after/1024:7.0f} KB  {im.size[0]}x{im.size[1]}")


jobs = [
    (ROOT / "hero_image/2022PB63_7179-5-scaled.jpg", ROOT / "hero_image/hero-1.webp", 1920, 76, False),
    (ROOT / "hero_image/bg-menu-full.jpg", ROOT / "hero_image/bg-menu-full.webp", 1600, 70, False),
    (ROOT / "hero_image/CTA.jpg", ROOT / "hero_image/CTA.webp", 1920, 74, False),
    (ROOT / "hero_image/start-skyline-a.png", ROOT / "hero_image/start-skyline-a.webp", 1920, 76, False),
    (ROOT / "hero_image/start-skyline-b.png", ROOT / "hero_image/start-skyline-b.webp", 1920, 76, False),
    (ROOT / "hero_image/second_hero.avif", ROOT / "hero_image/second_hero.webp", 1600, 76, False),
]

for src, dest, max_w, quality, alpha in jobs:
    to_webp(src, dest, max_w, quality, alpha)

for src in sorted((ROOT / "images/projects").glob("*.jpg")):
    to_webp(src, src.with_suffix(".webp"), 1100, 72, False)

for src in sorted((ROOT / "what_we_do_assets").glob("*.jpg")):
    to_webp(src, src.with_suffix(".webp"), 800, 75, False)

for src in sorted((ROOT / "what_we_do_assets").glob("*_icon.png")):
    to_webp(src, src.with_suffix(".webp"), 256, 80, True)
