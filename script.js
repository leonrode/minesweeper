let gridCells;
let shiftHeld = false;
let numUncovered = 0;
window.onload = () => {
  loadSquare();

  document.addEventListener("keydown", (e) => {
    const key = e.key;
    if (key === "Shift") {
      shiftHeld = true;
    }
  });

  document.addEventListener("keyup", (e) => {
    const key = e.key;
    if (key === "Shift") {
      shiftHeld = false;
    }
  });
};

const adjacentNeighbors = (cell) => {
  const deltas = [
    [-1, 0],
    [1, 0],
    [0, 1],
    [0, -1],
  ];

  let neighbors = [];
  for (const delta of deltas) {
    if (
      cell.x + delta[0] >= 0 &&
      cell.x + delta[0] < gridCells.length &&
      cell.y + delta[1] >= 0 &&
      cell.y + delta[1] < gridCells.length
    ) {
      neighbors.push(gridCells[cell.y + delta[1]][cell.x + delta[0]]);
    }
  }
  return neighbors;
};

const allNeighbors = (cell) => {
  const deltas = [
    [-1, 0],
    [1, 0],
    [0, 1],
    [0, -1],
    [-1, -1],
    [-1, 1],
    [1, 1],
    [1, -1],
  ];

  let neighbors = [];
  for (const delta of deltas) {
    if (
      cell.x + delta[0] >= 0 &&
      cell.x + delta[0] < gridCells.length &&
      cell.y + delta[1] >= 0 &&
      cell.y + delta[1] < gridCells.length
    ) {
      neighbors.push(gridCells[cell.y + delta[1]][cell.x + delta[0]]);
    }
  }
  return neighbors;
};

const numberOfAdjacentBombs = (cell) => {
  const neighbors = allNeighbors(cell);

  let count = 0;
  for (const neighbor of neighbors) {
    if (neighbor.bomb) count++;
  }

  return count;
};

const clearAdjacentNeighbors = (cell) => {
  const potentialNeighbors = adjacentNeighbors(cell);
  let clearNeighbors = [];
  for (const potentialNeighbor of potentialNeighbors) {
    if (potentialNeighbor.bomb === false && potentialNeighbor.covered) {
      clearNeighbors.push(potentialNeighbor);
    }
  }
  return clearNeighbors;
};

const clearNeighbors = (cell) => {
  const potentialNeighbors = allNeighbors(cell);
  let clearNeighbors = [];
  for (const potentialNeighbor of potentialNeighbors) {
    if (potentialNeighbor.bomb === false && potentialNeighbor.covered) {
      clearNeighbors.push(potentialNeighbor);
    }
  }
  return clearNeighbors;
};
const loadSquare = () => {
  const WIDTH = 15;
  const HEIGHT = 15;
  const NUM_BOMBS = 27;

  let numFlagsLeft = NUM_BOMBS;
  let canUncover = true;
  let bombs = [];

  // generate 15x15 board of cells

  gridCells = new Array(HEIGHT);

  for (let i = 0; i < WIDTH; i++) gridCells[i] = new Array(WIDTH);

  const container = document.createElement("div");
  container.id = "square-container";

  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      const cell = document.createElement("div");
      const cellCover = document.createElement("div");
      const cellBombCount = document.createElement("div");
      cellCover.classList.add("cell-cover");
      cellBombCount.classList.add("bomb-count");
      cell.classList.add("cell");
      cell.bomb = false;
      cell.covered = true;
      cell.x = col;
      cell.y = row;
      cell.appendChild(cellBombCount);
      cell.appendChild(cellCover);

      cell.addEventListener("click", () => {
        if (canUncover) {
          if (shiftHeld && cell.covered) {
            if (cell.querySelector(".cell-cover").innerHTML !== "") {
              cell.querySelector(".cell-cover").innerHTML = "";
              numFlagsLeft++;
              setFlagStat(numFlagsLeft, NUM_BOMBS);
            } else {
              cell.querySelector(".cell-cover").innerHTML =
                '<i class="fas fa-flag"></i>';
              numFlagsLeft--;
              setFlagStat(numFlagsLeft, NUM_BOMBS);
            }
            return;
          }
          if (cell.covered) {
            if (cell.bomb) {
              uncoverBomb(cell);
              revealBombs(bombs);
              canUncover = false;
              showLost();
            } else {
              uncoverCell(cell);
            }
            if (checkWin(WIDTH * HEIGHT, NUM_BOMBS)) {
              showWon();
              canUncover = false;
            }
          }
        }
      });

      gridCells[row][col] = cell;

      container.appendChild(cell);
    }
  }

  // randomly choose coords for bombs

  for (let bomb = 0; bomb < NUM_BOMBS; bomb++) {
    let x = Math.floor(Math.random() * WIDTH);
    let y = Math.floor(Math.random() * HEIGHT);

    while (bombs.includes([x, y])) {
      x = Math.floor(Math.random() * WIDTH);
      y = Math.floor(Math.random() * HEIGHT);
    }

    gridCells[y][x].bomb = true;
    gridCells[y][x].querySelector(".bomb-count").innerHTML =
      "<i class='fas fa-bomb'></i>";

    bombs.push([x, y]);
  }
  // create the numbers in the rest of the boxes

  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      if (gridCells[row][col].bomb === false) {
        const adjacentBombCount = numberOfAdjacentBombs(gridCells[row][col]);
        if (adjacentBombCount !== 0) {
          gridCells[row][col].querySelector(".bomb-count").textContent =
            adjacentBombCount;
        }
      }
    }
  }
  document.body.appendChild(container);

  loadControls();
  setFlagStat(NUM_BOMBS, NUM_BOMBS);
};

