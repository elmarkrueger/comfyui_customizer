# Duffy Theme Control Panel (ComfyUI Nodes 2.0)

This repository contains a standalone custom node pack for ComfyUI Nodes 2.0.

## Included Node

- Duffy_ThemeControlPanel
  - Frontend utility node with no visible ports
  - Persists panel state in hidden socketless JSON
  - Applies global Nodes 2.0 styling with a versioned state model
  - Supports preset workflows (built-in and custom)

## v2 Highlights

- Versioned state contract: schemaVersion = 2
- Legacy state migration: old flat panel JSON is automatically normalized into v2 namespaces
- Expanded palette groups:
  - uiMeta (typography, preview-facing node colors, outline mode)
  - litegraphBase (node/widget/link/badge colors)
  - comfyBase (shell colors)
  - nodeSlot (slot type colors)
- Preset operations:
  - Apply built-in presets
  - Save and remove custom presets
  - Export and import custom preset JSON
- Multi-node warning: if multiple Theme Control nodes are present, runtime warns about global override behavior

## Folder Layout

- nodes/: Schema V3 backend node definitions
- src/: Vue + TypeScript source
- web/: built frontend extension assets served by ComfyUI
- fonts/: user-provided custom fonts (.ttf, .otf, .woff, .woff2)
- plans/: implementation plans and rollout documents

## Build Frontend

1. Install dependencies:
   npm install
2. Build frontend assets:
   npm run build

## Backend Routes

- GET /api/duffy/theme_fonts
  - Returns available fonts from the fonts directory
- POST /api/duffy/theme_fonts
  - Uploads one custom font file using multipart/form-data with field name font
  - Supported formats: .ttf, .otf, .woff, .woff2
  - Max upload size: 5 MB per file
- DELETE /api/duffy/theme_fonts/{filename}
  - Deletes one custom font file from the fonts directory
- /custom_theme_fonts/*
  - Static route for font file delivery

## Custom Font Workflow

- In the Theme Control Panel, use Upload Font to add a font file to the local fonts directory.
- Uploaded fonts are discovered immediately and appear in the Font Family dropdown.
- Use the delete control in the panel to remove a custom font.
- If a deleted font is currently selected, the panel falls back to the default family (Arial).
- Custom fonts are local-only: preset export/import stores the font family name, not the font file binary.

## Notes

- Target runtime is ComfyUI Nodes 2.0 with Schema V3.
- Extension architecture is Vue-first and does not implement a legacy canvas fallback.
- Theme application remains global by design.
