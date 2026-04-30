const GRID_SIZE = 20;

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
  }

  changeDirection(newDir) {
    // Prevent 180 degree turns
    if (this.direction.x !== 0 && newDir.x === -this.direction.x) return;
    if (this.direction.y !== 0 && newDir.y === -this.direction.y) return;
    this.nextDirection = newDir;
  }

  update() {
    if (this.isGameOver) return;

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
    } else {
      this.snake.pop(); // Remove tail if no food eaten
    }
  }

  checkCollision(pos) {
    // Wall collision
    if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) {
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
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
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
    }
  }

  draw(ctx, canvasWidth, canvasHeight) {
    // Clear canvas
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const cellWidth = canvasWidth / GRID_SIZE;
    const cellHeight = canvasHeight / GRID_SIZE;

    // Draw Map Theme color lightly in background (optional, or just use as snake color)
    
    // Draw obstacles
    ctx.fillStyle = '#c0392b'; // Red obstacles
    for (const obs of this.map.obstacles) {
      ctx.fillRect(obs.x * cellWidth, obs.y * cellHeight, cellWidth, cellHeight);
    }

    // Draw food
    ctx.fillStyle = '#e67e22'; // Orange food
    ctx.beginPath();
    ctx.arc(
      this.food.x * cellWidth + cellWidth / 2, 
      this.food.y * cellHeight + cellHeight / 2, 
      cellWidth / 2.5, 
      0, Math.PI * 2
    );
    ctx.fill();

    // Draw snake
    this.snake.forEach((segment, index) => {
      // Head is a bit different color
      ctx.fillStyle = index === 0 ? '#27ae60' : this.map.themeColor;
      ctx.fillRect(segment.x * cellWidth, segment.y * cellHeight, cellWidth, cellHeight);
      ctx.strokeStyle = '#2c3e50';
      ctx.strokeRect(segment.x * cellWidth, segment.y * cellHeight, cellWidth, cellHeight);
    });
  }
}