const loadControls = () => {
  const container = document.createElement("div");
  container.id = "controls-stats";

  const controls = document.createElement("div");
  controls.id = "controls";

  const stats = document.createElement("div");
  stats.id = "stats";

  const flagShift = document.createElement("div");
  flagShift.id = "flag-shift";
  const shift = document.createElement("h3");
  shift.id = "shift";
  shift.textContent = "SHIFT";

  const flag = document.createElement("span");
  flag.innerHTML = '<i class="fas fa-flag"></i>';
  [shift, flag].forEach((ele) => flagShift.appendChild(ele));
  const click = document.createElement("h3");
  click.id = "click";
  click.textContent = "LMB";

  const eye = document.createElement("span");
  eye.innerHTML = `<i class="fas fa-eye"></i>`;

  const clickEye = document.createElement("div");
  clickEye.id = "click-eye";

  [click, eye].forEach((ele) => clickEye.appendChild(ele));
  [flagShift, clickEye].forEach((ele) => controls.appendChild(ele));

  const text = document.createElement("h3");
  text.id = "stat";
  text.textContent = "0 / 0";

  stats.appendChild(text);

  const statFlag = document.createElement("span");
  statFlag.innerHTML = '<i class="fas fa-flag"></i>';
  stats.appendChild(statFlag);
  [controls, stats].forEach((ele) => container.appendChild(ele));

  document.body.appendChild(container);
};

const uncoverBomb = (cell) => {
  const cover = cell.querySelector(".cell-cover");
  cover.style.display = "none";
  cell.covered = false;
};

const uncoverCell = (cell) => {
  // recursively clear the adjacent cells

  // get cell's cover

  const cover = cell.querySelector(".cell-cover");
  if (cover.style.display !== "none") numUncovered++;
  cover.style.display = "none";
  cell.covered = false;

  if (numberOfAdjacentBombs(cell) !== 0) {
    return;
  }

  // const neighbors = clearAdjacentNeighbors(cell);
  const neighbors = clearNeighbors(cell);
  if (neighbors.length === 0) {
    return;
  }

  for (const neighbor of neighbors) {
    uncoverCell(neighbor);
  }
};

const revealBombs = (bombs) => {
  let bombNum = 0;

  const interval = setInterval(() => {
    const bomb = gridCells[bombs[bombNum][1]][bombs[bombNum][0]];
    bomb.querySelector(".cell-cover").style.display = "none";
    bombNum++;

    if (bombNum === bombs.length) clearInterval(interval);
  }, 200);
};

const setFlagStat = (currentFlagged, numBombs) => {
  const stat = document.querySelector("#stat");

  stat.textContent = `${currentFlagged} / ${numBombs}`;
};

const checkWin = (numSquares, numBombs) => {
  return numSquares - numBombs === numUncovered;
};

const showWon = () => {
  const h4 = document.createElement("h4");
  h4.textContent = "You won! (refresh)";
  h4.id = "won";

  document.body.appendChild(h4);
};

const showLost = () => {
  const h4 = document.createElement("h4");
  h4.textContent = "You lost! (refresh)";
  h4.id = "lost";

  document.body.appendChild(h4);
};
