$(".navTrigger").click(function () {
  $(this).toggleClass("active");
  console.log("Clicked menu");
  $("#mainListDiv").toggleClass("show_list");
  $("#mainListDiv").fadeIn();
});
var board,
  game = new Chess(),
  statusEl = $("#status"),
  fenEl = $("#fen"),
  pgnEl = $("#pgn");

// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function (source, piece, position, orientation) {
  if (game.turn() === "b") {
    return false;
  }
  if (
    game.game_over() === true ||
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
};

var onDrop = function (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return "snapback";
  // Clear all previously highlighted tiles

  updateStatus();
  createTable();
  getResponseMove();
};

// update the board position after the piece snap
// for castling, en passant, pawn promotion
var onSnapEnd = function () {
  board.position(game.fen());
};

var updateStatus = function () {
  var status = "";

  // Check if the game is over
  if (game.game_over()) {
    // Check if it's a checkmate
    if (game.in_checkmate()) {
      var winner = game.turn() === "w" ? "Black" : "White";
      status = "Checkmate! " + winner + " wins!";
      displayWinner(status);
    }
    // Check if it's a draw
    else if (game.in_draw()) {
      status = "Draw!";
      displayMessage(status);
    }
    // Handle other game ending scenarios (e.g., stalemate, insufficient material, etc.)
    else {
      status = "Game over";
      displayMessage(status);
    }
  }
  // Game is still ongoing
  else {
    var moveColor = game.turn() === "w" ? "White's" : "Black's";
    status = moveColor + " turn";
    displayMessage(status);

    // Check if the current player is in check
    if (game.in_check()) {
      status += ", " + moveColor + " is in check";
      displayMessage(status);
    }
  }

  statusEl.html(status);
  fenEl.html(game.fen());
  pgnEl.html(game.pgn());
};

var cfg = {
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
};

var randomResponse = function () {
  fen = game.fen();
  $.get($SCRIPT_ROOT + "/move/" + fen, function (data) {
    game.move(data, { sloppy: true });
    // board.position(game.fen());
    updateStatus();
  });
};

var displayMessage = function (message) {
  var blackIcon = "../static/libs/chessboard/img/chesspieces/wikipedia/bP.png";
  var whiteIcon = "../static/libs/chessboard/img/chesspieces/wikipedia/wP.png";
  var icon = game.turn() === "b" ? blackIcon : whiteIcon;

  // Create the icon element
  var iconElement = document.createElement("img");
  iconElement.src = icon;
  iconElement.alt = "Icon";
  iconElement.id = "pawn";

  // Create the message element
  var messageElement = document.createElement("div");
  messageElement.textContent = message;

  // Create a container element
  var container = document.createElement("div");
  messageElement.appendChild(iconElement);
  container.appendChild(messageElement);

  // Append the container to the popup element
  var popup = document.getElementById("popup");
  popup.innerHTML = "";
  popup.appendChild(container);
};

var clearMessage = function () {
  var popup = document.getElementById("popup");
  var temp = "";
  popup.textContent = temp;
};

var trophy = "../static/libs/technologyimg/winner.gif";
var displayWinner = function (message) {
  var imagePath = trophy;

  // Create a modal dialog element
  var modal = $(
    '<div class="modal" style="top:25%" tabindex="-1" role="dialog"></div>'
  );
  var modalDialog = $('<div class="modal-dialog" role="document"></div>');
  var modalContent = $('<div class="modal-content"></div>');
  var modalBody = $(
    '<div class="modal-body" style="text-align: center; background-color: transparent;"></div>'
  );

  // Create the image element
  var image = $(
    '<img src="' +
    imagePath +
    '" alt="Winner Image" style="width: 40%; height: auto; top:3%">'
  );

  // Create the message element
  var messageElement = $(
    '<div style="text-align: center; font-weight:bold;">' + message + "</div>"
  );

  // Assemble the modal dialog
  modalBody.append(image);
  modalBody.append(messageElement);
  modalContent.append(modalBody);
  modalDialog.append(modalContent);
  modal.append(modalDialog);

  // Show the modal dialog
  modal.modal("show");
};

var getResponseMove = function () {
  var e = document.getElementById("sel1");
  var depth = 2;
  fen = game.fen();
  $.get($SCRIPT_ROOT + "/move/" + depth + "/" + fen, function (data) {
    game.move(data, { sloppy: true });
    updateStatus();
    createTable();
    setTimeout(function () {
      board.position(game.fen());
    }, 100);
  });
};

setTimeout(function () {
  board = ChessBoard("board", cfg);
}, 0);

var setPGN = function () {
  var table = document.getElementById("pgn");
  var pgn = game.pgn().split(" ");
  var move = pgn[pgn.length - 1];
};


var updateScroll = function () {
  $("#moveTable").scrollTop($("#moveTable")[0].scrollHeight);
};

var setStatus = function (status) {
  document.getElementById("status").innerHTML = status;
};

var takeBack = function () {
  game.undo();
  if (game.turn() != "w") {
    game.undo();
  }
  board.position(game.fen());
  updateStatus();
};
var clearTable = function () {
  var table = document.getElementById("pgn");
  // Remove existing table rows except for the first row (header)
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }
};

var newGame = function () {
  game.reset();
  board.start();
  clearTable();
  clearMessage();
  updateStatus();
};

var getCapturedPieces = function () {
  var history = game.history({ verbose: true });
  for (var i = 0; i < history.length; i++) {
    if ("captured" in history[i]) {
      console.log(history[i]["captured"]);
    }
  }
};

var getLastCapture = function () {
  var history = game.history({ verbose: true });
  var index = history.length - 1;

  if (history[index] != undefined && "captured" in history[index]) {
    console.log(history[index]["captured"]);
  }
};

// Get the restart button element
const restartButton = document.querySelector("#restartBtn");

function exitGame() {
  window.location.href = "menu";
}
