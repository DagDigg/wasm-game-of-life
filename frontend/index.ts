import { Universe } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg.wasm";

const CELL_SIZE = 16;
const BORDER_SIZE = 2;
const GRID_COLOR = "#A0A4B8";
const DEAD_COLOR = "#D8DDEF";
const ALIVE_COLOR = "#7293A0";

const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const createRandomUniverse = () => {
  const height = randomIntFromInterval(16, 64);
  const width = randomIntFromInterval(16, 64);
  return Universe.new(width, height);
};

const universe = createRandomUniverse();

const canvas = document.getElementById(
  "game-of-life-canvas"
) as HTMLCanvasElement;

const setCanvasSize = () => {
  canvas.height = (CELL_SIZE + BORDER_SIZE) * universe.height() + BORDER_SIZE;
  canvas.width = (CELL_SIZE + BORDER_SIZE) * universe.width() + BORDER_SIZE;
};

const ctx = canvas.getContext("2d");

const tick = () => {
  universe.tick(); // Calculate next state
  drawGrid();
  drawCells();
  if (universe.is_stale()) {
    if (confirm("Stale! Retry?")) {
      const nextWidth = randomIntFromInterval(16, 64);
      const nextHeight = randomIntFromInterval(16, 64);
      universe.reset(nextWidth, nextHeight);
      setCanvasSize();
      requestAnimationFrame(tick);
    }
  } else {
    window.setTimeout(() => requestAnimationFrame(tick), 0);
  }
};

const drawGrid = () => {
  if (!ctx) return;
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= universe.width(); i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(
      i * (CELL_SIZE + 1) + 1,
      (CELL_SIZE + 1) * universe.height() + 1
    );
  }

  // Horizontal lines.
  for (let j = 0; j <= universe.height(); j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * universe.width() + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

const getIndex = (row: number, col: number) => {
  return col + row * universe.width();
};

const bitIsSet = (n: number, arr: Uint8Array) => {
  const byte = Math.floor(n / 8);
  const mask = 1 << n % 8;
  return (arr[byte] & mask) === mask;
};

const drawCells = () => {
  if (!ctx) return;
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(
    memory.buffer,
    cellsPtr,
    (universe.width() * universe.height()) / 8
  );

  ctx.beginPath();

  for (let row = 0; row < universe.height(); row++) {
    for (let col = 0; col < universe.width(); col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = bitIsSet(idx, cells) ? ALIVE_COLOR : DEAD_COLOR;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

setCanvasSize();
drawGrid();
drawCells();
requestAnimationFrame(tick);
