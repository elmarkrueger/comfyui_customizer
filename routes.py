import os
import re
from pathlib import Path

from aiohttp import web
from server import PromptServer

_ALLOWED_FONT_EXTENSIONS = {".ttf", ".otf", ".woff", ".woff2"}
_FAMILY_SANITIZE_RE = re.compile(r"[^a-zA-Z0-9 _-]+")
_UPLOAD_FILENAME_RE = re.compile(r"^[a-zA-Z0-9 _.-]{1,120}$")
_MAX_FONT_UPLOAD_BYTES = 5 * 1024 * 1024

_FONTS_DIR: Path | None = None
_STATIC_ROUTE_REGISTERED = False


def _is_within_path(base_dir: Path, target_path: Path) -> bool:
    try:
        base_resolved = base_dir.resolve()
        target_resolved = target_path.resolve()
    except OSError:
        return False

    try:
        return os.path.commonpath([str(base_resolved), str(target_resolved)]) == str(base_resolved)
    except ValueError:
        return False


def _safe_family_name(stem: str) -> str:
    cleaned = _FAMILY_SANITIZE_RE.sub("", stem).strip()
    if not cleaned:
        return "Custom Font"
    return " ".join(cleaned.split())


def _safe_upload_filename(filename: str) -> str | None:
    normalized = Path(filename).name.strip()
    if not normalized or normalized in {".", ".."}:
        return None

    normalized = " ".join(normalized.split())
    if normalized.startswith("."):
        return None

    if not _UPLOAD_FILENAME_RE.fullmatch(normalized):
        return None

    return normalized


def _font_record(file_path: Path) -> dict[str, str]:
    return {
        "filename": file_path.name,
        "fontFamily": _safe_family_name(file_path.stem),
        "url": f"/custom_theme_fonts/{file_path.name}",
        "format": file_path.suffix.lower().lstrip("."),
    }


def _collect_fonts_payload() -> list[dict[str, str]]:
    if _FONTS_DIR is None or not _FONTS_DIR.exists():
        return []

    fonts_payload: list[dict[str, str]] = []

    for file_path in sorted(_FONTS_DIR.iterdir()):
        if not file_path.is_file():
            continue

        if file_path.suffix.lower() not in _ALLOWED_FONT_EXTENSIONS:
            continue

        if not _is_within_path(_FONTS_DIR, file_path):
            continue

        fonts_payload.append(_font_record(file_path))

    return fonts_payload


def _error_response(message: str, status: int) -> web.Response:
    return web.json_response({"ok": False, "error": message}, status=status)


def initialize_font_routes(fonts_dir: Path) -> None:
    global _FONTS_DIR
    global _STATIC_ROUTE_REGISTERED

    _FONTS_DIR = fonts_dir.resolve()

    if _STATIC_ROUTE_REGISTERED:
        return

    app = PromptServer.instance.app

    for resource in app.router.resources():
        if getattr(resource, "canonical", None) == "/custom_theme_fonts":
            _STATIC_ROUTE_REGISTERED = True
            return

    app.add_routes(
        [
            web.static(
                "/custom_theme_fonts",
                str(_FONTS_DIR),
                show_index=False,
                follow_symlinks=False,
            )
        ]
    )
    _STATIC_ROUTE_REGISTERED = True


@PromptServer.instance.routes.get("/api/duffy/theme_fonts")
async def list_theme_fonts(request: web.Request) -> web.Response:
    del request

    return web.json_response({"fonts": _collect_fonts_payload()})


@PromptServer.instance.routes.post("/api/duffy/theme_fonts")
async def upload_theme_font(request: web.Request) -> web.Response:
    if _FONTS_DIR is None:
        return _error_response("Font storage is unavailable.", 503)

    if not request.content_type.startswith("multipart/"):
        return _error_response("Upload must use multipart/form-data.", 400)

    try:
        reader = await request.multipart()
    except ValueError:
        return _error_response("Invalid multipart payload.", 400)

    field = await reader.next()
    if field is None:
        return _error_response("No file was provided.", 400)

    if field.name != "font":
        return _error_response("Unexpected form field. Use 'font'.", 400)

    filename = _safe_upload_filename(field.filename or "")
    if filename is None:
        return _error_response("Invalid font filename.", 400)

    extension = Path(filename).suffix.lower()
    if extension not in _ALLOWED_FONT_EXTENSIONS:
        return _error_response("Unsupported font format.", 400)

    target_path = (_FONTS_DIR / filename).resolve()
    if not _is_within_path(_FONTS_DIR, target_path):
        return _error_response("Invalid target font path.", 400)

    if target_path.exists():
        return _error_response("A font with this filename already exists.", 409)

    try:
        _FONTS_DIR.mkdir(parents=True, exist_ok=True)
    except OSError:
        return _error_response("Failed to prepare font directory.", 500)

    total_bytes = 0

    try:
        with target_path.open("wb") as handle:
            while True:
                chunk = await field.read_chunk(size=64 * 1024)
                if not chunk:
                    break

                total_bytes += len(chunk)
                if total_bytes > _MAX_FONT_UPLOAD_BYTES:
                    raise ValueError("Uploaded font exceeds size limit.")

                handle.write(chunk)
    except ValueError as error:
        try:
            target_path.unlink(missing_ok=True)
        except OSError:
            pass
        return _error_response(str(error), 413)
    except OSError:
        try:
            target_path.unlink(missing_ok=True)
        except OSError:
            pass
        return _error_response("Failed to store uploaded font.", 500)

    if total_bytes < 1:
        try:
            target_path.unlink(missing_ok=True)
        except OSError:
            pass
        return _error_response("Uploaded font file is empty.", 400)

    return web.json_response(
        {
            "ok": True,
            "font": _font_record(target_path),
            "fonts": _collect_fonts_payload(),
        }
    )


@PromptServer.instance.routes.delete("/api/duffy/theme_fonts/{filename}")
async def delete_theme_font(request: web.Request) -> web.Response:
    if _FONTS_DIR is None:
        return _error_response("Font storage is unavailable.", 503)

    filename = _safe_upload_filename(request.match_info.get("filename", ""))
    if filename is None:
        return _error_response("Invalid font filename.", 400)

    extension = Path(filename).suffix.lower()
    if extension not in _ALLOWED_FONT_EXTENSIONS:
        return _error_response("Unsupported font format.", 400)

    target_path = (_FONTS_DIR / filename).resolve()
    if not _is_within_path(_FONTS_DIR, target_path):
        return _error_response("Invalid target font path.", 400)

    if not target_path.exists() or not target_path.is_file():
        return _error_response("Font file was not found.", 404)

    removed_family = _safe_family_name(target_path.stem)

    try:
        target_path.unlink()
    except OSError:
        return _error_response("Failed to delete font file.", 500)

    return web.json_response(
        {
            "ok": True,
            "removed": {
                "filename": filename,
                "fontFamily": removed_family,
            },
            "fonts": _collect_fonts_payload(),
        }
    )
