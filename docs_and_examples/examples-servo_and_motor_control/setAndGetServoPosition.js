#!/usr/bin/env node

console.log('hello');
var log = require('../../lib/logger');

log.init({'logLevel' : 'trace'});

log.info('Hello world');

var SerialPort = require('serialport');

var port;

SerialPort.list(function (error, ports) {

  log.info('Found ' + ports.length + ' ports on device');

  var address;

  ports.some(function(port, index) {

    log.debug('(' + index + ')  ' + JSON.stringify(port));

    if(port['vendorId'] == '0x0403' && port['productId'] == '0x6001') {

      log.info('Found PSC on port ' + port['comName']);

      address = port['comName'];

      return true;
    }
  });

  var options = {
    // parser : SerialPort.parsers.readline('\n'),   
    baudRate : 2400
  };

  port = new SerialPort(address, options, function (error) {
  
    if (error) {
  
      log.fatal('Unable to open port', error);
    
    } else {

      log.info('Port opened');

      // events

      port.on('disconnect', function(error) {

        log.warn('Port disconnected', error);
      });

      port.on('close', function() {

        log.info('Port closed');
      });

      var readByteArray = [];
      var readBuffer;

      port.on('data', function(singleByteBuffer) {

        log.trace('----------------------------');
        log.trace('On data buffer strigified: ' + JSON.stringify(singleByteBuffer));
        log.trace('Data buffer console logged: ');
        console.log(singleByteBuffer);
        log.debug('Data buffer to string: ' + (new String(singleByteBuffer)));

        readByteArray.push(singleByteBuffer[0])  //  add to readBuffer 

        if(readByteArray.length == 3) {   // read 3 bytes, save message to buffer

          readBuffer = new Buffer(readByteArray);
          readByteArray = [];
        }

        log.trace('----------------------------');
      });

      setTimeout(function() {
            
        // “!SC” <channel> <ramp speed> <lowbyte> <highbyte> <CR>

        // var setServo0PositionCommand = new Buffer([
        //   0x21,   // !
        //   0x53,   // S
        //   0x43,   // C
        //   0x00,   // 0
        //   0x0A,   // 10
        //   0x02,   // 
        //   0xEE,   // 750
        //   0x0d    // \r
        // ]);
        
        var servoPositionHex = getBinBuffer(750);

        log.debug('servoPositionHex from helper function: ');
        
        console.log(servoPositionHex);

        // “!SC” <channel> <ramp speed> <lowbyte> <highbyte> <CR>
        var setServo0PositionCommand = new Buffer([
          0x21,   // !
          0x53,   // S
          0x43,   // C
          0x00,   // 0
          0x0A,   // 10
          servoPositionHex[0],
          servoPositionHex[1],          
          0x0d    // \r
        ]);

        log.debug('Writing command: ');
        console.log(setServo0PositionCommand);

        port.write(setServo0PositionCommand, function(error) {
          
          if (error) {

            log.error('Error on write: ', error);
              
          } else {

            log.debug('Message written: ' + setServo0PositionCommand);


            setTimeout(function() {

              // command: !SCRSP <channel> \r
              // response: <channel> <highbyte> <lowbyte> 
              var getServo0PositionCommand = new Buffer([
                0x21,   // !
                0x53,   // S
                0x43,   // C
                0x52,   // R
                0x53,   // S
                0x50,   // P
                0x00,   // 0
                0x0D    // \r
              ]);
              
              log.debug('Writing hard coded command: ');
              console.log(getServo0PositionCommand);

              port.write(getServo0PositionCommand, function(error) {
                
                if (error) {

                  log.error('Error on write: ', error);
                  
                } else {

                  log.debug('Message written: ' + getServo0PositionCommand);

                  setTimeout(function() {

                    log.debug('Read buffer console: ');
                    console.log(readBuffer);

                    log.debug('Read buffer stringified: ' + JSON.stringify(readBuffer));

                    log.debug('Read buffer to string: ' + (new String(readBuffer)));

                    log.debug('Read servo position: ' + parseServoPosition(readBuffer));

                  }, 1000);
                }
              });
            }, 1000);    
          }
        });
      }, 1000);
    }
  });
});


process.on('SIGINT', function () {

  log.info('Exiting');

  if(port && port.isOpen()) {

    port.close(function(error) {

      if(error) {

        log.error('Error closing port', error);
        process.exit(1);
      
      } else {

        process.exit(0);
      }
    });
  } else {

    process.exit(0);
  }
});

//
// Given a 3 byte buffer in the format: [servoId, highByte, lowByte]
// returns an integer representing the servo position
//
function parseServoPosition(buf) {

  return parseInt((new Number(buf[2])).toString(16) + (new Number(buf[1])).toString(16), 16);
}

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