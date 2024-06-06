const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;


const getPlayerRandomColor = () => {
  let r = Math.floor(Math.random() * 256),
      g = Math.floor(Math.random() * 256),
      b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
};

let initialColor = getPlayerRandomColor();
context.fillStyle = initialColor;

let allPlayers = [], player, food;

socket.on('connect', function () {

  let playerId = socket.io.engine.id;
  player = new Player({
    x: Math.floor(Math.random() * CANVAS_WIDTH - 30),
    y: Math.floor(Math.random() * CANVAS_HEIGHT - 30),
    score: 0,
    id: playerId,
  });

  socket.emit("start", player);

  socket.on("player_updates", (players) => {
    allPlayers = players;
    drawPlayers(allPlayers);
  });

  socket.on("food", (newFood) => {
    food = newFood;
    drawFood(food.x, food.y, food.value);
  });

  window.addEventListener("keydown", (e) => {
    let cur_key = e.key.toLowerCase();
    let direction = cur_key === "d" ? "right" :
      cur_key === "a" ? "left" :
        cur_key === "w" ? "up" :
          cur_key === "s" ? "down" : null;

    if (direction) {
      context.clearRect(...getCoord(player));
      player.movePlayer(direction, 10);
      checkBoundary(player);
      context.fillRect(...getCoord(player));
      allPlayers = allPlayers.map(p => {
        if (p.id === player.id) {
          return player;
        } else {
          return p;
        }
      });
      socket.emit("player_updates", allPlayers);
    }

    if (player.collision(food)) {
      context.clearRect(...getFoodCoord(food));
      food = { value: 0 };
      context.fillRect(...getCoord(player));
      socket.emit("collision", player);
      let rank = player.calculateRank(allPlayers);
      document.getElementById("rank").innerText = rank;
    }
  })

});

const getCoord = (player) => {
  return [player.x, player.y, 20, 20];
};

const checkBoundary = (player) => {
  if (player.x < 5) {
    player.x = 5;
  }
  if (player.x > CANVAS_WIDTH - 25) {
    player.x = CANVAS_WIDTH - 25;
  }
  if (player.y < 5) {
    player.y = 5;
  }
  if (player.y > CANVAS_HEIGHT - 25) {
    player.y = CANVAS_HEIGHT - 25;
  }
};

const drawFood = (x, y, value) => {
  const foodColours = ["#f542cb", "#f55742", "#f5f242", "#428df5", "#42f56c"];
  context.beginPath();
  context.arc(x, y, value * 2 + 10, 0, 2 * Math.PI, false);
  context.fillStyle = foodColours[value - 1];
  context.fill();
};

const getFoodCoord = (food) => {
  const radFactor = food.value * 2 + 10;
  return [
    food.x - radFactor,
    food.y - radFactor,
    food.x + radFactor,
    food.y + radFactor
  ];
};

const drawPlayers = (players) => {
  for (let p of players) {
    context.fillRect(...getCoord(p));
  }
};