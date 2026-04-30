import { maps } from './maps.js';
import { Game } from './game.js';
import { getHighScore, saveHighScore } from './storage.js';
import { showScreen, Screens } from './ui.js';

// DOM Elements
const mapsListContainer = document.getElementById('maps-list');
const btnStart = document.getElementById('btn-start');
const btnBackToMenu = document.getElementById('btn-back-to-menu');
const btnResume = document.getElementById('btn-resume');
const btnQuitPaused = document.getElementById('btn-quit-paused');
const btnPlayAgain = document.getElementById('btn-play-again');
const btnQuitGameover = document.getElementById('btn-quit-gameover');

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('current-score');
const currentMapNameEl = document.getElementById('current-map-name');
const finalScoreEl = document.getElementById('final-score');

// Game State
let game = null;
let currentMapId = null;
let gameLoopId = null;
let isPaused = false;
let lastTime = 0;
let timeAccumulator = 0;

// Initialize App
function init() {
  renderMapSelection();
  setupEventListeners();
  showScreen(Screens.MAIN_MENU);
}

function renderMapSelection() {
  mapsListContainer.innerHTML = '';
  Object.values(maps).forEach(map => {
    const highScore = getHighScore(map.id);
    const btn = document.createElement('button');
    btn.className = 'map-btn';
    btn.innerHTML = `
      <span>${map.name} (${map.difficulty})</span>
      <span>High: ${highScore}</span>
    `;
    btn.addEventListener('click', () => startGame(map.id));
    mapsListContainer.appendChild(btn);
  });
}

function startGame(mapId) {
  currentMapId = mapId;
  const mapConfig = maps[mapId];
  
  game = new Game(mapConfig, handleGameOver, handleScoreChange);
  
  currentMapNameEl.textContent = mapConfig.name;
  currentScoreEl.textContent = `Score: 0`;
  
  isPaused = false;
  lastTime = performance.now();
  timeAccumulator = 0;
  
  showScreen(Screens.GAMEPLAY);
  
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  gameLoopId = requestAnimationFrame(gameLoop);
}

function handleGameOver(score) {
  cancelAnimationFrame(gameLoopId);
  saveHighScore(currentMapId, score);
  finalScoreEl.textContent = `Score: ${score}`;
  showScreen(Screens.GAME_OVER);
  renderMapSelection(); // Update high scores in UI
}

function handleScoreChange(score) {
  currentScoreEl.textContent = `Score: ${score}`;
}

function gameLoop(currentTime) {
  if (isPaused) {
    lastTime = currentTime;
    gameLoopId = requestAnimationFrame(gameLoop);
    return;
  }

  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  timeAccumulator += deltaTime;

  const mapConfig = maps[currentMapId];

  // Tick rate based on map speed
  if (timeAccumulator >= mapConfig.speed) {
    timeAccumulator -= mapConfig.speed;
    game.update();
  }

  game.draw(ctx, canvas.width, canvas.height);

  if (!game.isGameOver) {
    gameLoopId = requestAnimationFrame(gameLoop);
  }
}

function setupEventListeners() {
  btnStart.addEventListener('click', () => showScreen(Screens.MAP_SELECTION));
  btnBackToMenu.addEventListener('click', () => showScreen(Screens.MAIN_MENU));
  
  btnResume.addEventListener('click', () => {
    isPaused = false;
    showScreen(Screens.GAMEPLAY);
  });
  
  btnQuitPaused.addEventListener('click', () => showScreen(Screens.MAIN_MENU));
  
  btnPlayAgain.addEventListener('click', () => startGame(currentMapId));
  btnQuitGameover.addEventListener('click', () => showScreen(Screens.MAIN_MENU));

  window.addEventListener('keydown', (e) => {
    if (!game || game.isGameOver) return;

    if (e.key === 'Escape') {
      if (document.getElementById(Screens.GAMEPLAY).classList.contains('active')) {
        isPaused = !isPaused;
        if (isPaused) {
          showScreen(Screens.PAUSE);
        } else {
          showScreen(Screens.GAMEPLAY);
        }
      }
      return;
    }

    if (isPaused) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        game.changeDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        game.changeDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        game.changeDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        game.changeDirection({ x: 1, y: 0 });
        break;
    }
  });
}

// Start
init();
