class Player {
  constructor({ x, y, score, id }) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
  }

  movePlayer(dir, speed) {
    switch (dir) {
      case "left":
        this.x -= speed;
        break;
      case "right":
        this.x += speed;
        break;
      case "up":
        this.y -= speed;
        break;
      case "down":
        this.y += speed;
        break;
    }
  }

  collision(item) {
    let baitRadius = item.value * 2 + 10;
    return (
      Math.abs(this.x - item.x) < baitRadius + 15
      &&
      Math.abs(this.y - item.y) < baitRadius + 15
    );
  }

  calculateRank(arr) {
    let currentRank = 1;
    for (let p of arr) {
      if (p.score > this.score) {
        currentRank += 1;
      }
    }
    return `Rank: ${currentRank}/${arr.length}`;
  }
}

try {
  module.exports = Player;
} catch(e) {}

export default Player;
