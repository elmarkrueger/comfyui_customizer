import hashlib
import json
import re
from typing import Any

from comfy_api.latest import io

_SCHEMA_VERSION = 2
_HEX_COLOR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")
_FAMILY_RE = re.compile(r"^[a-zA-Z0-9 _-]{1,80}$")
_SAFE_CSS_RE = re.compile(r"^[#(),.%\sa-zA-Z0-9-]{1,96}$")
_PRESET_ID_RE = re.compile(r"^[a-z0-9_-]{1,48}$")
_OUTLINE_EFFECTS = {"solid", "static-glow", "pulsing-glow", "scanline"}
_SLOT_KEYS = [
    "IMAGE",
    "LATENT",
    "CONDITIONING",
    "MASK",
    "MODEL",
    "VAE",
    "CLIP",
    "CONTROL_NET",
    "SAMPLER",
    "SIGMAS",
    "NOISE",
    "GUIDER",
]

_DEFAULT_UI_META: dict[str, Any] = {
    "fontFamily": "Arial",
    "bodyFontSize": 14,
    "titleFontSize": 18,
    "textareaFontSize": 13,
    "contentTextColor": "#d9d9d9",
    "titleTextColor": "#d9d9d9",
    "ioTextColor": "#d9d9d9",
    "ioTextSize": 13,
    "slotPointSize": 12,
    "bgColor": "#242424",
    "titleBgColor": "#2f2f2f",
    "outlineColor": "#00d18f",
    "outlineEffect": "solid",
    "activePresetId": None,
}

_DEFAULT_LITEGRAPH_BASE: dict[str, Any] = {
    "NODE_TITLE_COLOR": "#d9d9d9",
    "NODE_SELECTED_TITLE_COLOR": "#ffffff",
    "NODE_TEXT_SIZE": 14,
    "NODE_TEXT_COLOR": "#d9d9d9",
    "NODE_SUBTEXT_SIZE": 12,
    "NODE_DEFAULT_COLOR": "#2f2f2f",
    "NODE_DEFAULT_BGCOLOR": "#242424",
    "NODE_DEFAULT_BOXCOLOR": "#3c3c3c",
    "NODE_BOX_OUTLINE_COLOR": "#00d18f",
    "NODE_BYPASS_BGCOLOR": "#323232",
    "DEFAULT_SHADOW_COLOR": "rgba(0, 0, 0, 0.45)",
    "WIDGET_BGCOLOR": "#1c1c1c",
    "WIDGET_OUTLINE_COLOR": "#3c3c3c",
    "WIDGET_TEXT_COLOR": "#d9d9d9",
    "WIDGET_SECONDARY_TEXT_COLOR": "#a8a8a8",
    "WIDGET_DISABLED_TEXT_COLOR": "#767676",
    "LINK_COLOR": "#9bbdff",
    "EVENT_LINK_COLOR": "#ffa14e",
    "CONNECTING_LINK_COLOR": "#8be8c7",
    "BADGE_FG_COLOR": "#f5f5f5",
    "BADGE_BG_COLOR": "#2b2b2b",
}

_DEFAULT_COMFY_BASE: dict[str, Any] = {
    "fgColor": "#f2f2f2",
    "bgColor": "#202020",
    "menuBg": "#2a2a2a",
    "inputBg": "#1f1f1f",
    "inputText": "#f2f2f2",
    "descriptionText": "#a9a9a9",
    "errorText": "#ff5f5f",
    "borderColor": "#3a3a3a",
    "barShadow": "rgba(0, 0, 0, 0.4)",
}

_DEFAULT_NODE_SLOT: dict[str, Any] = {
    "IMAGE": "#64B5F6",
    "LATENT": "#FF9CF9",
    "CONDITIONING": "#50FA7B",
    "MASK": "#81C784",
    "MODEL": "#B39DDB",
    "VAE": "#FF6E6E",
    "CLIP": "#FFD500",
    "CONTROL_NET": "#6EE7B7",
    "SAMPLER": "#ECB4B4",
    "SIGMAS": "#CDFFCD",
    "NOISE": "#B0B0B0",
    "GUIDER": "#9fd8ff",
}

_DEFAULT_PANEL_STATE: dict[str, Any] = {
    "schemaVersion": _SCHEMA_VERSION,
    "uiMeta": _DEFAULT_UI_META,
    "litegraphBase": _DEFAULT_LITEGRAPH_BASE,
    "comfyBase": _DEFAULT_COMFY_BASE,
    "nodeSlot": _DEFAULT_NODE_SLOT,
    "presets": {
        "custom": [],
    },
}


