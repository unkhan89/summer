
var log = require('../../lib/logger');

log.init({'logLevel' : 'trace'});

log.info('Hello world');

var cv = require('opencv');

cv.readImage('./aspen_team.jpg', function(err, image) {
  
  image.ellipse(100, 100, 50, 100);
  
  image.line([50,50], [500, 500]);

  image.save('./out.jpg');

});
