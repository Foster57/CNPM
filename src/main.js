import { maps } from './maps.js';
import { Game } from './game.js';
import { getHighScore, saveHighScore } from './storage.js';
import { 
  Screens, Overlays, showScreen, showOverlay, hideOverlays, 
  initMenuBackground, renderMapCards, renderMapDetail, 
  updateHUD, updatePauseOverlay, updateGameOverOverlay 
} from './ui.js';

// DOM Elements
const btnMenuPlay = document.getElementById('btn-menu-play');
const btnMenuMap = document.getElementById('btn-menu-map');
const btnBackToMenu = document.getElementById('btn-back-to-menu');
const btnPause = document.getElementById('btn-pause');
const btnResume = document.getElementById('btn-resume');
const btnRestartPaused = document.getElementById('btn-restart-paused');
const btnQuitPaused = document.getElementById('btn-quit-paused');
const btnPlayAgain = document.getElementById('btn-play-again');
const btnChooseMap = document.getElementById('btn-choose-map');
const btnQuitGameover = document.getElementById('btn-quit-gameover');

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game State
let game = null;
let currentMapId = 'meadow';
let gameLoopId = null;
let isPaused = false;
let lastTime = 0;
let timeAccumulator = 0;
let stopMenuAnim = null;

function init() {
  stopMenuAnim = initMenuBackground();
  updateOverallBest();
  setupEventListeners();
  showScreen(Screens.MAIN_MENU);
}

function updateOverallBest() {
  let max = 0;
  Object.keys(maps).forEach(id => {
    const hs = getHighScore(id);
    if (hs > max) max = hs;
  });
  document.getElementById('menu-overall-best').textContent = max + ' pts';
}

function handleSelectMap(mapId) {
  currentMapId = mapId;
  renderMapCards(maps, getHighScore, currentMapId, handleSelectMap);
  renderMapDetail(maps[currentMapId], getHighScore, () => startGame(currentMapId));
}

function startGame(mapId) {
  currentMapId = mapId;
  const mapConfig = maps[mapId];
  
  // Size the game canvas properly before starting
  canvas.width = 960;
  canvas.height = 640;
  
  game = new Game(mapConfig, handleGameOver, handleScoreChange);
  
  const best = getHighScore(mapId);
  updateHUD(0, best, mapConfig);
  
  isPaused = false;
  lastTime = performance.now();
  timeAccumulator = 0;
  
  hideOverlays();
  showScreen(Screens.GAMEPLAY);
  
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  gameLoopId = requestAnimationFrame(gameLoop);
}

function handleGameOver(score) {
  cancelAnimationFrame(gameLoopId);
  
  const mapConfig = maps[currentMapId];
  const oldBest = getHighScore(currentMapId);
  const isNewBest = score > oldBest;
  
  saveHighScore(currentMapId, score);
  
  updateGameOverOverlay(score, Math.max(score, oldBest), mapConfig, isNewBest);
  showOverlay(Overlays.GAME_OVER);
  updateOverallBest();
}

function handleScoreChange(score) {
  const best = Math.max(score, getHighScore(currentMapId));
  updateHUD(score, best, maps[currentMapId]);
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
  btnMenuPlay.addEventListener('click', () => {
    startGame(currentMapId);
  });
  
  btnMenuMap.addEventListener('click', () => {
    handleSelectMap(currentMapId); // pre-select and render
    showScreen(Screens.MAP_SELECTION);
  });
  
  btnBackToMenu.addEventListener('click', () => {
    updateOverallBest();
    showScreen(Screens.MAIN_MENU);
  });
  
  btnPause.addEventListener('click', () => {
    if (!game || game.isGameOver) return;
    isPaused = true;
    updatePauseOverlay(game.score, getHighScore(currentMapId));
    showOverlay(Overlays.PAUSE);
  });
  
  btnResume.addEventListener('click', () => {
    isPaused = false;
    hideOverlays();
  });
  
  btnRestartPaused.addEventListener('click', () => startGame(currentMapId));
  
  btnQuitPaused.addEventListener('click', () => {
    cancelAnimationFrame(gameLoopId);
    updateOverallBest();
    showScreen(Screens.MAIN_MENU);
  });
  
  btnPlayAgain.addEventListener('click', () => startGame(currentMapId));
  
  btnChooseMap.addEventListener('click', () => {
    cancelAnimationFrame(gameLoopId);
    handleSelectMap(currentMapId);
    showScreen(Screens.MAP_SELECTION);
  });
  
  btnQuitGameover.addEventListener('click', () => {
    updateOverallBest();
    showScreen(Screens.MAIN_MENU);
  });

  window.addEventListener('keydown', (e) => {
    // Prevent default scrolling behavior for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    if (!game || game.isGameOver) return;

    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (document.getElementById(Screens.GAMEPLAY).classList.contains('active')) {
        isPaused = !isPaused;
        if (isPaused) {
          updatePauseOverlay(game.score, getHighScore(currentMapId));
          showOverlay(Overlays.PAUSE);
        } else {
          hideOverlays();
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

init();
