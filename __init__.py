import logging
from pathlib import Path

from comfy_api.latest import ComfyExtension, io

from . import routes

WEB_DIRECTORY = "./web"


def _extension_root() -> Path:
    return Path(__file__).resolve().parent


def _ensure_fonts_dir() -> Path:
    fonts_dir = _extension_root() / "fonts"
    fonts_dir.mkdir(parents=True, exist_ok=True)
    return fonts_dir


class DuffyThemeControlExtension(ComfyExtension):
    async def get_node_list(self) -> list[type[io.ComfyNode]]:
        from .nodes import NODE_LIST

        return NODE_LIST


async def comfy_entrypoint() -> DuffyThemeControlExtension:
    from .nodes import NODE_LIST

    fonts_dir = _ensure_fonts_dir()
    routes.initialize_font_routes(fonts_dir)

    logging.info("=" * 60)
    logging.info("[ Duffy_ThemeControl ] Extension Detected")
    logging.info(" -> Initializing Theme Control Panel (Nodes 2.0, Schema V3)")
    logging.info(" -> Registered %s node(s)", len(NODE_LIST))
    logging.info(" -> Fonts directory: %s", fonts_dir)
    logging.info("=" * 60)

    return DuffyThemeControlExtension()


__all__ = ["comfy_entrypoint", "WEB_DIRECTORY"]
