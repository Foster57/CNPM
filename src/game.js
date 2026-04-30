const GRID_COLS = 30;
const GRID_ROWS = 20;

export class Game {
  constructor(mapConfig, onGameOver, onScoreChange) {
    this.map = mapConfig;
    this.onGameOver = onGameOver;
    this.onScoreChange = onScoreChange;
    this.reset();
  }

  reset() {
    this.snake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ];
    this.direction = { x: 0, y: -1 }; // moving up
    this.nextDirection = { x: 0, y: -1 };
    this.score = 0;
    this.food = this.spawnFood();
    this.isGameOver = false;
    this.flashTimer = 0;
    this.frame = 0;
  }

  changeDirection(newDir) {
    // Prevent 180 degree turns
    if (this.direction.x !== 0 && newDir.x === -this.direction.x) return;
    if (this.direction.y !== 0 && newDir.y === -this.direction.y) return;
    this.nextDirection = newDir;
  }

  update() {
    if (this.isGameOver) return;
    this.frame++;

    this.direction = this.nextDirection;

    const head = this.snake[0];
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };

    if (this.checkCollision(newHead)) {
      this.isGameOver = true;
      this.onGameOver(this.score);
      return;
    }

    this.snake.unshift(newHead);

    // Check food collision
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 10;
      this.onScoreChange(this.score);
      this.food = this.spawnFood();
      this.flashTimer = 8;
    } else {
      this.snake.pop(); // Remove tail if no food eaten
    }
  }

  checkCollision(pos) {
    // Wall collision
    if (pos.x < 0 || pos.x >= GRID_COLS || pos.y < 0 || pos.y >= GRID_ROWS) {
      return true;
    }
    // Obstacle collision
    for (const obs of this.map.obstacles) {
      if (pos.x === obs.x && pos.y === obs.y) {
        return true;
      }
    }
    // Self collision
    for (const segment of this.snake) {
      if (pos.x === segment.x && pos.y === segment.y) {
        return true;
      }
    }
    return false;
  }

  spawnFood() {
    let newFood;
    let attempts = 0;
    while (attempts < 200) {
      newFood = {
        x: Math.floor(Math.random() * GRID_COLS),
        y: Math.floor(Math.random() * GRID_ROWS)
      };

      let valid = true;
      
      // Not on snake
      for (const segment of this.snake) {
        if (segment.x === newFood.x && segment.y === newFood.y) valid = false;
      }
      
      // Not on obstacle
      for (const obs of this.map.obstacles) {
        if (obs.x === newFood.x && obs.y === newFood.y) valid = false;
      }

      if (valid) return newFood;
      attempts++;
    }
    return newFood; // fallback
  }

  draw(ctx, canvasWidth, canvasHeight) {
    const cellWidth = canvasWidth / GRID_COLS;
    const cellHeight = canvasHeight / GRID_ROWS;

    // Draw background
    ctx.fillStyle = this.map.bg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw checkerboard
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = this.map.cellA;
        } else {
          ctx.fillStyle = this.map.cellB;
        }
        ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);
      }
    }

    // Draw obstacles (walls)
    for (const obs of this.map.obstacles) {
      const x = obs.x * cellWidth;
      const y = obs.y * cellHeight;
      ctx.fillStyle = this.map.wallClr;
      ctx.fillRect(x, y, cellWidth, cellHeight);
      ctx.strokeStyle = this.map.wallBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cellWidth - 1, cellHeight - 1);
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight / 2 - 2);
    }

    // Draw food
    const pulse = 0.82 + 0.18 * Math.sin((this.frame || 0) * 0.12);
    const fr = (cellWidth / 2 - 3) * pulse;
    const fx = this.food.x * cellWidth + cellWidth / 2;
    const fy = this.food.y * cellHeight + cellHeight / 2;
    
    ctx.fillStyle = this.map.foodClr;
    ctx.globalAlpha = this.flashTimer > 0 ? 1 : 0.9;
    ctx.beginPath(); 
    ctx.arc(fx, fy, fr, 0, Math.PI * 2); 
    ctx.fill();
    
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); 
    ctx.arc(fx - fr * 0.3, fy - fr * 0.3, fr * 0.35, 0, Math.PI * 2); 
    ctx.fill();
    ctx.globalAlpha = 1;
    
    if (this.flashTimer > 0) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = this.flashTimer / 8 * 0.5;
      ctx.beginPath(); 
      ctx.arc(fx, fy, fr + 4 + ((8 - this.flashTimer) / 8) * 6, 0, Math.PI * 2); 
      ctx.stroke();
      ctx.globalAlpha = 1;
      this.flashTimer--;
    }

    // Draw snake
    this.snake.forEach((segment, i) => {
      const isHead = i === 0;
      const isTail = i === this.snake.length - 1;
      let clr = isHead ? this.map.snakeH : isTail ? this.map.snakeT : this.map.snakeB;
      
      const pad = isHead ? 1 : isTail ? 3 : 2;
      const r = isHead ? 6 : isTail ? 3 : 4;
      
      ctx.fillStyle = clr;
      ctx.beginPath();
      ctx.roundRect(segment.x * cellWidth + pad, segment.y * cellHeight + pad, cellWidth - pad * 2, cellHeight - pad * 2, r);
      ctx.fill();
      
      if (isHead) {
        // Draw eyes depending on direction
        const dir = this.direction;
        let eyeOff, eye2;
        if (dir.x !== 0) {
          eyeOff = [dir.x > 0 ? 10 : 3, 4];
          eye2 = [dir.x > 0 ? 10 : 3, 10];
        } else {
          eyeOff = [4, dir.y > 0 ? 10 : 3];
          eye2 = [10, dir.y > 0 ? 10 : 3];
        }
        
        // Scale eye positions if needed, but since cellWidth is ~26, let's keep it close to prototype absolute pixels if possible or scale
        const scale = cellWidth / 26;
        const e1x = segment.x * cellWidth + eyeOff[0] * scale;
        const e1y = segment.y * cellHeight + eyeOff[1] * scale;
        const e2x = segment.x * cellWidth + eye2[0] * scale;
        const e2y = segment.y * cellHeight + eye2[1] * scale;
        
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath(); ctx.arc(e1x, e1y, 2.8 * scale, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x, e2y, 2.8 * scale, 0, Math.PI * 2); ctx.fill();
        
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath(); ctx.arc(e1x - 0.8 * scale, e1y - 0.8 * scale, 1 * scale, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x - 0.8 * scale, e2y - 0.8 * scale, 1 * scale, 0, Math.PI * 2); ctx.fill();
      }
      
      if (isTail) {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.roundRect(segment.x * cellWidth + pad, segment.y * cellHeight + pad, cellWidth - pad * 2, cellHeight - pad * 2, r);
        ctx.fill();
      }
    });
  }
}
