// Mock bottle data - will be replaced with bottles.json
// import bottles from "../bottles.json";

// const BOTTLES = bottles.map(bottle => ({
//   name: bottle.name,
//   image: bottle.image
// }));

const BOTTLES = [
  { name: "Italicus", image: "images/italicus.webp" },
  { name: "Empirical Ayuuk", image: "images/empirical-ayuuk.webp" },
  { name: "Sfumato", image: "images/sfumato.webp" },
  { name: "Empirical Symphony 6", image: "images/empirical-symphony6.webp" },
  { name: "Nux Alpina", image: "images/nux-alpina.webp" },
  { name: "El Buho", image: "images/el-buho.webp" },
  { name: "Real McCoy", image: "images/real-mccoy.webp" },
  { name: "Giffard Passion Fruit", image: "images/giffard-passion.webp" },
  { name: "Banana Liqueur", image: "images/banana-liqueur.webp" },
  { name: "Alpe Genepy", image: "images/alpe-genepy.webp" },
  { name: "Jin Jiji", image: "images/jin-jiji.webp" },
  { name: "Jaja", image: "images/jaja.webp" },
  { name: "Yola", image: "images/yola.webp" },
  { name: "The Scarlet Ibis", image: "images/scarlet-ibis.webp" },
  { name: "Tapatio 110", image: "images/tapatio-110.webp" },
  { name: "Barrel Seagrass", image: "images/barrel-seagrass.webp" },
  { name: "Giffard Grenadine", image: "images/giffard-grenadine.webp" },
  { name: "Sirene Bitter", image: "images/sirene-bitter.webp" },
  { name: "Nixta", image: "images/nixta.webp" },
  { name: "Ancho Reyes Verde", image: "images/ancho-reyes-verde.webp" },
  { name: "Malort", image: "images/malort.webp" },
  { name: "St George Terroir", image: "images/st-george-terroir.webp" },
  { name: "Braulio", image: "images/braulio.webp" },
  { name: "Becherovka", image: "images/becherovka.webp" },
  { name: "Mekhong", image: "images/mekhong.webp" },
  { name: "Tempus Fugit Violettes", image: "images/tempus-fugit-violettes.webp" },
  { name: "Pairideza Creme de Banane", image: "images/pairideza-creme-de-banane.webp" },
  { name: "Horse with No Name", image: "images/horse-no-name.webp" },
];

const MAX_DAILY_BOARDS = 3;

// State management
let gameState = {
  board: [],
  crossed: [],
  gameStarted: false,
  boardsUsedToday: 0,
  lastResetDate: null,
};

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
    gameState = JSON.parse(saved);
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

// Generate random board
function generateBoard() {
  checkDailyReset();

  if (gameState.boardsUsedToday >= MAX_DAILY_BOARDS) {
    alert(
      `You've used all ${MAX_DAILY_BOARDS} new boards for today. Get a bingo to reset!`
    );
    return;
  }

  const shuffled = [...BOTTLES].sort(() => Math.random() - 0.5);
  gameState.board = shuffled.slice(0, 25);
  gameState.crossed = new Array(25).fill(false);
  gameState.gameStarted = false;
  gameState.boardsUsedToday++;
  saveState();
  updateButtonStates();
  renderBoard();
}

// Shuffle current board
function shuffleBoard() {
  gameState.board = [...gameState.board].sort(() => Math.random() - 0.5);
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
    gameState.crossed = new Array(25).fill(false);

    // Generate new board
    const shuffled = [...BOTTLES].sort(() => Math.random() - 0.5);
    gameState.board = shuffled.slice(0, 25);

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
    console.log(bottle.image);
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
  gameState.crossed = new Array(25).fill(false);
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