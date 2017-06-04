
//
// Starts a simple server for controlling psc and l293d 
//
//


var async = require('async');

var context = {
  // config: require('./config'),
  config : require('../checkersPlayer/config'),
  arm : require('../checkersPlayer/arm'),
  log : require('../../lib/logger'),
  server : require('./server')
};

context.log.init(context.config.logging);

context.log.info('Hello');

context.arm.init(context, function(error) {

  if(error) {

    context.log.fatal('Failed to initialize robotic arm', error);

    process.exit(1);
  
  } else {

    context.log.info('Successfully initialized robotic arm');

    context.server.init(context, function(error) {

      if(error) {

        context.log.fatal('Failed to initialize server', error);

        process.exit(1);
      
      } else {

        context.server.listen(context.config.port);

        context.log.info('Server ready and listening on port ' + context.config.port);
	        
	context.log.info('Testing moves ...');

        var moves = [
	  { 'from' : 'D5', 'to' : 'OUT'},
          { 'from' : 'C6', 'to' : 'E4', 'timeout' : 1000},
	  { 'from' : 'H5', 'to' : 'G4' }
        ];

        async.eachSeries(
          moves,
          function(move, next) {

            var moveTimeout = 5000;

            if(move.timeout) {

              moveTimeout = move.timeout;
            } 

            context.log.info('Moving piece ' + JSON.stringify(move) + ' in ' + moveTimeout + 'ms');

            setTimeout(function() {
          
              context.arm.movePiece(move, function(error) {

                if(error) {
 
                  context.log.fatal('Failed to move piece', error);
              
                  process.exit(1);
                }

                context.log.info('DONE');
                next();                

              });
            }, moveTimeout);
          },
          function() {
            
            context.log.info('ALL DONE, Good bye');
          }
        );
      }
    });
  }
});
