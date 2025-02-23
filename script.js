// Basic game state
let gridSize = 30;
let board = [];
let mines = [];
let flags = [];
let gameWon = false;
let gameOver = false;
let numberOfMines = 100; // You can adjust this value

// Function to initialize the game board
function initializeBoard(numberOfMines) {
    // Create the board array
    board = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    mines = [];
    flags = [];
    gameWon = false;
    gameOver = false;

    // Place mines randomly
    while (mines.length < numberOfMines) {
        const x = Math.floor(Math.random() * gridSize);
        const y = Math.floor(Math.random() * gridSize);
        if (!mines.some(mine => mine.x === x && mine.y === y)) {
            mines.push({ x, y });
            board[x][y] = 'mine'; // Use 'mine' string instead of boolean
        }
    }

    // Calculate numbers for adjacent mines
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if (board[x][y] !== 'mine') {
                let adjacentMines = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const nx = x + i;
                        const ny = y + j;
                        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && board[nx][ny] === 'mine') {
                            adjacentMines++;
                        }
                    }
                }
                board[x][y] = adjacentMines;
            }
        }
    }
    return board;
}

// Function to create the HTML board dynamically
function createBoard() {
    const boardElement = document.getElementById('minesweeper-board');
    boardElement.innerHTML = ''; // Clear any existing board
    boardElement.style.gridTemplateColumns = `repeat(${gridSize}, 24px)`; // Update grid columns

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.id = `cell-${x}-${y}`;
            cellElement.dataset.x = x;
            cellElement.dataset.y = y;

            // Add click event listener
            cellElement.addEventListener('click', () => handleCellClick(x, y));

            // Add right-click event listener (context menu)
            cellElement.addEventListener('contextmenu', (event) => {
                handleRightClick(x, y, event);
            });

            boardElement.appendChild(cellElement);
        }
    }
}

function handleCellClick(x, y) {
    if (gameOver || gameWon) return;

    const cellElement = document.getElementById(`cell-${x}-${y}`);

    if (cellElement.classList.contains('flagged')) return; // Prevent clicking flagged cells

    if (cellElement.classList.contains('revealed')) {
        // If the cell is already revealed, try revealing neighbors if flag count matches
        revealNeighborsIfFlagCountMatches(x, y);
        return;
    }

    if (board[x][y] === 'mine') {
        revealAllMines();
        gameOver = true;
        alert("Game Over!");
        return;
    }

    revealCell(x, y);
    checkWinCondition();
}

function revealCell(x, y) {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
    const cellElement = document.getElementById(`cell-${x}-${y}`);
    if (cellElement.classList.contains('revealed')) return;
    if (cellElement.classList.contains('flagged')) return;

    cellElement.classList.add('revealed');

    const value = board[x][y];
    cellElement.textContent = value > 0 ? value : '';

    if (value === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                revealCell(x + i, y + j); // Recursive call for flood fill
            }
        }
    } else {
      cellElement.classList.add(getNumberClass(value));
    }
}

function getNumberClass(number) {
    switch (number) {
        case 1: return 'one';
        case 2: return 'two';
        case 3: return 'three';
        case 4: return 'four';
        case 5: return 'five';
        case 6: return 'six';
        case 7: return 'seven';
        case 8: return 'eight';
        default: return '';
    }
}

function handleRightClick(x, y, event) {
    event.preventDefault(); // Prevent default context menu
    if (gameOver || gameWon) return;

    const cellElement = document.getElementById(`cell-${x}-${y}`);

    if (!cellElement.classList.contains('revealed')) {
        cellElement.classList.toggle('flagged');
    }
}

function revealAllMines() {
    for (const mine of mines) {
        const cellElement = document.getElementById(`cell-${mine.x}-${mine.y}`);
        cellElement.classList.add('mine');
    }
}

function checkWinCondition() {
    let revealedCount = 0;
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if (document.getElementById(`cell-${x}-${y}`).classList.contains('revealed')) {
                revealedCount++;
            }
        }
    }

    if (revealedCount === (gridSize * gridSize) - numberOfMines) {
        gameWon = true;
        alert("You Win!");
    }
}

// Reset Game function
function resetGame() {
  board = [];
  mines = [];
  flags = [];
  gameWon = false;
  gameOver = false;
  initializeBoard(numberOfMines);
  createBoard();
}

function setDifficulty(newGridSize, newNumberOfMines) {
    gridSize = newGridSize;
    numberOfMines = newNumberOfMines;
    createBoard();
    initializeBoard(numberOfMines);
}

function revealNeighborsIfFlagCountMatches(x, y) {
    let flagCount = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const nx = x + i;
            const ny = y + j;
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                const neighborCell = document.getElementById(`cell-${nx}-${ny}`);
                if (neighborCell.classList.contains('flagged')) {
                    flagCount++;
                }
            }
        }
    }

    const cellValue = board[x][y];

    if (flagCount === cellValue) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const nx = x + i;
                const ny = y + j;
                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                    if (!document.getElementById(`cell-${nx}-${ny}`).classList.contains('flagged'))
                    {
                        revealCell(nx, ny); // Call revealCell directly
                    }
                }
            }
        }
        checkWinCondition(); // Check win condition after revealing neighbors
    }
}

// Initialize the game when the page loads
window.onload = () => {
    // Difficulty button functionality
    const easyButton = document.getElementById('easy-button');
    easyButton.addEventListener('click', () => setDifficulty(10, 10));

    const mediumButton = document.getElementById('medium-button');
    mediumButton.addEventListener('click', () => setDifficulty(15, 30));

    const hardButton = document.getElementById('hard-button');
    hardButton.addEventListener('click', () => setDifficulty(30, 100));

    // Reset button functionality
    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', resetGame);

    setDifficulty(30, 100)
    initializeBoard(numberOfMines);
    createBoard();
};