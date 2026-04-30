export const Screens = {
  MAIN_MENU: 'main-menu',
  MAP_SELECTION: 'map-selection',
  GAMEPLAY: 'gameplay'
};

export const Overlays = {
  PAUSE: 'pause-screen',
  GAME_OVER: 'game-over'
};

export function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    if (screen.id === screenId) {
      screen.classList.add('active');
    } else {
      screen.classList.remove('active');
    }
  });
}

export function showOverlay(overlayId) {
  const overlays = document.querySelectorAll('.overlay');
  overlays.forEach(overlay => {
    if (overlay.id === overlayId) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  });
}

export function hideOverlays() {
  const overlays = document.querySelectorAll('.overlay');
  overlays.forEach(overlay => {
    overlay.classList.remove('active');
  });
}

export function initMenuBackground() {
  const canvas = document.getElementById('menu-bg');
  if (!canvas) return () => {};
  const screen = canvas.parentElement;
  const ctx = canvas.getContext('2d');

  const CELL = 28;
  const BG = '#111827';
  const EMPTY = '#131f2e';
  const GREEN_HEAD = '#4ade80';
  const GREEN_BODY = '#22c55e';
  const GREEN_TAIL = '#16a34a';
  const FOOD_CLR = '#f87171';

  let W, H, cols, rows;
  let snake = [];
  let dir = {x:1,y:0};
  let food = {x:0,y:0};
  let ticker = 0;
  let frame = 0;
  let animId;

  function resize(){
    W = screen.offsetWidth || 680;
    H = screen.offsetHeight || 600;
    canvas.width = W;
    canvas.height = H;
    cols = Math.ceil(W/CELL)+2;
    rows = Math.ceil(H/CELL)+2;
    initSnake();
    placeFood();
  }

  function initSnake(){
    snake = [];
    const startX = 4, startY = Math.floor(rows/2);
    for(let i=6;i>=0;i--) snake.push({x:startX+i,y:startY});
    dir = {x:1,y:0};
  }

  function placeFood(){
    let attempts=0;
    do{
      food = {x:2+Math.floor(Math.random()*(cols-4)), y:2+Math.floor(Math.random()*(rows-4))};
      attempts++;
    }while(snake.some(s=>s.x===food.x&&s.y===food.y)&&attempts<100);
  }

  function step(){
    const head = snake[0];
    const nx = head.x + dir.x;
    const ny = head.y + dir.y;

    if(nx<0||nx>=cols||ny<0||ny>=rows||snake.slice(1).some(s=>s.x===nx&&s.y===ny)){
      initSnake();
      placeFood();
      return;
    }

    snake.unshift({x:nx,y:ny});
    if(nx===food.x&&ny===food.y){
      placeFood();
    } else {
      snake.pop();
    }

    const choices = [{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}];
    if(Math.random()<0.18){
      const valid = choices.filter(d=>!(d.x===-dir.x&&d.y===-dir.y));
      const safe = valid.filter(d=>{
        const hx=head.x+d.x,hy=head.y+d.y;
        return hx>=0&&hx<cols&&hy>=0&&hy<rows&&!snake.slice(1).some(s=>s.x===hx&&s.y===hy);
      });
      if(safe.length>0) dir=safe[Math.floor(Math.random()*safe.length)];
    }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=BG;
    ctx.fillRect(0,0,W,H);

    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        if((r+c)%2===0){
          ctx.fillStyle=EMPTY;
          ctx.fillRect(c*CELL,r*CELL,CELL-1,CELL-1);
        }
      }
    }

    const pulse = 0.55 + 0.25*Math.sin(frame*0.07);
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = FOOD_CLR;
    const fr = CELL*0.32*pulse;
    ctx.beginPath();
    ctx.arc(food.x*CELL+CELL/2, food.y*CELL+CELL/2, fr, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const len = snake.length;
    snake.forEach((seg,i)=>{
      const ratio = i/len;
      let clr;
      if(i===0) clr=GREEN_HEAD;
      else if(ratio<0.4) clr=GREEN_BODY;
      else clr=GREEN_TAIL;

      const alpha = i===0 ? 0.45 : 0.18 + (1-ratio)*0.22;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = clr;
      const pad = i===0?2:3;
      const r = i===0?5:4;
      ctx.beginPath();
      ctx.roundRect(seg.x*CELL+pad, seg.y*CELL+pad, CELL-pad*2, CELL-pad*2, r);
      ctx.fill();
    });
    ctx.globalAlpha=1;
  }

  function loop(){
    frame++;
    ticker++;
    if(ticker%6===0) step();
    draw();
    animId = requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize',resize);
  animId = requestAnimationFrame(loop);
  
  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  };
}

