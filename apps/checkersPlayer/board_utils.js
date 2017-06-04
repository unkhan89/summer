

var BOARD = [
  [null, 'B1', null, 'D1', null, 'F1', null, 'H1'],
  ['A2', null, 'C2', null, 'E2', null, 'G2', null],
  [null, 'B3', null, 'D3', null, 'F3', null, 'H3'],
  ['A4', null, 'C4', null, 'E4', null, 'G4', null],
  [null, 'B5', null, 'D5', null, 'F5', null, 'H5'],
  ['A6', null, 'C6', null, 'E6', null, 'G6', null],
  [null, 'B7', null, 'D7', null, 'F7', null, 'H7'],
  ['A8', null, 'C8', null, 'E8', null, 'G8', null]
];


// Given a cell, shall return an array of diagonal cells in forward direction.
// Example: 'B7' -> ['A6', 'C6']
// TODO: Use BOARD instead of hard coding values (really Umar?)
//
function getDiagonalCells(cell) {

  switch(cell) {
    case 'A2':
      return ['B1'];
    case 'C2':
      return ['B1', 'D1'];
    case 'E2':
      return ['D1', 'F1'];
    case 'G2':
      return ['F1', 'H1'];
    case 'B3':
      return ['A2', 'C2'];
    case 'D3':
      return ['C2', 'E2'];
    case 'F3':
      return ['E2', 'G2'];
    case 'H3':
      return ['G2'];
    case 'A4':
      return ['B3'];
    case 'C4':
      return ['B3', 'D3'];
    case 'E4':
      return ['D3', 'F3'];
    case 'G4':
      return ['F3', 'H3'];
    case 'B5':
      return ['A4', 'C4'];
    case 'D5':
      return ['C4', 'E4'];
    case 'F5':
      return ['E4', 'G4'];
    case 'H5':
      return ['G4'];
    case 'A6':
      return ['B5'];
    case 'C6':
      return ['B5', 'D5'];
    case 'E6':
      return ['D5', 'F5'];
    case 'G6':
      return ['F5', 'H5'];
    case 'B7':
      return ['A6', 'C6'];
    case 'D7':
      return ['C6', 'E6'];
    case 'F7':
      return ['E6', 'G6'];
    case 'H7':
      return ['G6'];
    case 'A8':
      return ['B7'];
    case 'C8':
      return ['B7', 'D7'];
    case 'E8':
      return ['D7', 'F7'];
    case 'G8':
      return ['F7', 'H7'];
    default:
      return null;
  }
}


// Given a cell and a cell diagonal to it, returns the cell that a piece would hop to, null otherwise.
// Example: ('A8', 'B7') -> 'C6'
// TODO: Use BOARD instead of hard coding values (come on Umar!)
//
function getHopCell(cell, diagonalCell) {

  switch(cell) {
    
    case 'B3':
      return (diagonalCell === 'C2') ? 'D1' : null;
    
    case 'D3':
      if(diagonalCell === 'C2')
        return 'B1';
      else if(diagonalCell === 'E2') 
        return 'F1';
      else
        return null;
    
    case 'F3':
      if(diagonalCell === 'E2')
        return 'D1';
      else if(diagonalCell === 'G2') 
        return 'H1';
      else
        return null;

    case 'H3':
      return (diagonalCell === 'G2') ? 'F1' : null;
    
    case 'A4':
      return (diagonalCell === 'B3') ? 'C2' : null;;
    
    case 'C4':
      if(diagonalCell === 'B3')
        return 'A2';
      else if(diagonalCell === 'D3') 
        return 'E2';
      else
        return null;

    case 'E4':
      if(diagonalCell === 'D3')
        return 'C2';
      else if(diagonalCell === 'F3') 
        return 'G2';
      else
        return null;

    case 'G4':
      return (diagonalCell === 'F3') ? 'E2' : null;
    
    case 'B5':
      return (diagonalCell === 'C4') ? 'D3' : null;

    case 'D5':
      if(diagonalCell === 'C4')
        return 'B3';
      else if(diagonalCell === 'E4') 
        return 'F3';
      else
        return null;

    case 'F5':
      if(diagonalCell === 'E4')
        return 'D3';
      else if(diagonalCell === 'G4') 
        return 'H3';
      else
        return null;
    
    case 'H5':
      return (diagonalCell === 'G4') ? 'F3' : null;

    case 'A6':
      return (diagonalCell === 'B5') ? 'C3' : null;

    case 'C6':
      if(diagonalCell === 'B5')
        return 'A4';
      else if(diagonalCell === 'D5') 
        return 'E4';
      else
        return null;

    case 'E6':
      if(diagonalCell === 'D5')
        return 'C4';
      else if(diagonalCell === 'F5') 
        return 'G4';
      else
        return null;

    case 'G6':
      return (diagonalCell === 'F5') ? 'E4' : null;

    case 'B7':
      return (diagonalCell === 'C6') ? 'D5' : null;

    case 'D7':
      if(diagonalCell === 'C6')
        return 'B5';
      else if(diagonalCell === 'E6') 
        return 'F5';
      else
        return null;

    case 'F7':
      if(diagonalCell === 'E6')
        return 'D5';
      else if(diagonalCell === 'G6') 
        return 'H5';
      else
        return null;
      
    case 'H7':
      return (diagonalCell === 'G6') ? 'F5' : null;

    case 'A8':
      return (diagonalCell === 'B7') ? 'C6' : null;

    case 'C8':
      if(diagonalCell === 'B7')
        return 'A6';
      else if(diagonalCell === 'D7') 
        return 'E6';
      else
        return null;

    case 'E8':
      if(diagonalCell === 'D7')
        return 'C6';
      else if(diagonalCell === 'F7') 
        return 'G6';
      else
        return null;

      return ['D7', 'F7'];

    case 'G8':      
      return (diagonalCell === 'F7') ? 'E6' : null;

    default:
      return null;
  }
}


module.exports = {
  getDiagonalCells : getDiagonalCells,
  getHopCell : getHopCell
};
