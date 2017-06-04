  
// process.on('uncaughtException', function(error) {  
//   console.log('uncaught exception: ' + JSON.stringify(error));
// });

var context = {};

context.config = require('./config');

var log = require('../../lib/logger');

log.init({'logLevel' : context.config.logLevel});

log.info('Hello');

context.log = log;

context.arm = require('./arm');

context.arm.init(context, function(error) {

  if(error) {
    log.fatal('Failed to initialize arm', error);
    process.exit(1);
  } 

  context.controller = require('./controller');

  context.controller.init(context, function(error) {

    if(error) {
      context.log.fatal('Failed to initialize controller', error);
      process.exit(1);
    }

    context.game = require('./game');

    cotext.game.init(); 

    context.server.listen(context.config.port);

    context.log.info('Controller ready and listening on port ' + context.config.port);

    runShellCommand('python ./vision_controller.py', function() {

      setTimeout(function() {

        var comandToGetVisionControllerPID = 'ps -ef | grep -v "color" | grep "python vision_controller.py" | awk "{print $2}"';

        runShellCommand(command, function(error, pid) {

          log.info('CV controller ready, start game');

          process.on('SIGINT', function () {

            log.info('Shutting down...');

            context.arm.setDefaultPosition();

            runShellCommand('sudo kill ' + pid, function() {

              log.info('Goodbye');
  
            });
          });
        });
      }, 1000);  
    });
  });
});



function runShellCommand(command, callback) {

  log.debug('Running shell command: ' + command);
  
  subprocess = exec(command, function (error, stdout, stderr) {
    
    log.trace('stdout: ' + stdout);
    
    if (error) {
      log.fatal('Error executing bash command: ' + command, error);
      process.exit(0);
    }

    if(stderr) {
      log.warn('Error returned from shell for command "' + command + '" - ' + stderr);
      //process.exit(0);
    }

    callback(null, stdout);
  });
}
