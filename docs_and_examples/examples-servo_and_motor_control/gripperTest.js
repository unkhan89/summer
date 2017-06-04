
var context = {},
    log = require('../../lib/logger');

log.init({'logLevel' : 'trace'});

context.log = log;

context.config = {
  'l293d' : {}
};

var duration = 1200;

hbridge = require('../../lib/l293dDriver');

hbridge.init(context, function(error) { 

  if(error) {
    
    log.fatal('Error returned from l293d hbridge init', error);
    process.exit(1);
  }

  hbridge.stopMotor(function() {});
  
  setTimeout(function() {

  log.info('Rotating clockwise ...');

  hbridge.rotateClockwise(duration, function(error) {

    if(error) {
      log.error('Error rotating clockwise', error);
      hbridge.stopMotor(function() {});
      process.exit(0);
    }

    setTimeout(function() {

      log.info('Rotating counter clockwise...');

      hbridge.rotateCounterClockwise(duration, function(error) {

        if(error) {
        
          log.error('Error rotating counter clockwise', error);
          hbridge.stopMotor(function() {});
          process.exit(0);
        }
      
        log.info('Good bye');

      });
    }, 1000);
  });

  }, 2000);

});
