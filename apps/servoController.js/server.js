
var fs = require('fs'), 
  path = require('path'), 
  express = require('express'), 
  http = require('http'), 
  async = require('async'), 
  url = require('url'), 
  context,
  config,
  log,
  app,
  server;


function init(contextObj, callback) {

  context = contextObj;
  
  log = context.log;

  log.trace('Initializing server');
  
  app = context.app = express();
  app.disable('etag');
  app.use(rawBodyParser);
  app.use(express.static('lib/html'));

  server = context.server = http.createServer(app);

  app.all('*', function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Content-Type", "application/json");
      
    next();
  });


  app.get('/rotateServo/:servoId/:direction', function(req, res) {

    log.trace('GET /rotateSevo');

    var servoId = req.params.servoId,
        direction = req.params.direction.toLowerCase();

    if(direction != 'clockwise' && direction != 'counterclockwise' && direction != 'idle') {

      sendBadRequest(res, 'invalid direction: ' + direction);
      return;
    }

    var position = 750;

    if(direction == 'clockwise') {

      position = 900; 

    } else if (direction == 'counterclockwise') {

      position = 500;
    }

    log.debug('Rotating servo ' + servoId + ' in ' + direction + ' direction');

    setServoPosition(servoId, position, res);

  });


  app.get('/setServo/:servoId/:position', function(req, res) {

    log.trace('GET /setServo');

    var servoId = req.params.servoId,
        position = req.params.position;

    if(isNaN(servoId) || isNaN(position)) {

      sendBadRequest(res, 'please provide valid numbers for servo ID and position');
      return;
    }

    servoId = parseInt(servoId),
    position = parseInt(position);

    setServoPosition(servoId, position, res);

  });



  app.get('/getServoPosition/:servoId', function(req, res) {

    log.trace('GET /getServoPosition');

    var servoId = req.params.servoId

    if(isNaN(servoId)) {

      sendBadRequest(res, 'please provide valid numbers for servo ID and position');
      return;
    }

    context.psc.getServoPosition(parseInt(servoId), function(error, position) {

      if(error) {

        sendServerError(res, {'error getting servo position': error.message});

      } else {

        res.json({'position' : position});
      }
    })

  });

  // TODO get psc version

  app.get('*', function(req, res) {

    sendNotFoundError(res);
  });
  
  callback();
}

//
// TODO: should this be handing sending response back to client?
//
function setServoPosition(servoId, position, res) {

  log.debug('setServoPosition() servoId: ' + servoId + ', position: ' + position);

  context.psc.setServoPosition(servoId, position, function(error) {

    if(error) {

      sendServerError(res, 'error rotating servo');
    
    } else {

      res.json({'result' : 'ok'});
    }
  });
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


function rawBodyParser(req, res, next) {

  var data = '';
  
  req.setEncoding('utf8');
  
  req.on('data', function(chunk) {
  
    data += chunk;
  });
  
  req.on('end', function() {
  
    req.rawBody = data;
    
    next();
  });
}


module.exports = {
  init : init
};