def _is_record(value: Any) -> bool:
    return isinstance(value, dict)


def _clamp_int(value: Any, minimum: int, maximum: int, fallback: int) -> int:
    try:
        number = int(round(float(value)))
    except (TypeError, ValueError):
        return fallback
    return max(minimum, min(maximum, number))


def _sanitize_hex(value: Any, fallback: str) -> str:
    text = value.strip() if isinstance(value, str) else ""
    return text if _HEX_COLOR_RE.fullmatch(text) else fallback


def _sanitize_css_color(value: Any, fallback: str) -> str:
    text = value.strip() if isinstance(value, str) else ""
    return text if _SAFE_CSS_RE.fullmatch(text) else fallback


def _sanitize_family(value: Any, fallback: str) -> str:
    text = value.strip() if isinstance(value, str) else ""
    return text if _FAMILY_RE.fullmatch(text) else fallback


def _sanitize_outline_effect(value: Any, fallback: str) -> str:
    text = value if isinstance(value, str) else ""
    return text if text in _OUTLINE_EFFECTS else fallback


def _sanitize_preset_id(value: Any) -> str | None:
    text = value.strip().lower() if isinstance(value, str) else ""
    if not text:
        return None
    return text if _PRESET_ID_RE.fullmatch(text) else None


def _sanitize_ui_meta(value: Any) -> dict[str, Any]:
    source = value if _is_record(value) else {}
    return {
        "fontFamily": _sanitize_family(source.get("fontFamily"), _DEFAULT_UI_META["fontFamily"]),
        "bodyFontSize": _clamp_int(source.get("bodyFontSize"), 8, 56, _DEFAULT_UI_META["bodyFontSize"]),
        "titleFontSize": _clamp_int(source.get("titleFontSize"), 8, 72, _DEFAULT_UI_META["titleFontSize"]),
        "textareaFontSize": _clamp_int(source.get("textareaFontSize"), 8, 56, _DEFAULT_UI_META["textareaFontSize"]),
        "contentTextColor": _sanitize_hex(source.get("contentTextColor"), _DEFAULT_UI_META["contentTextColor"]),
        "titleTextColor": _sanitize_hex(source.get("titleTextColor"), _DEFAULT_UI_META["titleTextColor"]),
        "ioTextColor": _sanitize_hex(source.get("ioTextColor"), _DEFAULT_UI_META["ioTextColor"]),
        "ioTextSize": _clamp_int(source.get("ioTextSize"), 8, 40, _DEFAULT_UI_META["ioTextSize"]),
        "slotPointSize": _clamp_int(source.get("slotPointSize"), 6, 26, _DEFAULT_UI_META["slotPointSize"]),
        "bgColor": _sanitize_hex(source.get("bgColor"), _DEFAULT_UI_META["bgColor"]),
        "titleBgColor": _sanitize_hex(source.get("titleBgColor"), _DEFAULT_UI_META["titleBgColor"]),
        "outlineColor": _sanitize_hex(source.get("outlineColor"), _DEFAULT_UI_META["outlineColor"]),
        "outlineEffect": _sanitize_outline_effect(source.get("outlineEffect"), _DEFAULT_UI_META["outlineEffect"]),
        "activePresetId": _sanitize_preset_id(source.get("activePresetId")),
    }


