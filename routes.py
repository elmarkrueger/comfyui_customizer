import os
import re
from pathlib import Path

from aiohttp import web
from server import PromptServer

_ALLOWED_FONT_EXTENSIONS = {".ttf", ".otf", ".woff", ".woff2"}
_FAMILY_SANITIZE_RE = re.compile(r"[^a-zA-Z0-9 _-]+")

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

    if _FONTS_DIR is None:
        return web.json_response({"fonts": []})

    fonts_payload = []

    if not _FONTS_DIR.exists():
        return web.json_response({"fonts": fonts_payload})

    for file_path in sorted(_FONTS_DIR.iterdir()):
        if not file_path.is_file():
            continue

        if file_path.suffix.lower() not in _ALLOWED_FONT_EXTENSIONS:
            continue

        if not _is_within_path(_FONTS_DIR, file_path):
            continue

        family_name = _safe_family_name(file_path.stem)

        fonts_payload.append(
            {
                "filename": file_path.name,
                "fontFamily": family_name,
                "url": f"/custom_theme_fonts/{file_path.name}",
                "format": file_path.suffix.lower().lstrip("."),
            }
        )

    return web.json_response({"fonts": fonts_payload})
