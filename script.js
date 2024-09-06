const Gameboard = (() => {
  let board = ["", "", "", "", "", "", "", "", ""];

  const getBoard = () => board;

  const updateBoard = (index, marker) => {
    if (board[index] === "") {
      board[index] = marker;
    }
  };

  const resetBoard = () => {
    board = ["", "", "", "", "", "", "", "", ""];
  };

  return { getBoard, updateBoard, resetBoard };
})();

const Player = (name, marker) => {
  let score = 0;

  const increaseScore = () => {
    score++;
  };

  const getScore = () => score;

  return { name, marker, increaseScore, getScore };
};

const GameController = (() => {
  let player1;
  let player2;
  let currentPlayer;
  let gameActive = true;

  const initializePlayers = (p1Name, p2Name) => {
    player1 = Player(p1Name, "X");
    player2 = Player(p2Name, "O");
    currentPlayer = player1;
    updateScoreboard();
  };

  const switchTurn = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  const getCurrentPlayer = () => currentPlayer;

  const playRound = (index) => {
    if (Gameboard.getBoard()[index] === "" && gameActive) {
      Gameboard.updateBoard(index, currentPlayer.marker);
      if (checkWinner()) {
        gameActive = false;
        currentPlayer.increaseScore();
        updateScoreboard();
        displayWinner(`${currentPlayer.name} wins!`);
      } else if (checkTie()) {
        gameActive = false;
        displayWinner("It's a tie!");
      } else {
        switchTurn();
        updateStatus(`${currentPlayer.name}'s turn`);
      }
    }
  };

  const checkWinner = () => {
    const board = Gameboard.getBoard();
    const winConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    return winConditions.some((condition) =>
      condition.every((index) => board[index] === currentPlayer.marker)
    );
  };

  const checkTie = () => {
    return Gameboard.getBoard().every((cell) => cell !== "");
  };

  const resetGame = () => {
    Gameboard.resetBoard();
    currentPlayer = player1;
    gameActive = true;
    updateStatus(`${currentPlayer.name}'s turn`);
    hideWinner();
  };

  const resetScoreboard = () => {
    player1 = Player(player1.name, "X");
    player2 = Player(player2.name, "O");
    resetGame();
    updateScoreboard();
  };

  const updateStatus = (message) => {
    document.getElementById("status").textContent = message;
  };

  const displayWinner = (message) => {
    const winnerOverlay = document.getElementById("winnerOverlay");
    const winnerText = document.getElementById("winnerText");
    winnerText.textContent = message;
    winnerOverlay.classList.remove("hidden");
    winnerOverlay.classList.add("visible");
  };

  const hideWinner = () => {
    const winnerOverlay = document.getElementById("winnerOverlay");
    winnerOverlay.classList.remove("visible");
    winnerOverlay.classList.add("hidden");
  };

  const updateScoreboard = () => {
    document.getElementById("player1Score").textContent = `${
      player1.name
    }: ${player1.getScore()}`;
    document.getElementById("player2Score").textContent = `${
      player2.name
    }: ${player2.getScore()}`;
  };

  const isCellClickable = (index) =>
    Gameboard.getBoard()[index] === "" && gameActive;

  return {
    playRound,
    resetGame,
    resetScoreboard,
    initializePlayers,
    getCurrentPlayer,
    isCellClickable,
  };
})();

const DisplayController = (() => {
  const gameboardDiv = document.getElementById("gameboard");
  const nameInputDiv = document.getElementById("nameInput");
  const gameContainerDiv = document.getElementById("gameContainer");
  const scoreboardDiv = document.getElementById("scoreboard");

  const validateName = (name, errorElementId) => {
    const regex = /^[^\d][\w\s]{1,19}$/; // Name must be between 2-20 characters and not start with a digit
    const isValid = regex.test(name);
    const errorElement = document.getElementById(errorElementId);

    if (name.length < 2 || name.length > 20) {
      errorElement.textContent = "Name must be between 2-20 characters.";
      errorElement.style.display = "block";
      return false;
    } else if (!isValid) {
      errorElement.textContent = "Invalid name format.";
      errorElement.style.display = "block";
      return false;
    }

    errorElement.style.display = "none";
    return true;
  };

  const submitNames = () => {
    const player1Name = document.getElementById("player1Name").value.trim();
    const player2Name = document.getElementById("player2Name").value.trim();

    const isPlayer1Valid = validateName(player1Name, "player1Error");
    const isPlayer2Valid = validateName(player2Name, "player2Error");

    if (!isPlayer1Valid || !isPlayer2Valid) {
      return;
    }

    if (player1Name === player2Name) {
      alert("Players cannot have the same name.");
      return;
    }

    GameController.initializePlayers(
      player1Name || "Player 1",
      player2Name || "Player 2"
    );
    nameInputDiv.classList.add("hidden");
    gameContainerDiv.classList.remove("hidden");
    scoreboardDiv.classList.remove("hidden");
    startGame();
  };

  const renderBoard = () => {
    gameboardDiv.innerHTML = "";
    const fragment = document.createDocumentFragment();
    Gameboard.getBoard().forEach((cell, index) => {
      const cellDiv = document.createElement("div");
      cellDiv.textContent = cell;
      cellDiv.classList.add(
        GameController.isCellClickable(index) ? "clickable" : "unclickable"
      );
      cellDiv.addEventListener("click", () => {
        if (GameController.isCellClickable(index)) {
          GameController.playRound(index);
          renderBoard();
        }
      });
      fragment.appendChild(cellDiv);
    });
    gameboardDiv.appendChild(fragment);
  };

  const startGame = () => {
    GameController.resetGame();
    renderBoard();
  };

  document
    .getElementById("submitNamesButton")
    .addEventListener("click", submitNames);
  document.getElementById("restartButton").addEventListener("click", startGame);
  document.getElementById("resetScoreButton").addEventListener("click", () => {
    GameController.resetScoreboard();
    renderBoard();
  });

  return { renderBoard };
})();