def _sanitize_litegraph_base(value: Any) -> dict[str, Any]:
    source = value if _is_record(value) else {}
    return {
        "NODE_TITLE_COLOR": _sanitize_hex(source.get("NODE_TITLE_COLOR"), _DEFAULT_LITEGRAPH_BASE["NODE_TITLE_COLOR"]),
        "NODE_SELECTED_TITLE_COLOR": _sanitize_hex(
            source.get("NODE_SELECTED_TITLE_COLOR"),
            _DEFAULT_LITEGRAPH_BASE["NODE_SELECTED_TITLE_COLOR"],
        ),
        "NODE_TEXT_SIZE": _clamp_int(source.get("NODE_TEXT_SIZE"), 8, 56, _DEFAULT_LITEGRAPH_BASE["NODE_TEXT_SIZE"]),
        "NODE_TEXT_COLOR": _sanitize_hex(source.get("NODE_TEXT_COLOR"), _DEFAULT_LITEGRAPH_BASE["NODE_TEXT_COLOR"]),
        "NODE_SUBTEXT_SIZE": _clamp_int(
            source.get("NODE_SUBTEXT_SIZE"),
            8,
            48,
            _DEFAULT_LITEGRAPH_BASE["NODE_SUBTEXT_SIZE"],
        ),
        "NODE_DEFAULT_COLOR": _sanitize_hex(source.get("NODE_DEFAULT_COLOR"), _DEFAULT_LITEGRAPH_BASE["NODE_DEFAULT_COLOR"]),
        "NODE_DEFAULT_BGCOLOR": _sanitize_hex(
            source.get("NODE_DEFAULT_BGCOLOR"),
            _DEFAULT_LITEGRAPH_BASE["NODE_DEFAULT_BGCOLOR"],
        ),
        "NODE_DEFAULT_BOXCOLOR": _sanitize_hex(
            source.get("NODE_DEFAULT_BOXCOLOR"),
            _DEFAULT_LITEGRAPH_BASE["NODE_DEFAULT_BOXCOLOR"],
        ),
        "NODE_BOX_OUTLINE_COLOR": _sanitize_hex(
            source.get("NODE_BOX_OUTLINE_COLOR"),
            _DEFAULT_LITEGRAPH_BASE["NODE_BOX_OUTLINE_COLOR"],
        ),
        "NODE_BYPASS_BGCOLOR": _sanitize_hex(
            source.get("NODE_BYPASS_BGCOLOR"),
            _DEFAULT_LITEGRAPH_BASE["NODE_BYPASS_BGCOLOR"],
        ),
        "DEFAULT_SHADOW_COLOR": _sanitize_css_color(
            source.get("DEFAULT_SHADOW_COLOR"),
            _DEFAULT_LITEGRAPH_BASE["DEFAULT_SHADOW_COLOR"],
        ),
        "WIDGET_BGCOLOR": _sanitize_hex(source.get("WIDGET_BGCOLOR"), _DEFAULT_LITEGRAPH_BASE["WIDGET_BGCOLOR"]),
        "WIDGET_OUTLINE_COLOR": _sanitize_hex(
            source.get("WIDGET_OUTLINE_COLOR"),
            _DEFAULT_LITEGRAPH_BASE["WIDGET_OUTLINE_COLOR"],
        ),
        "WIDGET_TEXT_COLOR": _sanitize_hex(source.get("WIDGET_TEXT_COLOR"), _DEFAULT_LITEGRAPH_BASE["WIDGET_TEXT_COLOR"]),
        "WIDGET_SECONDARY_TEXT_COLOR": _sanitize_hex(
            source.get("WIDGET_SECONDARY_TEXT_COLOR"),
            _DEFAULT_LITEGRAPH_BASE["WIDGET_SECONDARY_TEXT_COLOR"],
        ),
        "WIDGET_DISABLED_TEXT_COLOR": _sanitize_hex(
            source.get("WIDGET_DISABLED_TEXT_COLOR"),
            _DEFAULT_LITEGRAPH_BASE["WIDGET_DISABLED_TEXT_COLOR"],
        ),
        "LINK_COLOR": _sanitize_hex(source.get("LINK_COLOR"), _DEFAULT_LITEGRAPH_BASE["LINK_COLOR"]),
        "EVENT_LINK_COLOR": _sanitize_hex(source.get("EVENT_LINK_COLOR"), _DEFAULT_LITEGRAPH_BASE["EVENT_LINK_COLOR"]),
        "CONNECTING_LINK_COLOR": _sanitize_hex(
            source.get("CONNECTING_LINK_COLOR"),
            _DEFAULT_LITEGRAPH_BASE["CONNECTING_LINK_COLOR"],
        ),
        "BADGE_FG_COLOR": _sanitize_hex(source.get("BADGE_FG_COLOR"), _DEFAULT_LITEGRAPH_BASE["BADGE_FG_COLOR"]),
        "BADGE_BG_COLOR": _sanitize_hex(source.get("BADGE_BG_COLOR"), _DEFAULT_LITEGRAPH_BASE["BADGE_BG_COLOR"]),
    }


