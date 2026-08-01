// Mock bottle data - will be replaced with bottles.json
// import bottles from "../bottles.json";

// const BOTTLES = bottles.map(bottle => ({
//   name: bottle.name,
//   image: bottle.image
// }));

// weight = commonness, 1 (rare/esoteric) to 5 (ubiquitous). Drives the
// difficulty-weighted board selection in buildBoard().
const BOTTLES = [
  { name: "Italicus", image: "images/italicus.webp", weight: 3 },
  { name: "Empirical Ayuuk", image: "images/empirical-ayuuk.webp", weight: 1 },
  { name: "Sfumato", image: "images/sfumato.webp", weight: 1 },
  { name: "Empirical Symphony 6", image: "images/empirical-symphony6.webp", weight: 1 },
  { name: "Nux Alpina", image: "images/nux-alpina.webp", weight: 1 },
  { name: "El Buho", image: "images/el-buho.webp", weight: 2 },
  { name: "Real McCoy", image: "images/real-mccoy.webp", weight: 3 },
  { name: "Giffard Passion Fruit", image: "images/giffard-passion.webp", weight: 3 },
  { name: "Banana Liqueur", image: "images/banana-liqueur.webp", weight: 3 },
  { name: "Alpe Genepy", image: "images/alpe-genepy.webp", weight: 2 },
  { name: "Jin Jiji", image: "images/jin-jiji.webp", weight: 2 },
  { name: "Jaja", image: "images/jaja.webp", weight: 2 },
  { name: "Yola", image: "images/yola.webp", weight: 2 },
  { name: "The Scarlet Ibis", image: "images/scarlet-ibis.webp", weight: 2 },
  { name: "Tapatio 110", image: "images/tapatio-110.webp", weight: 3 },
  { name: "Barrel Seagrass", image: "images/barrel-seagrass.webp", weight: 2 },
  { name: "Giffard Grenadine", image: "images/giffard-grenadine.webp", weight: 2 },
  { name: "Sirene Bitter", image: "images/sirene-bitter.webp", weight: 2 },
  { name: "Nixta", image: "images/nixta.webp", weight: 2 },
  { name: "Ancho Reyes Verde", image: "images/ancho-reyes-verde.webp", weight: 3 },
  { name: "Malort", image: "images/malort.webp", weight: 2 },
  { name: "St George Terroir", image: "images/st-george-terroir.webp", weight: 3 },
  { name: "Braulio", image: "images/braulio.webp", weight: 2 },
  { name: "Becherovka", image: "images/becherovka.webp", weight: 2 },
  { name: "Mekhong", image: "images/mekhong.webp", weight: 2 },
  { name: "Tempus Fugit Violettes", image: "images/tempus-fugit-violettes.webp", weight: 1 },
  { name: "Pairideza Creme de Banane", image: "images/pairideza-creme-de-banane.webp", weight: 1 },
  { name: "Horse with No Name", image: "images/horse-no-name.webp", weight: 1 },
];

const MAX_DAILY_BOARDS = 3;
const BOARD_SIZE = 25;

// Difficulty modes, easiest -> hardest. `score(weight)` turns a bottle's
// commonness into a selection weight; `eligible(weight)` optionally restricts
// the pool. Higher score = more likely to be drawn.
const DIFFICULTIES = {
  "new-york": {
    label: "New York",
    eligible: (w) => w >= 4, // only the "every NYC bar has it" bottles
    score: (w) => w,
  },
  "one-night": {
    label: "One Night",
    score: (w) => w ** 2, // strongly favor common
  },
  "one-weekend": {
    label: "One Weekend",
    score: () => 1, // uniform: a true mix of the full pool
  },
  "one-week": {
    label: "One Week",
    score: (w) => (6 - w) ** 2, // strongly favor rare/esoteric
  },
};
const DEFAULT_DIFFICULTY = "one-night";

// State management
const DEFAULT_STATE = {
  board: [],
  crossed: [],
  gameStarted: false,
  boardsUsedToday: 0,
  lastResetDate: null,
  difficulty: DEFAULT_DIFFICULTY,
};

let gameState = { ...DEFAULT_STATE };

