
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
  log.debug('Static folder: ' + __dirname +  '/html');
  app.use(express.static(__dirname +  '/html'));

  server = context.server = http.createServer(app);

  app.all('*', function(req, res, next) {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');
      
    next();
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



  app.get('/getServoPositions', function(req, res) {

    log.trace('GET /getServoPositions');

    res.json(context.arm.getModel());
  });


  app.get('/gripper/:action', function(req, res) {

    log.trace('GET /gripper/' + req.params.action);

    var functionToCall;

    switch(req.params.action) {
      case 'open':
        functionToCall = 'openHand';
        break;
      case 'close':
        functionToCall = 'closeHand';
        break;
      default:
        sendBadRequest(res, 'Unknown gripper/hand action: ' + req.params.action);
        return;
    }

    context.arm[functionToCall](function(error) {

      if(error) {

        log.error('Error returned from arm', error);
        sendServerError(res, 'Failed to ' + req.param.action + ' hand');
      
      } else {

        res.json({'result' : 'OK'});
      }
    });
  });


  app.get('*', function(req, res) {

    sendNotFoundError(res);
  });
  
  callback();
}


function setServoPosition(servoId, position, res) {

  // TODO: Should really grab these from config: 

  var functionToCall;

  switch(servoId) {
    case 0:
      functionToCall = 'setBase';
      break;
    case 1:
      functionToCall = 'setShoulder';
      break;
    case 2:
      functionToCall = 'setElbow';
      break;
    default:
      sendBadRequest(res, 'No servo setup/configured with ID ' + servoId);
      return;
  }

  context.arm[functionToCall](position, function(error) {

    if(error) {

      log.error('Error returned from arm', error);
      sendServerError(res, 'Failed to set servo');
    
    } else {

      res.json({'result' : 'OK'});
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
