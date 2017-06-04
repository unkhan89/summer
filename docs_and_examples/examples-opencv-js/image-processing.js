
var log = require('../../lib/logger');

log.init({'logLevel' : 'trace'});

log.info('Hello world');

var cv = require('opencv');

log.debug('CV module: ');

console.dir(cv);

cv.readImage('./aspen_team.jpg', function(err, image) {

  log.debug('image object: ');

  console.log(image);
  

  // image.convertGrayscale()
  // image.canny(10, 1000)       // increasing second param decreases number of countour lines
  // image.houghLinesP();

  // image.save('./out.jpg');

});
