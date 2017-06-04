
var utils = require('./board_utils');

var log;

var BLACK = 1;

var RED = -1;

var EMPTY = 0;

var NEW_BOARD = {
  'B1' : RED,
  'D1' : RED,
  'F1' : RED,
  'H1' : RED,
  'A2' : RED,
  'C2' : RED,
  'E2' : RED,
  'G2' : RED,
  'B3' : RED,
  'D3' : RED,
  'F3' : RED,
  'H3' : RED,
  'A4' : EMPTY,
  'C4' : EMPTY,
  'E4' : EMPTY,
  'G4' : EMPTY,
  'B5' : EMPTY,
  'D5' : EMPTY,
  'F5' : EMPTY,
  'H5' : EMPTY,
  'A6' : BLACK,
  'C6' : BLACK,
  'E6' : BLACK,
  'G6' : BLACK,
  'B7' : BLACK,
  'D7' : BLACK,
  'F7' : BLACK,
  'H7' : BLACK,
  'A8' : BLACK,
  'C8' : BLACK,
  'E8' : BLACK,
  'G8' : BLACK
};  

var currentBoard;


function init(contextObj) {

  log = contextObj.log;

  newGame();
} 


function newGame() {
  
  currentBoard = JSON.parse(JSON.stringify(NEW_BOARD));  
}


function getCurrentBoard() {

  return currentBoard;
}


function hasRedWon(board) {

  for(var cell in board) {

    if(board[cell] === BLACK) {

      return false
    }
  }

  return true;
};


function hasBlackWon(board) {

  for(var cell in board) {

    if(board[cell] === RED) {

      return false
    }
  }

  return true;
};


// Given a new setup of the 'board', returns what moves should be performed for next turn, assuming self if BLACK.
// Shall return something like:
// [
//   {
//     'from' : cellId, such as "A8"
//     'to' : cellId (such as "A8") or "OUT" (for off of board)
//   },
//   ...
// ] 
//
function nextTurn(board) {

  var movablePiecesToEmpty = [];

  for(var cell in board) {   // for each cell in board

    if(board[cell] === BLACK) {   // if cell is occupied by a black piece

      var diagonalCells = utils.getDiagonalCells(cell);   // get diagonal cells

      if(!diagonalCells) {  // assertion
        throw new Error('Invalid board cell: ' + cell + ' in given board: ' + JSON.stringify(board));
      }

      for(var diagonalCell in diagonalCells) {    // for each diagonal cell, should always 1 or 2

        if(board[diagonalCell] === EMPTY) {

          movablePiecesToEmpty.push({'from' : cell, 'to' : diagonalCell});
        }

        if(board[diagonalCell] === RED) {

          var hopCell = utils.getHopCell(cell, diagonalCell);

          if(board[hopCell] === EMPTY ) {

            // an opponent peice can be killed, return it

            return [
              {'from' : cell, 'to' : hopCell},
              {'from' : diagonalCell, 'to' : 'OUT'}
            ];
          }
        }
      }
    }
  }

  if(movablePiecesToEmpty.length === 0) {
    throw new Error('No valid black pieces to move for given board: ' + JSON.stringify(board));
  }

  return movablePiecesToEmpty[0];   // random move
};


module.exports = {
  hasRedWon : hasRedWon,
  hasBlackWon : hasBlackWon,
  nextTurn : nextTurn,
  getCurrentBoard : getCurrentBoard
};