export function drawMapThumbnail(ctx, map, w, h) {
  const cols = 20, rows = 20;
  const cw = w / cols;
  const ch = h / rows;
  
  ctx.fillStyle = map.bg; ctx.fillRect(0, 0, w, h);
  
  for(let r=0; r<rows; r++) {
    for(let c=0; c<cols; c++) {
      if((r+c)%2===0) {
        ctx.fillStyle = map.cellA;
        ctx.fillRect(c*cw, r*ch, cw, ch);
      }
    }
  }
  
  ctx.fillStyle = map.wallClr;
  for(const obs of map.obstacles) {
    ctx.beginPath();
    ctx.roundRect(obs.x*cw+1, obs.y*ch+1, cw-2, ch-2, 2);
    ctx.fill();
  }
  
  const sx = 8, sy = 10;
  const snakeSegs = [{x:sx, y:sy}, {x:sx-1, y:sy}, {x:sx-2, y:sy}];
  snakeSegs.forEach((seg, i) => {
    ctx.fillStyle = i===0 ? map.snakeH : map.snakeB;
    ctx.globalAlpha = i===0 ? 0.9 : 0.6;
    ctx.beginPath();
    ctx.roundRect(seg.x*cw+1, seg.y*ch+1, cw-2, ch-2, 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

export function renderMapCards(maps, getHighScore, selectedMapId, onSelectMap) {
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = '';
  
  const DIFF_COLORS = ["", "#4ade80", "#86efac", "#fbbf24", "#f97316", "#f87171"];
  
  Object.values(maps).forEach(m => {
    const isSelected = m.id === selectedMapId;
    const card = document.createElement('div');
    card.className = 'card' + (isSelected ? ' active' : '');
    
    const hs = getHighScore(m.id);
    
    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'thumb';
    const cv = document.createElement('canvas');
    cv.width = 120; cv.height = 120;
    drawMapThumbnail(cv.getContext('2d'), m, 120, 120);
    thumbWrap.appendChild(cv);
    
    const diffBar = document.createElement('div');
    diffBar.className = 'diff-bar';
    for(let d=1; d<=5; d++){
      const dot = document.createElement('div');
      dot.className = 'diff-dot';
      dot.style.background = d <= m.diffLevel ? DIFF_COLORS[m.diffLevel] : 'rgba(255,255,255,.15)';
      diffBar.appendChild(dot);
    }
    thumbWrap.appendChild(diffBar);
    card.appendChild(thumbWrap);
    
    const body = document.createElement('div');
    body.className = 'card-body';
    
    const name = document.createElement('div');
    name.className = 'card-name'; name.title = m.name; name.textContent = m.shortName;
    body.appendChild(name);
    
    const hsDiv = document.createElement('div');
    hsDiv.className = 'card-hs';
    hsDiv.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10"><polygon points="5,1 6.5,4 10,4.3 7.5,6.8 8.3,10 5,8.3 1.7,10 2.5,6.8 0,4.3 3.5,4" fill="#fbbf24"/></svg>${hs}`;
    body.appendChild(hsDiv);
    
    const btn = document.createElement('button');
    btn.className = 'play-btn';
    btn.style.background = isSelected ? m.accent : 'rgba(255,255,255,.07)';
    btn.style.color = isSelected ? m.accentDim : '#9ca3af';
    btn.innerHTML = `<svg width="9" height="9" viewBox="0 0 9 9"><polygon points="2,1 8,4.5 2,8" fill="currentColor"/></svg>Play`;
    body.appendChild(btn);
    card.appendChild(body);
    
    card.addEventListener('click', () => {
      onSelectMap(m.id);
    });
    grid.appendChild(card);
  });
}

export function renderMapDetail(map, getHighScore, onPlay) {
  const panel = document.getElementById('detail-panel');
  panel.style.borderColor = `rgba(${hexToRgb(map.accent)},.25)`;
  
  const DIFF_COLORS = ["", "#4ade80", "#86efac", "#fbbf24", "#f97316", "#f87171"];
  
  const hs = getHighScore(map.id);
  
  const cv = document.createElement('canvas');
  cv.width = 180; cv.height = 180;
  drawMapThumbnail(cv.getContext('2d'), map, 180, 180);
  
  panel.innerHTML = `
    <div class="detail-thumb" id="dt"></div>
    <div class="detail-info">
      <div class="detail-name">${map.name}</div>
      <div class="detail-sub">${map.desc}</div>
      <div class="detail-stats">
        <div class="stat-box">
          <div class="stat-label">Difficulty</div>
          <div class="stat-val" style="color:${DIFF_COLORS[map.diffLevel]}">${map.difficulty}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Speed</div>
          <div class="stat-val" style="color:#e5e7eb">${map.speedLabel}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Best score</div>
          <div class="stat-val" style="color:#fbbf24">${hs}</div>
        </div>
      </div>
      <button class="detail-play" id="btn-detail-play" style="background:${map.accent};color:${map.accentDim};">
        <svg width="14" height="14" viewBox="0 0 14 14"><polygon points="3,1.5 12,7 3,12.5" fill="currentColor"/></svg>
        Play ${map.shortName}
      </button>
    </div>
  `;
  document.getElementById('dt').appendChild(cv);
  document.getElementById('btn-detail-play').addEventListener('click', onPlay);
}

function hexToRgb(hex){
  if (!hex) return "255,255,255";
  let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

export function updateHUD(score, best, map) {
  document.getElementById('current-score').textContent = score;
  document.getElementById('current-best').textContent = best;
  document.getElementById('gp-map-dot').style.background = map.accent;
  document.getElementById('gp-map-name').textContent = map.name;
  
  const speedPill = document.getElementById('gp-speed');
  speedPill.textContent = 'Speed: ' + map.speedLabel;
  speedPill.style.color = map.accent;
}

export function updatePauseOverlay(score, best) {
  document.getElementById('pause-score').textContent = score;
  document.getElementById('pause-best').textContent = best;
}

export function updateGameOverOverlay(score, best, map, isNewBest) {
  document.getElementById('go-score').textContent = score;
  document.getElementById('go-best').textContent = best;
  document.getElementById('go-new-badge').style.display = isNewBest ? 'block' : 'none';
  document.getElementById('go-map-dot').style.background = map.accent;
  document.getElementById('go-map-name').textContent = map.name;
  
  const dots = document.getElementById('go-diff-dots');
  dots.innerHTML = '';
  for(let i=1; i<=5; i++){
    const d = document.createElement('div');
    d.className = 'mr-dot2';
    d.style.background = i <= map.diffLevel ? map.accent : 'rgba(255,255,255,.12)';
    dots.appendChild(d);
  }
}
