export const Screens = {
  MAIN_MENU: 'main-menu',
  MAP_SELECTION: 'map-selection',
  GAMEPLAY: 'gameplay',
  PAUSE: 'pause-screen',
  GAME_OVER: 'game-over'
};

export function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    if (screen.id === screenId) {
      screen.classList.add('active');
    } else {
      // Don't hide gameplay if showing pause or gameover (they are overlays)
      if ((screenId === Screens.PAUSE || screenId === Screens.GAME_OVER) && screen.id === Screens.GAMEPLAY) {
        return;
      }
      screen.classList.remove('active');
    }
  });
}
