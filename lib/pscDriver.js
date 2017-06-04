
var log = require('./logger'),
    SerialPortLib = require('serialport'),
    pscVendorId = '0x0403',
    pscProductId = '0x6001',
    baudRate = 2400,
    rampSpeed = 0x14,             // 10, the lower the faster servo ajusts, max of 63
    portAddress,
    port,
    strictModeEnabled = false,    // if enabled, will validate servo positions before setting them based on given config
    ioDelayMs = 500,
    readBuffer = [],
    context,
    servos = [],
    log;


function init(contextObj, callback) {

  context = contextObj;

  log = context.log;

  log.trace('PscDriver.init()');

  if(context.config.psc.enableStrict == true) {

    strictModeEnabled = true;

    servos = context.config.psc.servos;     // array of servo objects wtih IDs, mins, defaults, and max values

    if(!servos || servos.length < 1) {

      var errorMessge = 'No servo configuration provided to psc driver: ' + JSON.stringify(servos);
      
      log.warn(errorMessage);

      callback(new Error(errorMessage));
      
      return;    
    }
  }

  SerialPortLib.list(function (error, ports) {

    log.debug('Found ' + ports.length + ' ports on device');

    portAddress = findMyPortAddress(ports);

    if(!portAddress) {

      callback(new Error('Unable to find PSC connected to any port'));
      return;
    }

    var options = {
      // parser : SerialPortLib.parsers.readline('\n'),   
      baudRate : baudRate,
      lock : true
    };

    port = new SerialPortLib(portAddress, options, function (error) {
    
      if (error) {
    
        log.error('Unable to open port', error);
        callback(error);
      
      } else {

        log.info('USB Port opened');

        // events

        port.on('disconnect', function(error) {

          log.warn('Seria port disconnected', error);
        });

        port.on('close', function() {

          log.warn('Serial port closed');
        });

        var readByteArray = [];   // temporary storage of bytes
        
        port.on('data', function(singleByteBuffer) {

          readByteArray.push(singleByteBuffer[0]);

          if(readByteArray.length == 3) {   // read 3 bytes, save message to buffer

            readBuffer = new Buffer(readByteArray);
            
            readByteArray = [];   // reset temp storage for next command
          }
        });

        port.on('error', function(error) {

          log.error('Error on serial port', error);

        });

        

        callback();
      }    
    });
  });
}


function findMyPortAddress(ports) {

  var myPortAddress;

  ports.some(function(tempPort, index) {

    log.debug('(' + index + ')  ' + JSON.stringify(tempPort));

    if(tempPort['vendorId'] == pscVendorId && tempPort['productId'] == pscProductId) {

      log.debug('Found PSC on port ' + tempPort['comName']);

      myPortAddress = tempPort['comName'];

      return true;
    }
  });

  return myPortAddress;
}


function getVersion(callback) {

  var versionCommand = new Buffer('!SCVER?\r');   
  // var versionCommand = new Buffer([
  //   0x21, 0x53, 0x43, 0x56, 0x45, 0x52, 0x3f, 0x0d
  // ]);
  
  port.write(versionCommand, function(error) {
    
    if (error) {

      log.error('Error on write: ', error);
      callback(error, null);

    } else {

      log.debug('Message written: ' + versionCommand);

      setTimeout(function() {

        callback(null, readBuffer);

      }, ioDelayMs);
    }
  });
}


//
// Sets a position for a servo.
// Param servoId refers to a channel on the PSC board.
// Position is relavant to servo PWM. 
//
function setServoPosition(servoId, position, callback) {

  log.trace('setServoPosition() id: ' + servoId + ', position: ' + position);

  if(strictModeEnabled) {

    if(!isServoPositionValid(servoId, position)) {

      callback(new Error('Unable to set invalid servo position ' + position + ' for servo ID ' + servoId));
      return;
    }  
  }

  var positionBuffer = getBinBuffer(position);

  //
  // Per documentation: 
  //
  // “!SC” <channel> <ramp speed> <lowbyte> <highbyte> <CR>
  // 
  // however, it seems like high byte comes first, wtf? 
  //
  var setServoPositionCommand = new Buffer([
    0x21,                 // !
    0x53,                 // S
    0x43,                 // C
    servoId.toString(16), // position in hex
    rampSpeed,            // ramp speed
    positionBuffer[1],    // low byte 
    positionBuffer[0],    // high byte
    0x0D                  // \r
  ]);

  log.debug('Writing bytes: ');
  console.log(setServoPositionCommand);

  port.write(setServoPositionCommand, function(error) {

    if (error) {

      log.error('Error on write: ', error);

      callback(error);

    } else {

      port.drain(function() {

        setTimeout(function() {

          callback(null);

        }, ioDelayMs); 
      });  
    }
  });
}


function getServoPosition(servoId, callback) {

  log.trace('getServoPosition() id: ' + servoId);

  // !SCRSP <channel> \r
  // response: <channel> <highbyte> <lowbyte> 
  var getServoPositionCommand = new Buffer([
    0x21,                 // !
    0x53,                 // S
    0x43,                 // C
    0x52,                 // R
    0x53,                 // S
    0x50,                 // P
    servoId.toString(16), // 0
    0x0D                  // \r
  ]);

  log.debug('Wrinting bytes: ');
  console.log(getServoPositionCommand);

  port.write(getServoPositionCommand, function(error) {

    if (error) {

      log.error('Error on write: ', error);

      callback(error, null);
    
    } else {

      setTimeout(function() {

        callback(null, parseServoPosition(readBuffer));

      }, ioDelayMs);
    }
  });
}


//
// Given an integer (that can have a max value of 0xfff), returns a 
// two byte Buffer with low byte and high byte
//
function getBinBuffer(n) {

  var hexString = (n).toString(16);

  if(hexString.length == 1 || hexString.length == 2) {
    
    return new Buffer(['0x0', '0x' + hexString]);
  
  } else if(hexString.length == 3) {

    return new Buffer(['0x' + hexString.charAt(0), '0x' + hexString.substring(1)]);
  
  } else {

    log.fatal('PSCDriver.getBinBuffer() received unsupported value: ' + n);
  }
}

//
// Given a 3 byte buffer in the format: [servoId, highByte, lowByte]
// returns an integer representing the servo position
//
function parseServoPosition(buff) {

  return parseInt((new Number(buff[1])).toString(16) + (new Number(buff[2])).toString(16), 16);
}


//
// Given an integer servo ID, checks if the position is within the 
// configured min and max
//
function isServoPositionValid(servoId, position) {

  var isValid = false;

  servos.forEach(function(servo) {

    if(servo['id'] === servoId) {

      if(servo['min'] <= position && position <= servo['max']) {

        isValid = true;
      }
    }
  });

  return isValid;
}


module.exports = {
  init: init,
  getVersion: getVersion,
  setServoPosition: setServoPosition,
  getServoPosition: getServoPosition
}