// DOM elements
const gameScreen = document.getElementById("gameScreen");
const startGameBtn = document.getElementById("startGameBtn");
const endGameBtn = document.getElementById("endGameBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const newBoardBtn = document.getElementById("newBoardBtn");
const bingoGrid = document.getElementById("bingoGrid");
const bingoStatus = document.getElementById("bingoStatus");
const boardLimitInfo = document.getElementById("boardLimitInfo");
const overlay = document.getElementById("overlay");
const overlayClose = document.getElementById("overlayClose");
const overlayImage = document.getElementById("overlayImage");
const overlayTitle = document.getElementById("overlayTitle");
const overlayToggleBtn = document.getElementById("overlayToggleBtn");
const bingoModal = document.getElementById("bingoModal");
const newGameBtn = document.getElementById("newGameBtn");

let currentOverlayIndex = null;

// Check if we need to reset daily limit
function checkDailyReset() {
  const today = new Date().toDateString();
  if (gameState.lastResetDate !== today) {
    gameState.boardsUsedToday = 0;
    gameState.lastResetDate = today;
    saveState();
  }
}

// Update board limit display
function updateBoardLimitDisplay() {
  boardLimitInfo.textContent = `New boards today: ${gameState.boardsUsedToday}/${MAX_DAILY_BOARDS}`;
  newBoardBtn.disabled =
    gameState.gameStarted ||
    gameState.boardsUsedToday >= MAX_DAILY_BOARDS;
}

// Update button states
function updateButtonStates() {
  if (gameState.gameStarted) {
    shuffleBtn.classList.add("hidden");
    newBoardBtn.classList.add("hidden");
    startGameBtn.classList.add("hidden");
    endGameBtn.classList.remove("hidden");
  } else {
    shuffleBtn.classList.remove("hidden");
    newBoardBtn.classList.remove("hidden");
    startGameBtn.classList.remove("hidden");
    endGameBtn.classList.add("hidden");
  }
  updateBoardLimitDisplay();
}

// Load state from localStorage
function loadState() {
  const saved = localStorage.getItem("bottleBingoState");
  if (saved) {
    // Merge over defaults so fields added in newer versions (e.g. difficulty)
    // always resolve for returning players instead of being undefined.
    gameState = { ...DEFAULT_STATE, ...JSON.parse(saved) };
    checkDailyReset();
  } else {
    // First time - generate initial board
    generateBoard();
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem("bottleBingoState", JSON.stringify(gameState));
}

// Fisher-Yates shuffle (returns a new array; does not mutate input)
function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Weighted sampling WITHOUT replacement: draw `count` unique items from `pool`,
// each item's chance proportional to scoreFn(item). Returns the drawn items.
function weightedSample(pool, count, scoreFn) {
  const remaining = pool.map((item) => ({ item, score: Math.max(0, scoreFn(item)) }));
  const picked = [];

  while (picked.length < count && remaining.length > 0) {
    const total = remaining.reduce((sum, e) => sum + e.score, 0);
    let idx;
    if (total <= 0) {
      // All remaining scores are zero — fall back to uniform.
      idx = Math.floor(Math.random() * remaining.length);
    } else {
      let r = Math.random() * total;
      idx = remaining.findIndex((e) => (r -= e.score) < 0);
      if (idx < 0) idx = remaining.length - 1;
    }
    picked.push(remaining[idx].item);
    remaining.splice(idx, 1);
  }

  return picked;
}

// Build a board for the current difficulty. Applies the difficulty's eligibility
// filter, relaxing it if too few bottles qualify so a full board is always fillable.
function buildBoard() {
  const difficulty = DIFFICULTIES[gameState.difficulty] || DIFFICULTIES[DEFAULT_DIFFICULTY];

  let pool = BOTTLES;
  if (difficulty.eligible) {
    const eligible = BOTTLES.filter((b) => difficulty.eligible(b.weight));
    // Safeguard: never let the eligible pool drop below a full board.
    pool = eligible.length >= BOARD_SIZE ? eligible : BOTTLES;
  }

  return weightedSample(pool, BOARD_SIZE, (b) => difficulty.score(b.weight));
}

// Generate random board
function generateBoard() {
  checkDailyReset();

  if (gameState.boardsUsedToday >= MAX_DAILY_BOARDS) {
    alert(
      `You've used all ${MAX_DAILY_BOARDS} new boards for today. Get a bingo to reset!`
    );
    return;
  }

  gameState.board = buildBoard();
  gameState.crossed = new Array(BOARD_SIZE).fill(false);
  gameState.gameStarted = false;
  gameState.boardsUsedToday++;
  saveState();
  updateButtonStates();
  renderBoard();
}

// Shuffle current board (reorders the existing bottles, no reselection)
function shuffleBoard() {
  gameState.board = shuffle(gameState.board);
  saveState();
  renderBoard();
}

// Start game
function startGame() {
  gameState.gameStarted = true;
  saveState();
  updateButtonStates();
}

// End game
function endGame() {
  if (
    confirm(
      "Are you sure you want to end the current game? A new board will be generated."
    )
  ) {
    gameState.gameStarted = false;
    gameState.crossed = new Array(BOARD_SIZE).fill(false);

    // Generate new board
    gameState.board = buildBoard();

    saveState();
    updateButtonStates();
    renderBoard();
  }
}

// Render board
function renderBoard() {
  bingoGrid.innerHTML = "";
  gameState.board.forEach((bottle, index) => {
    const cell = document.createElement("div");
    cell.className = "bingo-cell";
    if (gameState.crossed[index]) {
      cell.classList.add("crossed");
    }

    // For demo, use placeholder image
    // const img = document.createElement("div");
    // img.className = "bottle-image";
    // img.style.background = `linear-gradient(135deg, 
    //           hsl(${index * 15}, 70%, 60%) 0%, 
    //           hsl(${index * 15 + 30}, 70%, 50%) 100%)`;
    // img.style.borderRadius = "4px";

    const img = document.createElement("img");
    img.src = `src/${bottle.image}`;
    img.alt = bottle.name;
    img.className = "bottle-image";
    // img.style.borderRadius = "4px";

    const name = document.createElement("div");
    name.className = "bottle-name";
    name.textContent = bottle.name;

    cell.appendChild(img);
    cell.appendChild(name);

    cell.addEventListener("click", () => openOverlay(index));

    bingoGrid.appendChild(cell);
  });

  checkBingo();
}

// Open overlay
function openOverlay(index) {
  if (!gameState.gameStarted) return;

  currentOverlayIndex = index;
  const bottle = gameState.board[index];
  overlayTitle.textContent = bottle.name;

  overlayImage.src = `src/${bottle.image}`;
  overlayImage.alt = bottle.name;

  const isCrossed = gameState.crossed[index];
  overlayToggleBtn.textContent = isCrossed ? "Unmark" : "Mark Found";
  overlayToggleBtn.className = isCrossed
    ? "btn btn-primary"
    : "btn btn-secondary";

  overlay.classList.add("active");
}

// Close overlay
function closeOverlay() {
  overlay.classList.remove("active");
  currentOverlayIndex = null;
}

// Toggle crossed state
function toggleCrossed() {
  if (currentOverlayIndex !== null) {
    gameState.crossed[currentOverlayIndex] =
      !gameState.crossed[currentOverlayIndex];
    saveState();
    renderBoard();
    closeOverlay();
  }
}

// Check for bingo
function checkBingo() {
  if (!gameState.gameStarted) {
    bingoStatus.classList.add("hidden");
    return;
  }

  const grid = gameState.crossed;
  let hasBingo = false;

  // Check rows
  for (let i = 0; i < 5; i++) {
    if (grid.slice(i * 5, i * 5 + 5).every((val) => val)) {
      hasBingo = true;
    }
  }

  // Check columns
  for (let i = 0; i < 5; i++) {
    if ([0, 1, 2, 3, 4].every((row) => grid[row * 5 + i])) {
      hasBingo = true;
    }
  }

  // Check diagonals
  if ([0, 6, 12, 18, 24].every((i) => grid[i])) {
    hasBingo = true;
  }
  if ([4, 8, 12, 16, 20].every((i) => grid[i])) {
    hasBingo = true;
  }

  if (hasBingo) {
    bingoStatus.classList.remove("hidden");
    showBingoModal();
  } else {
    bingoStatus.classList.add("hidden");
  }
}

// Show bingo modal
function showBingoModal() {
  bingoModal.classList.add("active");
}

// Close bingo modal
function closeBingoModal() {
  bingoModal.classList.remove("active");
}

// Start new game after bingo
function startNewGame() {
  // Reset daily limit since they got bingo
  gameState.boardsUsedToday = 0;
  gameState.gameStarted = false;
  gameState.crossed = new Array(BOARD_SIZE).fill(false);
  saveState();
  closeBingoModal();
  updateButtonStates();
  renderBoard();
}

// Event listeners
startGameBtn.addEventListener("click", startGame);
endGameBtn.addEventListener("click", endGame);
shuffleBtn.addEventListener("click", shuffleBoard);
newBoardBtn.addEventListener("click", generateBoard);
overlayClose.addEventListener("click", closeOverlay);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});
overlayToggleBtn.addEventListener("click", toggleCrossed);
newGameBtn.addEventListener("click", startNewGame);
bingoModal.addEventListener("click", (e) => {
  if (e.target === bingoModal) closeBingoModal();
});

// Initialize
loadState();
updateButtonStates();
renderBoard();