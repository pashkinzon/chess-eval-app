// Symbols for chess pieces
const figures = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

// Cached DOM elements
const chessboard = document.getElementById('chessboard');
const ratingDisplay = document.getElementById('rating');
const feedbackDisplay = document.getElementById('feedback');
const evalBar = document.getElementById('eval-bar');
const evalBarContainer = evalBar.parentElement;
const evalValueDisplay = document.getElementById('eval-value');
const hamburgerIcon = document.querySelector('.hamburger-icon');
const sidebar = document.querySelector('.sidebar');
const body = document.querySelector('body');

let rating = 1409;
let ratingChange = 0;
let ratingProgress = 0;
let streak = 0;
let currentFenIndex = null;
let isDragging = false;

// Toggle Sidebar Visibility
hamburgerIcon.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    body.classList.toggle('sidebar-open');
});

// Function to create chessboard
function createChessboard() {
    chessboard.innerHTML = ''; // Clear chessboard
    
    for (let i = 0; i < 64; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell', (Math.floor(i / 8) + i % 8) % 2 === 0 ? 'white' : 'black');
        chessboard.appendChild(cell);
    }
}

// Function to place pieces on the board based on FEN string
function placePieces(fen) {
    const rows = fen.split(' ')[0].split('/');
    let rowIndex = 0;

    rows.forEach(row => {
        let colIndex = 0;
        for (const char of row) {
            if (!isNaN(char)) {
                colIndex += parseInt(char);
            } else {
                const cellIndex = rowIndex * 8 + colIndex;
                if (cellIndex < chessboard.children.length) {
                    const cell = chessboard.children[cellIndex];
                    if (cell) {
                        cell.innerHTML = figures[char] || '';
                    }
                }
                colIndex++;
            }
        }
        rowIndex++;
    });
}

// Function to fetch a random FEN position
async function getRandomFen() {
    try {
        const response = await fetch('get_fen.php');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.fen) {
            createChessboard();
            placePieces(data.fen);
            currentFenIndex = parseFloat(data.index);
        } else {
            console.error('No FEN found.');
        }
    } catch (error) {
        console.error('Error fetching FEN:', error);
    }
}

// Function to handle rating calculation
function handleRatingCalculation(evalValue, actualEval) {
    let feedback = '';
    let errorMargin = Math.abs(evalValue - actualEval);

    if (errorMargin < 0.5) {
        ratingChange = Math.max(10 - errorMargin * 10, 1);
        streak++;
        ratingProgress += ratingChange;
        feedback = `Great job! You were very close. Streak: ${streak}`;
    } else {
        ratingChange = -Math.min(5 + errorMargin * 2, 15);
        streak = 0;
        ratingProgress = Math.max(0, ratingProgress + ratingChange);
        feedback = `Oops! You were far off. Stockfish evaluation: ${actualEval.toFixed(2)}`;
    }

    rating += ratingChange;
    if (ratingProgress >= 100) {
        rating += 50;
        ratingProgress = 0;
        feedback += " Level Up! Great work!";
    }

    ratingDisplay.textContent = `${rating} (${ratingChange >= 0 ? '+' : ''}${ratingChange})`;
    updateProgressBar(ratingProgress);
    feedbackDisplay.textContent = feedback;

    feedbackDisplay.classList.add('feedback-animated');
    setTimeout(() => {
        feedbackDisplay.classList.remove('feedback-animated');
    }, 1000);
}

// Function to update progress bar
function updateProgressBar(progress) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${progress}%`;
}

// Event listeners and handlers
document.getElementById('guess-btn').addEventListener('click', () => {
    const evalValue = parseFloat(evalBar.style.height) / 100 * 20 - 10;
    handleRatingCalculation(evalValue, currentFenIndex);
});

document.getElementById('next-puzzle-btn').addEventListener('click', () => {
    getRandomFen();
    feedbackDisplay.textContent = '';
    ratingDisplay.textContent = rating;
});

// Dragging and eval bar adjustment
evalBarContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    evalBar.classList.add('dragging');
    adjustEvalBarHeight(e.clientY);
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    evalBar.classList.remove('dragging');
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        adjustEvalBarHeight(e.clientY);
    }
});

// Function to adjust eval bar height
function adjustEvalBarHeight(mouseY) {
    const containerRect = evalBarContainer.getBoundingClientRect();
    const newHeight = containerRect.bottom - mouseY;
    const clampedHeight = Math.max(0, Math.min(newHeight, containerRect.height));
    evalBar.style.height = `${(clampedHeight / containerRect.height) * 100}%`;

    const evalValue = ((clampedHeight / containerRect.height) * 20) - 10;
    if (evalValueDisplay) {
        evalValueDisplay.textContent = evalValue.toFixed(1);
    }
}

createChessboard();
getRandomFen();
