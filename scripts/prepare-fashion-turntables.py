"""Prepare transparent, web-bounded fashion turntables from green-screen GIFs.

The source exports remain untouched. This script:

1. downsamples the 20 fps source to a configurable web frame rate;
2. preserves the supplied alpha channel while removing hidden green RGB safely;
3. writes animated WebP files and matching static WebP posters; and
4. can build a labelled first-frame contact sheet for scale calibration.

Example:
    python scripts/prepare-fashion-turntables.py \
      --source "C:/path/to/Best Ones" \
      --output assets/media/fashion-turntables \
      --width 600 --fps 12 --quality 72 --method 3
"""

from __future__ import annotations

import argparse
import json
import math
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


SOURCE_ORDER = [
    "Narion 4.gif",
    "Nation 1.gif",
    "Nation 1.7.1__0482dcd2.gif",
    "Nation 1.9__dd44119f.gif",
    "Nation 2.gif",
    "Nation 3.gif",
    "Nation 5.gif",
    "Nation 6.gif",
    "Nation 6.5.gif",
    "Nation 15__f3f3e811.gif",
    "Nation 16__1fa050f8.gif",
    "Nation 17__ced5b1f2.gif",
    "Nation 18__092cfe92.gif",
    "Alien 1.gif",
    "Alien 2.gif",
    "Alien 3.gif",
    "Basics 3.gif",
    "1__06d1c551.gif",
    "111__3847b65d.gif",
    "1111__c436218d.gif",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--width", type=int, default=720)
    parser.add_argument("--fps", type=float, default=12.0)
    parser.add_argument("--quality", type=int, default=74)
    parser.add_argument(
        "--method",
        type=int,
        default=3,
        choices=range(0, 7),
        metavar="0-6",
        help="WebP encoder effort. Three is the production speed/size balance.",
    )
    parser.add_argument(
        "--only",
        action="append",
        default=[],
        help="Process only a matching source filename; may be repeated.",
    )
    parser.add_argument(
        "--contact-sheet",
        type=Path,
        help="Write a labelled first-frame contact sheet and exit.",
    )
    return parser.parse_args()


def smoothstep(edge_low: float, edge_high: float, values: np.ndarray) -> np.ndarray:
    progress = np.clip((values - edge_low) / (edge_high - edge_low), 0.0, 1.0)
    return progress * progress * (3.0 - 2.0 * progress)


def prepare_frame(frame: Image.Image, output_size: tuple[int, int]) -> Image.Image:
    """Resize in premultiplied-alpha space so hidden green cannot fringe."""

    source = np.asarray(frame.convert("RGBA"), dtype=np.float32)
    source_alpha = source[..., 3:4] / 255.0
    source[..., :3] *= source_alpha

    premultiplied = Image.fromarray(
        np.clip(source, 0, 255).astype(np.uint8), "RGBA"
    ).resize(output_size, Image.Resampling.LANCZOS)
    resized = np.asarray(premultiplied, dtype=np.float32)
    resized_alpha = resized[..., 3:4] / 255.0
    colour = np.divide(
        resized[..., :3],
        resized_alpha,
        out=np.zeros_like(resized[..., :3]),
        where=resized_alpha > 0.003,
    )

    rgba = np.empty(resized.shape, dtype=np.uint8)
    rgba[..., :3] = np.clip(colour, 0, 255).astype(np.uint8)
    rgba[..., 3] = np.clip(resized[..., 3], 0, 255).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def ordered_sources(source_root: Path, requested: list[str]) -> list[Path]:
    available = {path.name: path for path in source_root.glob("*.gif")}
    missing = [name for name in SOURCE_ORDER if name not in available]
    if missing:
        raise FileNotFoundError(f"Missing expected GIFs: {', '.join(missing)}")

    ordered = [available[name] for name in SOURCE_ORDER]
    if requested:
        requested_set = {name.casefold() for name in requested}
        ordered = [path for path in ordered if path.name.casefold() in requested_set]
        unresolved = requested_set - {path.name.casefold() for path in ordered}
        if unresolved:
            raise FileNotFoundError(
                f"Requested GIFs were not found: {', '.join(sorted(unresolved))}"
            )
    return ordered


def output_dimensions(source: Image.Image, width: int) -> tuple[int, int]:
    height = round(width * source.height / source.width)
    return width, height


def frame_schedule(
    frame_count: int, source_fps: float, target_fps: float
) -> tuple[list[int], list[int]]:
    """Select evenly timed source frames and preserve the exact loop duration."""

    if frame_count < 1 or source_fps <= 0 or target_fps <= 0:
        raise ValueError("Frame count and frame rates must be positive.")

    loop_duration_ms = round((frame_count / source_fps) * 1000.0)
    effective_fps = min(source_fps, target_fps)
    output_count = max(1, round((loop_duration_ms / 1000.0) * effective_fps))
    output_count = min(frame_count, output_count)
    frame_indices = [
        min(frame_count - 1, math.floor(index * frame_count / output_count))
        for index in range(output_count)
    ]
    boundaries = [
        round(index * loop_duration_ms / output_count)
        for index in range(output_count + 1)
    ]
    frame_durations = [
        boundaries[index + 1] - boundaries[index]
        for index in range(output_count)
    ]
    return frame_indices, frame_durations


def content_bounds(image: Image.Image) -> tuple[int, int, int, int] | None:
    alpha = image.getchannel("A")
    return alpha.point(lambda value: 255 if value > 18 else 0).getbbox()


def write_contact_sheet(
    sources: list[Path], destination: Path, width: int
) -> None:
    tile_width = 270
    tile_height = 380
    columns = 4
    rows = math.ceil(len(sources) / columns)
    sheet = Image.new("RGB", (columns * tile_width, rows * tile_height), "#eeece4")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=15)

    for index, source_path in enumerate(sources):
        with Image.open(source_path) as source:
            source.seek(0)
            keyed = prepare_frame(source, output_dimensions(source, width))

        preview = keyed.copy()
        preview.thumbnail((tile_width - 28, tile_height - 62), Image.Resampling.LANCZOS)
        x = (index % columns) * tile_width
        y = (index // columns) * tile_height
        preview_x = x + (tile_width - preview.width) // 2
        preview_y = y + 12
        sheet.paste(preview, (preview_x, preview_y), preview)
        draw.text((x + 12, y + tile_height - 42), f"{index + 1:02d}  {source_path.name}", fill="#343633", font=font)

    destination.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(destination, quality=92)


def process_source(
    source_path: Path,
    index: int,
    output_root: Path,
    width: int,
    target_fps: float,
    quality: int,
    method: int,
) -> dict[str, object]:
    animated_root = output_root / "animated"
    poster_root = output_root / "posters"
    animated_root.mkdir(parents=True, exist_ok=True)
    poster_root.mkdir(parents=True, exist_ok=True)

    with Image.open(source_path) as source:
        source_fps = 1000.0 / float(source.info.get("duration", 50))
        frame_indices, frame_durations = frame_schedule(
            source.n_frames, source_fps, target_fps
        )
        size = output_dimensions(source, width)
        frames: list[Image.Image] = []

        for frame_index in frame_indices:
            source.seek(frame_index)
            frames.append(prepare_frame(source, size))

    if not frames:
        raise RuntimeError(f"No frames decoded from {source_path}")

    look_id = f"look-{index:02d}"
    poster_path = poster_root / f"{look_id}.webp"
    animation_path = animated_root / f"{look_id}.webp"
    frames[0].save(poster_path, "WEBP", quality=84, method=method, exact=False)
    frames[0].save(
        animation_path,
        "WEBP",
        save_all=True,
        append_images=frames[1:],
        duration=frame_durations,
        loop=0,
        quality=quality,
        method=method,
        minimize_size=False,
        exact=False,
    )

    bounds = content_bounds(frames[0])
    return {
        "id": look_id,
        "sourceName": source_path.name,
        "animated": f"animated/{look_id}.webp",
        "poster": f"posters/{look_id}.webp",
        "width": size[0],
        "height": size[1],
        "frames": len(frames),
        "durationMs": sum(frame_durations),
        "fps": round(len(frames) * 1000.0 / sum(frame_durations), 3),
        "contentBounds": list(bounds) if bounds else None,
        "animatedBytes": animation_path.stat().st_size,
        "posterBytes": poster_path.stat().st_size,
    }


def main() -> None:
    args = parse_args()
    sources = ordered_sources(args.source, args.only)

    if args.contact_sheet:
        write_contact_sheet(sources, args.contact_sheet, args.width)
        print(f"Wrote contact sheet: {args.contact_sheet}")
        return

    records = []
    for source_path in sources:
        source_index = SOURCE_ORDER.index(source_path.name) + 1
        print(f"Preparing {source_index:02d}/{len(SOURCE_ORDER):02d}: {source_path.name}")
        records.append(
            process_source(
                source_path,
                source_index,
                args.output,
                args.width,
                args.fps,
                args.quality,
                args.method,
            )
        )

    metadata_path = args.output / "prepared-assets.json"
    metadata_path.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(f"Wrote metadata: {metadata_path}")


if __name__ == "__main__":
    main()
