
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

    context.psc.setServoPosition(0, 1000, function() {
      
      context.psc.setServoPosition(2, 1050, function() {

        context.psc.setServoPosition(1, 1000, function() {
      
          context.psc.setServoPosition(2, 800, function() {
          
            context.psc.setServoPosition(0, 690, function() {

              context.psc.setServoPosition(1, 720, function() {

                context.psc.setServoPosition(2, 400, function() {

                  context.psc.setServoPosition(0, 300, function() {

                    context.psc.setServoPosition(0, 690, function() {

                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }
});