def _sanitize_comfy_base(value: Any) -> dict[str, Any]:
    source = value if _is_record(value) else {}
    return {
        "fgColor": _sanitize_hex(source.get("fgColor"), _DEFAULT_COMFY_BASE["fgColor"]),
        "bgColor": _sanitize_hex(source.get("bgColor"), _DEFAULT_COMFY_BASE["bgColor"]),
        "menuBg": _sanitize_hex(source.get("menuBg"), _DEFAULT_COMFY_BASE["menuBg"]),
        "inputBg": _sanitize_hex(source.get("inputBg"), _DEFAULT_COMFY_BASE["inputBg"]),
        "inputText": _sanitize_hex(source.get("inputText"), _DEFAULT_COMFY_BASE["inputText"]),
        "descriptionText": _sanitize_hex(source.get("descriptionText"), _DEFAULT_COMFY_BASE["descriptionText"]),
        "errorText": _sanitize_hex(source.get("errorText"), _DEFAULT_COMFY_BASE["errorText"]),
        "borderColor": _sanitize_hex(source.get("borderColor"), _DEFAULT_COMFY_BASE["borderColor"]),
        "barShadow": _sanitize_css_color(source.get("barShadow"), _DEFAULT_COMFY_BASE["barShadow"]),
    }


def _sanitize_node_slot(value: Any) -> dict[str, Any]:
    source = value if _is_record(value) else {}
    normalized = dict(_DEFAULT_NODE_SLOT)
    for key in _SLOT_KEYS:
        normalized[key] = _sanitize_hex(source.get(key), _DEFAULT_NODE_SLOT[key])
    return normalized


def _sanitize_presets(value: Any) -> dict[str, Any]:
    if not _is_record(value):
        return {"custom": []}

    custom_value = value.get("custom")
    if not isinstance(custom_value, list):
        return {"custom": []}

    seen: set[str] = set()
    custom: list[dict[str, Any]] = []
    for index, item in enumerate(custom_value):
        if not _is_record(item):
            continue

        preset_id = _sanitize_preset_id(item.get("id")) or f"preset_{index + 1}"
        if preset_id in seen:
            continue
        seen.add(preset_id)

        preset_name = item.get("name") if isinstance(item.get("name"), str) else "Untitled Preset"
        preset_name = preset_name.strip()[:60] or "Untitled Preset"
        snapshot = item.get("snapshot") if _is_record(item.get("snapshot")) else item

        custom.append(
            {
                "id": preset_id,
                "name": preset_name,
                "snapshot": {
                    "uiMeta": _sanitize_ui_meta(snapshot.get("uiMeta")),
                    "litegraphBase": _sanitize_litegraph_base(snapshot.get("litegraphBase")),
                    "comfyBase": _sanitize_comfy_base(snapshot.get("comfyBase")),
                    "nodeSlot": _sanitize_node_slot(snapshot.get("nodeSlot")),
                },
            }
        )

    return {"custom": custom}


def _is_v2_shape(value: dict[str, Any]) -> bool:
    return value.get("schemaVersion") == 2 or (_is_record(value.get("uiMeta")) and _is_record(value.get("litegraphBase")))


