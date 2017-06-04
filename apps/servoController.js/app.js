
//
// Starts a simple server for controlling psc and l293d 
//
//

process.on('uncaughtException', function(error) {
  
  console.log('uncaught exception: ' + JSON.stringify(error));
});

var context = {
  config: require('./config'),
  log : require('../../lib/logger'),
  server : require('./lib/server'),
  psc: require('../../lib/pscDriver')
};

context.log.init(context.config.logging);

context.log.info('Hello');

context.server.init(context, function(error) {

  if(error) {

    context.log.fatal('Failed to initialize server', error);

    process.exit(1);
  
  } else {

    context.server.listen(context.config.port);

    context.log.info('Server ready and listening on port ' + context.config.port);

    context.psc.init(context, function(error) {

      if(error) {

        context.log.fatal('Failed to initialize PSC Driver', error);

        process.exit(1);
      
      } else {

        context.log.info('Successfully initialized PSC');
      }
    });
  }
});