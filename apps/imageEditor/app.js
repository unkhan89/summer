
// process.on('uncaughtException', function(error) {
  
//   console.log('uncaught exception: ' + JSON.stringify(error));
// });

var context = {
  config : {
    port : 3000
  },
  log : require('../../lib/logger'),
  controller : require('./controller')
};

context.log.init({'logLevel' : 'trace'});

context.log.info('Hello');

context.controller.init(context, function(error) {

  if(error) {

    context.log.fatal('Failed to initialize controller', error);

    process.exit(1);
  
  } else {

    context.server.listen(context.config.port);

    context.log.info('Server ready and listening on port ' + context.config.port);

  }
});