def _migrate_legacy_state(value: dict[str, Any]) -> dict[str, Any]:
    legacy_font_color = _sanitize_hex(value.get("fontColor"), _DEFAULT_UI_META["contentTextColor"])
    content_text_color = _sanitize_hex(value.get("contentTextColor"), legacy_font_color)
    title_text_color = _sanitize_hex(value.get("titleTextColor"), legacy_font_color)
    io_text_color = _sanitize_hex(value.get("ioTextColor"), legacy_font_color)
    bg_color = _sanitize_hex(value.get("bgColor"), _DEFAULT_UI_META["bgColor"])
    title_bg_color = _sanitize_hex(value.get("titleBgColor"), _DEFAULT_UI_META["titleBgColor"])
    outline_color = _sanitize_hex(value.get("outlineColor"), _DEFAULT_UI_META["outlineColor"])

    return {
        "schemaVersion": 2,
        "uiMeta": {
            **_DEFAULT_UI_META,
            "fontFamily": value.get("fontFamily"),
            "bodyFontSize": value.get("bodyFontSize"),
            "titleFontSize": value.get("titleFontSize"),
            "textareaFontSize": value.get("textareaFontSize"),
            "contentTextColor": content_text_color,
            "titleTextColor": title_text_color,
            "ioTextColor": io_text_color,
            "ioTextSize": value.get("ioTextSize"),
            "slotPointSize": value.get("slotPointSize"),
            "bgColor": bg_color,
            "titleBgColor": title_bg_color,
            "outlineColor": outline_color,
            "outlineEffect": value.get("outlineEffect"),
            "activePresetId": None,
        },
        "litegraphBase": {
            **_DEFAULT_LITEGRAPH_BASE,
            "NODE_TEXT_SIZE": value.get("bodyFontSize"),
            "NODE_SUBTEXT_SIZE": value.get("textareaFontSize"),
            "NODE_TEXT_COLOR": content_text_color,
            "NODE_TITLE_COLOR": title_text_color,
            "NODE_SELECTED_TITLE_COLOR": title_text_color,
            "NODE_DEFAULT_BGCOLOR": bg_color,
            "NODE_DEFAULT_COLOR": title_bg_color,
            "NODE_BOX_OUTLINE_COLOR": outline_color,
            "WIDGET_BGCOLOR": bg_color,
            "WIDGET_OUTLINE_COLOR": outline_color,
            "WIDGET_TEXT_COLOR": content_text_color,
            "WIDGET_SECONDARY_TEXT_COLOR": io_text_color,
            "LINK_COLOR": outline_color,
        },
        "comfyBase": {
            **_DEFAULT_COMFY_BASE,
            "fgColor": content_text_color,
            "bgColor": bg_color,
            "menuBg": title_bg_color,
            "inputText": content_text_color,
        },
        "nodeSlot": dict(_DEFAULT_NODE_SLOT),
        "presets": {"custom": []},
    }


def _sanitize_panel_state(value: Any) -> dict[str, Any]:
    if not _is_record(value):
        raise ValueError("panel_state must be a JSON object")

    base = value if _is_v2_shape(value) else _migrate_legacy_state(value)
    if not _is_record(base):
        raise ValueError("panel_state has invalid shape")

    ui_meta = _sanitize_ui_meta(base.get("uiMeta"))
    litegraph_base = _sanitize_litegraph_base(base.get("litegraphBase"))

    return {
        "schemaVersion": _SCHEMA_VERSION,
        "uiMeta": ui_meta,
        "litegraphBase": {
            **litegraph_base,
            "NODE_TEXT_SIZE": _clamp_int(ui_meta.get("bodyFontSize"), 8, 56, litegraph_base["NODE_TEXT_SIZE"]),
            "NODE_SUBTEXT_SIZE": _clamp_int(ui_meta.get("textareaFontSize"), 8, 48, litegraph_base["NODE_SUBTEXT_SIZE"]),
        },
        "comfyBase": _sanitize_comfy_base(base.get("comfyBase")),
        "nodeSlot": _sanitize_node_slot(base.get("nodeSlot")),
        "presets": _sanitize_presets(base.get("presets")),
    }


def _canonical_state_json(value: dict[str, Any]) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"))


class DuffyThemeControlPanel(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="Duffy_ThemeControlPanel",
            display_name="Theme Control Panel",
            category="Duffy/Utility",
            description=(
                "Global typography and color control panel for ComfyUI Nodes 2.0. "
                "This node has no visible ports and stores its state in hidden JSON."
            ),
            inputs=[
                io.String.Input(
                    "panel_state",
                    default=_canonical_state_json(_DEFAULT_PANEL_STATE),
                    socketless=True,
                    tooltip="Internal JSON state used by the frontend control panel.",
                ),
            ],
            outputs=[],
        )

    @classmethod
    def validate_inputs(cls, panel_state: str, **kwargs) -> bool | str:
        del kwargs
        try:
            data = json.loads(panel_state)
        except json.JSONDecodeError:
            return "panel_state must be valid JSON"

        if not isinstance(data, dict):
            return "panel_state must be a JSON object"

        if len(panel_state) > 500_000:
            return "panel_state exceeds maximum supported size"

        try:
            _sanitize_panel_state(data)
        except ValueError as error:
            return str(error)

        return True

    @classmethod
    def fingerprint_inputs(cls, panel_state: str, **kwargs) -> str:
        del kwargs
        try:
            parsed = json.loads(panel_state)
            normalized = _sanitize_panel_state(parsed)
            payload = _canonical_state_json(normalized)
        except (json.JSONDecodeError, ValueError):
            payload = panel_state

        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    @classmethod
    def execute(cls, panel_state: str, **kwargs) -> io.NodeOutput:
        del panel_state, kwargs
        return io.NodeOutput()
