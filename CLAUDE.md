# CLAUDE.md

## Project Overview

Bottle Bingo is a mobile-first single-page web app where users play bingo by spotting spirit bottles at bars. A 5x5 grid of randomized bottles is generated from a pool of 28, and players mark bottles as found. Completing a row, column, or diagonal triggers a bingo win.

## Tech Stack

- **Vanilla HTML/CSS/JS** — no frameworks, no build step
- **CSS Cascade Layers** — layered as: reset, theme, base, components, utilities
- **LocalStorage** — persists game state across sessions
- **GitHub Pages** — static deployment, no server required

## Project Structure

```
bottle-bingo/
├── index.html                 # Entry point, all HTML structure
├── bottles.json               # Bottle database (28 entries with name + image path)
├── src/
│   ├── js/
│   │   └── main.js            # All game logic, state management, DOM manipulation
│   ├── css/
│   │   ├── app.css            # Layer imports (order matters)
│   │   ├── reset.css          # CSS reset/normalization
│   │   ├── theme.css          # CSS custom properties (spacing, fonts)
│   │   ├── base.css           # Body, main, header base styles
│   │   ├── components.css     # Buttons, grid, cells, overlay, animations
│   │   └── utilities.css      # Utility classes (.hidden, .column, etc.)
│   └── images/                # 28 WebP bottle images
├── README.md
├── LICENSE                    # MIT (Luis Ball, 2025)
└── CLAUDE.md                  # This file
```

## Key Architecture Decisions

### CSS Layer Order
Defined in `src/css/app.css`. The layer order controls specificity: reset < theme < base < components < utilities. All component styles live in `components.css` under `@layer components`.

### Image Paths
`bottles.json` stores paths as `images/italicus.webp`. In `main.js`, images are referenced as `src/${bottle.image}` (resolving to `src/images/italicus.webp` relative to `index.html`).

### Bingo Cell Layout
Each cell uses CSS grid with both the image and text label placed in `grid-area: 1 / 1` so they stack. The text label sits at the bottom (`align-self: end`) with a semi-transparent background. The image uses `object-fit: contain` and fills the cell.

### State Management
A single `gameState` object holds all state: `board` (25 bottles), `crossed` (25 booleans), `gameStarted`, `boardsUsedToday`, `lastResetDate`. Stored in localStorage under key `bottleBingoState`.

### Daily Board Limit
Users get 3 new boards per day. Getting a bingo resets this counter.

## Common Tasks

### Adding a new bottle
1. Add the WebP image to `src/images/`
2. Add an entry to the `BOTTLES` array in `src/js/main.js` with `name` and `image` fields
3. Also add to `bottles.json` for consistency (currently not imported at runtime)

### Modifying styles
- Theme variables (spacing, fonts): `src/css/theme.css`
- Component styles (grid, cells, buttons, overlay): `src/css/components.css`
- Base layout (body, header): `src/css/base.css`

### Running locally
Open `index.html` directly in a browser or use any static file server. No build step required.

## Things to Watch Out For

- `bottles.json` exists but is **not imported** at runtime — the bottle list is duplicated as a const in `main.js`
- The overlay's `openOverlay` function still uses placeholder gradient backgrounds instead of the actual bottle image
- The CSS uses `-webkit-line-clamp` for text truncation which requires `-webkit-box-orient: vertical` and `display: -webkit-box`
- No test suite exists — changes should be verified visually in a browser
