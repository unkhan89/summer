
var express = require('express'), 
    http = require('http'), 
    async = require('async'), 
    request = require('request'),
    context,
    config,
    log,
    server,
    expressServer,
    CheckersGame = require('./CheckersGame'),
    game,
    arm;
    

function init(contextObj, callback) {

  context = contextObj;
  
  log = context.log;

  log.trace('Initializing controller');

  game = context.game;
  
  expressServer = context.expressServer = express();
  expressServer.disable('etag');
  expressServer.use(rawBodyParser);
  expressServer.use(express.static('./html'));

  server = context.server = http.createServer(expressServer);

  expressServer.all('*', function(req, res, next) {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');
      
    next();
  });

  expressServer.get('/', help);

  expressServer.get('/startGame', function(req, res) {

    game.newGame();

    sendText(res, 'Make your move and hit this when done: <a href="/doTurn">Do Turn</a></br/>');
  });

  expressServer.get('/doTurn', function(req, res) {

    // get new setup of board from cv controller:
    
    var url = 'http://localhost:' + context.config.cvControllerPort + '/getPositions';

    request(url, function(error, response, body) {

      log.info('Got new positions from CV controller: \n' + JSON.stringify(body, null, '  '));

      var nextMoves = game.nextTurn(body);

      log.info('Performing next turn of moves: \n' + JSON.stringify(nextMoves, null, '  '));

      async.eachSeries(nextMoves,
        function(move, next) {

          arm.movePiece(move, function(error) {

            if(error) {
            
              log.fatal('Failed to execute move ' + JSON.stringify(move) + ' successfully', errro);
            
            } else {

              log.debug('Successfully executed move ' + JSON.stringify(move));

              setTimeout(function {

                next();

              }, 1000);
            }
          });

        }, function() {

          if(game.hasRedWon() === true) {

            sendText(res, 'Congrats, you won! Now setup board and <a href="/startGame">start new game</a>');

          } else if(game.hasBlackWon() === true) {

            sendText(res, 'Loser! Now setup board and <a href="/startGame">start new game</a>');

          } else {

            sendText(res, 'Make your move and hit this when done: <a href="/doTurn">Do Turn</a></br/>');
          }
        }
      );
    });
  });

  expressServer.get('/currentBoard', function(req, res) {

    res.json(game.getCurrentBoard);
  });

  expressServer.get('*', help);

  callback();
}


function help(req, res) {

  var help = '<a href="/startGame">Start game</a></br/>';

  help += '<a href="/doTurn">Do Turn</a></br/>';

  sendText(res, help);
}


function sendText(res, text) {

  res.writeHead(200, {
    'Content-Type' : 'text/html'
  });

  res.end(text);
}


function sendBadRequest(res, errorMessage) {

  res.status(400).jsonp({'error' : errorMessage});
}


function sendServerError(res, errorMessage) {

  res.status(500).jsonp({'error' : errorMessage});
}


function sendNotFoundError(res) {

  res.status(404).jsonp({'error' : 'not found'});
}


module.exports = {
  init : init
};