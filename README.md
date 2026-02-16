# 🍸 Bottle Bingo

A fun mobile web app for spotting obscure and common spirit bottles at bars with friends!

## How It Works

1. Generate a random 5x5 bingo board with 25 bottles
2. Start the game
3. Tap on bottles to see details and mark them as found
4. Get BINGO by completing a row, column, or diagonal!

## Features

- 📱 Mobile-first responsive design
- 💾 LocalStorage persistence (your game state is saved)
- 🎲 Random board generation
- 🔀 Shuffle board before starting
- 🖼️ Expandable overlay for bottle details
- ✅ Easy mark/unmark bottles
- 🎉 Automatic bingo detection

## Repository Structure

```
bottle-bingo/
├── index.html          # Main game file
├── bottles.json        # Bottle database
├── src/
│   ├── js/
│   │   └── main.js     # Game logic and state management
│   ├── css/
│   │   ├── app.css     # CSS layer imports
│   │   ├── reset.css   # CSS reset
│   │   ├── theme.css   # CSS custom properties
│   │   ├── base.css    # Base styles
│   │   ├── components.css # Component styles
│   │   └── utilities.css  # Utility classes
│   └── images/         # Bottle images (WebP)
├── CLAUDE.md           # Development context for AI assistants
├── LICENSE             # MIT License
└── README.md           # This file
```

## Setup

1. Create a new GitHub repository
2. Upload these files to the repository
3. Add your bottle images (WebP format) to `src/images/`
4. Enable GitHub Pages:
   - Go to Settings > Pages
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)"
   - Save

Your app will be live at: `https://[your-username].github.io/[repo-name]/`

## Adding Bottles

Edit the `BOTTLES` array in `src/js/main.js` and add bottle images (WebP) to `src/images/`:

```json
{
  "name": "Your Bottle Name",
  "image": "images/your-bottle.webp"
}
```

## Game Flow

### Before Game Starts
- **Generate New Board**: Creates a random 5x5 board from available bottles
- **Start Game**: Locks the board and enables gameplay

### During Pre-Game
- **Shuffle**: Rearranges the current board
- **Generate New Board**: Creates a completely new random board

### During Game
- **Tap any bottle**: Opens overlay with details
- **Mark Found/Unmark**: Toggle bottle status
- **New Board**: Generate a new game board
- **Shuffle**: Rearrange current board

### Winning
- Complete any row, column, or diagonal
- "🎉 BINGO! 🎉" appears at the top
- Tap the BINGO message to return to start screen

## LocalStorage

Game state is automatically saved and includes:
- Current board configuration
- Crossed-off bottles
- Game started status

Your progress persists across sessions!

## Customization

The app uses native CSS with CSS Cascade Layers and custom properties. Styles are organized across multiple files in `src/css/`. Theme variables are in `theme.css` and component styles in `components.css`.

## Future Enhancements

- Admin page for managing bottles
- Image upload functionality
- Multiple board sizes
- Score tracking
- Friend challenges

---

Made with 🍸 for cocktail lovers
