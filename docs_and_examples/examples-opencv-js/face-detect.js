
var log = require('../../lib/logger');

log.init({'logLevel' : 'trace'});

log.info('Hello world');

var cv = require('opencv');

// cv.readImage('./mona.jpg', function(err, image) {
cv.readImage('./aspen_team.jpg', function(err, image) {

  image.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {

    for (var i = 0; i < faces.length; i++) {

      log.debug('face: ' + JSON.stringify(faces[i]));
    
      var x = faces[i];
    
      image.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
    }

    image.save('./out.jpg');
  });
});
