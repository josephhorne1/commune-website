"""Review and prepare the image collections used by the homepage.

The supplied source folders are read-only inputs. This script writes labelled
review sheets or optimized WebP copies into an explicit destination; it never
renames, deletes, or rewrites a source file.

Examples:
    python scripts/prepare-home-media.py review \
      --source "C:/Users/name/Desktop/Volume Images" \
      --output "C:/temp/volume-review" --prefix volume

    python scripts/prepare-home-media.py prepare \
      --source "C:/Users/name/Desktop/Volume Images" \
      --output assets/media/home-collections/volume \
      --selection selections/volume.txt --prefix volume --max-edge 1600
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFile, ImageFont, ImageOps


ImageFile.LOAD_TRUNCATED_IMAGES = True
SUPPORTED_SUFFIXES = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    review = subparsers.add_parser("review", help="Build labelled contact sheets.")
    review.add_argument("--source", type=Path, required=True)
    review.add_argument("--output", type=Path, required=True)
    review.add_argument("--prefix", default="media")
    review.add_argument("--per-sheet", type=int, default=40)

    prepare = subparsers.add_parser("prepare", help="Write optimized selected copies.")
    prepare.add_argument("--source", type=Path, required=True)
    prepare.add_argument("--output", type=Path, required=True)
    prepare.add_argument("--selection", type=Path, required=True)
    prepare.add_argument("--prefix", default="image")
    prepare.add_argument("--max-edge", type=int, default=1400)
    prepare.add_argument("--quality", type=int, default=82)
    prepare.add_argument("--method", type=int, default=4, choices=range(0, 7))

    fashion_grid = subparsers.add_parser(
        "fashion-grid", help="Build the compact animated mobile fashion grid."
    )
    fashion_grid.add_argument("--source", type=Path, required=True)
    fashion_grid.add_argument("--output", type=Path, required=True)
    fashion_grid.add_argument("--columns", type=int, default=5)
    fashion_grid.add_argument("--cell-width", type=int, default=144)
    fashion_grid.add_argument("--cell-height", type=int, default=180)
    fashion_grid.add_argument("--fps", type=float, default=8.0)
    fashion_grid.add_argument("--quality", type=int, default=64)
    fashion_grid.add_argument("--method", type=int, default=4, choices=range(0, 7))

    return parser.parse_args()


def source_images(root: Path) -> list[Path]:
    if not root.is_dir():
        raise FileNotFoundError(f"Source directory does not exist: {root}")
    return sorted(
        (
            path
            for path in root.rglob("*")
            if path.is_file() and path.suffix.casefold() in SUPPORTED_SUFFIXES
        ),
        key=lambda path: path.relative_to(root).as_posix().casefold(),
    )


def opened_copy(path: Path) -> Image.Image:
    with Image.open(path) as source:
        source.seek(0)
        return ImageOps.exif_transpose(source).copy()


def review_sheet(
    sources: list[Path], source_root: Path, destination: Path
) -> None:
    tile_width = 260
    tile_height = 250
    columns = 5
    rows = math.ceil(len(sources) / columns)
    background = "#efede6"
    sheet = Image.new("RGB", (columns * tile_width, rows * tile_height), background)
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=13)

    for index, source_path in enumerate(sources):
        image = opened_copy(source_path)
        original_size = image.size
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        image.thumbnail((tile_width - 22, tile_height - 58), Image.Resampling.LANCZOS)

        tile_x = (index % columns) * tile_width
        tile_y = (index // columns) * tile_height
        preview_x = tile_x + (tile_width - image.width) // 2
        preview_y = tile_y + 8 + (tile_height - 58 - image.height) // 2
        if image.mode == "RGBA":
            sheet.paste(image, (preview_x, preview_y), image)
        else:
            sheet.paste(image, (preview_x, preview_y))

        relative_name = source_path.relative_to(source_root).as_posix()
        label = f"{relative_name[:31]}\n{original_size[0]} x {original_size[1]}"
        draw.text((tile_x + 10, tile_y + tile_height - 44), label, fill="#303332", font=font)

    destination.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(destination, "JPEG", quality=90, optimize=True)


def write_review(args: argparse.Namespace) -> None:
    sources = source_images(args.source)
    if not sources:
        raise RuntimeError(f"No supported images found in {args.source}")

    args.output.mkdir(parents=True, exist_ok=True)
    for sheet_index, start in enumerate(range(0, len(sources), args.per_sheet), 1):
        batch = sources[start : start + args.per_sheet]
        destination = args.output / f"{args.prefix}-{sheet_index:02d}.jpg"
        review_sheet(batch, args.source, destination)
        print(destination)


def selected_sources(source_root: Path, selection_path: Path) -> list[Path]:
    requested = [
        line.strip()
        for line in selection_path.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]
    if not requested:
        raise RuntimeError(f"Selection is empty: {selection_path}")

    sources = []
    for relative_name in requested:
        path = source_root / relative_name
        if not path.is_file():
            raise FileNotFoundError(f"Selected source does not exist: {path}")
        if path.suffix.casefold() not in SUPPORTED_SUFFIXES:
            raise ValueError(f"Unsupported selected source: {path}")
        sources.append(path)
    return sources


def prepare_copy(
    source_path: Path,
    destination: Path,
    max_edge: int,
    quality: int,
    method: int,
) -> tuple[int, int]:
    image = opened_copy(source_path)
    if image.mode not in {"RGB", "RGBA"}:
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(
        destination,
        "WEBP",
        quality=quality,
        method=method,
        exact=image.mode == "RGBA",
    )
    return image.size


def write_prepared(args: argparse.Namespace) -> None:
    sources = selected_sources(args.source, args.selection)
    args.output.mkdir(parents=True, exist_ok=True)
    records = []

    for index, source_path in enumerate(sources, 1):
        output_name = f"{args.prefix}-{index:02d}.webp"
        destination = args.output / output_name
        width, height = prepare_copy(
            source_path,
            destination,
            args.max_edge,
            args.quality,
            args.method,
        )
        records.append(
            {
                "id": f"{args.prefix}-{index:02d}",
                "sourceName": source_path.relative_to(args.source).as_posix(),
                "file": output_name,
                "width": width,
                "height": height,
                "bytes": destination.stat().st_size,
            }
        )
        print(destination)

    manifest_path = args.output / "prepared-assets.json"
    manifest_path.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
    print(manifest_path)


def write_fashion_grid(args: argparse.Namespace) -> None:
    sources = sorted(args.source.glob("look-*.webp"))
    if not sources:
        raise RuntimeError(f"No animated look files found in {args.source}")
    if args.columns < 1 or args.cell_width < 1 or args.cell_height < 1:
        raise ValueError("Grid columns and cell dimensions must be positive.")

    opened = [Image.open(path) for path in sources]
    try:
        source_frame_count = min(image.n_frames for image in opened)
        source_duration = float(opened[0].info.get("duration", 83))
        source_fps = 1000.0 / source_duration
        loop_duration_ms = round(source_frame_count * source_duration)
        output_frame_count = max(1, round(loop_duration_ms * args.fps / 1000.0))
        rows = math.ceil(len(opened) / args.columns)
        output_size = (args.columns * args.cell_width, rows * args.cell_height)
        background = (242, 240, 233, 255)
        rule = (82, 88, 84, 34)
        frames: list[Image.Image] = []

        for output_index in range(output_frame_count):
            source_index = math.floor(output_index * source_fps / args.fps)
            frame = Image.new("RGBA", output_size, background)
            draw = ImageDraw.Draw(frame, "RGBA")

            for look_index, source in enumerate(opened):
                staggered_index = (source_index + look_index * 3) % source.n_frames
                source.seek(staggered_index)
                look = source.convert("RGBA")
                look.thumbnail(
                    (args.cell_width - 6, args.cell_height - 6),
                    Image.Resampling.LANCZOS,
                )
                column = look_index % args.columns
                row = look_index // args.columns
                x = column * args.cell_width + (args.cell_width - look.width) // 2
                y = row * args.cell_height + (args.cell_height - look.height) // 2
                frame.alpha_composite(look, (x, y))

            for column in range(1, args.columns):
                x = column * args.cell_width
                draw.line((x, 0, x, output_size[1]), fill=rule, width=1)
            for row in range(1, rows):
                y = row * args.cell_height
                draw.line((0, y, output_size[0], y), fill=rule, width=1)
            frames.append(frame)

        args.output.mkdir(parents=True, exist_ok=True)
        poster_path = args.output / "mobile-grid-poster.webp"
        animated_path = args.output / "mobile-grid.webp"
        frames[0].save(poster_path, "WEBP", quality=78, method=args.method)
        frame_duration = round(loop_duration_ms / output_frame_count)
        frames[0].save(
            animated_path,
            "WEBP",
            save_all=True,
            append_images=frames[1:],
            duration=frame_duration,
            loop=0,
            quality=args.quality,
            method=args.method,
            minimize_size=False,
            exact=False,
        )
        metadata = {
            "sourceCount": len(sources),
            "sourceFrames": source_frame_count,
            "frames": output_frame_count,
            "durationMs": frame_duration * output_frame_count,
            "fps": round(1000.0 / frame_duration, 3),
            "width": output_size[0],
            "height": output_size[1],
            "animatedBytes": animated_path.stat().st_size,
            "posterBytes": poster_path.stat().st_size,
        }
        metadata_path = args.output / "mobile-grid.json"
        metadata_path.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
        print(animated_path)
        print(poster_path)
        print(metadata_path)
    finally:
        for source in opened:
            source.close()


def main() -> None:
    args = parse_args()
    if args.command == "review":
        write_review(args)
    elif args.command == "prepare":
        write_prepared(args)
    else:
        write_fashion_grid(args)


if __name__ == "__main__":
    main()
