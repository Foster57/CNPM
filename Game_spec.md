# Snake Game Specification

## Overview
A simple, offline, browser-based Snake game built using Vanilla JavaScript, HTML, CSS, and Vite. The game does not require a backend or an internet connection.

## Core Gameplay
1. **Grid:** The game operates on a 20x20 grid system.
2. **Movement:** The snake can be controlled using the Arrow keys or WASD keys.
3. **Food:** Eating food increases the snake's length by 1 and increases the player's score by 10 points.
4. **Collision & Game Over:** The game ends if the snake's head collides with:
   - The boundaries of the 20x20 grid (Wall).
   - Any of the map-specific obstacles.
   - Any segment of its own body.

## Maps and Difficulty
The game features 5 distinct maps, each with varying speed and obstacle density:

| Map | Difficulty | Speed (ms/tick) | Obstacles | Theme Color |
|---|---|---|---|---|
| **Meadow** | Easy | 150 | 0 | Light Green (`#2ecc71`) |
| **Desert** | Medium | 120 | 4 | Yellow (`#f1c40f`) |
| **Ocean** | Hard | 90 | 8 | Blue (`#3498db`) |
| **Cave** | Very Hard | 60 | 16 | Gray (`#7f8c8d`) |
| **Space** | Expert | 40 | 20 | Purple (`#9b59b6`) |

## State Management and UI Screens
The game handles transitions across multiple temporary states without refreshing the page:
1. **Main Menu:** The entry point containing "Start Game" and options.
2. **Map Selection:** Displays the 5 available maps, their difficulty, and the user's high scores.
3. **Gameplay:** Displays the game canvas, the current score, and the active map's name.
4. **Pause Menu:** Activated by pressing `Escape` during gameplay. Pauses the game loop and offers options to "Resume" or "Quit to Menu".
5. **Game Over:** Displays the final score and allows the user to "Play Again" or "Quit to Menu".

## Data Persistence
- **High Scores:** The highest score achieved on each individual map is saved locally in the browser using `localStorage`. 

## Architecture
- **`index.html` & `style.css`**: Defines the UI screens and their presentation.
- **`src/main.js`**: Core setup, event listeners, and the `requestAnimationFrame` game loop.
- **`src/game.js`**: Contains the `Game` class handling snake logic, coordinates, collision detection, and canvas drawing.
- **`src/maps.js`**: Exports the configuration objects for the 5 maps.
- **`src/storage.js`**: Utility functions for managing `localStorage`.
- **`src/ui.js`**: Utility for toggling screen visibility using CSS classes.
