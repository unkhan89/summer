
var context = {},
    log = require('../../lib/logger');

log.init({'logLevel' : 'trace'});

context.log = log;

context.psc = require('../../lib/pscDriver');

context.psc.init(context, function(error) {

  if(error) {

    log.fatal('unable to init psc');
  
  } else {

    log.info('Hello world');

    var servoId = 0;

    context.psc.setServoPosition(servoId, 750, function() {
    
      context.psc.getServoPosition(servoId, function(error, position) {

        log.info('Servo ' + servoId + ' is a position ' + position);

        context.psc.getVersion(function(error, version) {

          log.info('Version: ');
          console.log(version);

          context.psc.setServoPosition(servoId, 500, function() {
          
          });
        });
      });    
    });
  }
});



