
var log = require('../../lib/logger');

log.init({'logLevel' : 'trace'});

log.info('Hello world');

var cv = require('opencv');

var delay = 0;

try {

  var camera = new cv.VideoCapture(1);
  
  var window = new cv.NamedWindow('Video', 0);
  
  setInterval(function() {
  
    camera.read(function(error, image) {
  
      if (error) throw error;
  
      console.log(image.size())
  
      if (image.size()[0] > 0 && image.size()[1] > 0) { //  check if you acturally read an image? 

        window.show(image);
      }
      
      window.blockingWaitKey(0, 20);


      
      delay++;

      if(delay == 200) {

        image.save('./checkers1.jpg');
        process.exit(0);
      } 

      
    });
  
  }, 20);
  
} catch (error) {

  console.log("Couldn't start camera:", error)
}