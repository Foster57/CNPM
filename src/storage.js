export function saveHighScore(mapId, score) {
  const currentHigh = getHighScore(mapId);
  if (score > currentHigh) {
    localStorage.setItem(`snake_high_score_${mapId}`, score);
  }
}

export function getHighScore(mapId) {
  const score = localStorage.getItem(`snake_high_score_${mapId}`);
  return score ? parseInt(score, 10) : 0;
}
