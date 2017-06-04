
var log = require('../../lib/logger');

log.init({'logLevel' : 'trace'});

log.info('Hello world');

var cv = require('opencv');

log.debug('CV module: ');

console.dir(cv);


cv.readImage('./aspen_team.jpg', function(err, image) {

  log.debug('image object: ');

  console.dir(image);
  

});


// try {

//   var camera = new cv.VideoCapture(0);
  
//   var window = new cv.NamedWindow('Video', 0)
  
//   setInterval(function() {
  
//     camera.read(function(error, image) {
  
//       if (error) throw error;
  
//       console.log(image.size())
  
//       if (image.size()[0] > 0 && image.size()[1] > 0) { //  check if you acturally read an image? 

//         window.show(image);
//       }
  
//       window.blockingWaitKey(0, 50);
  
//     });
  
//   }, 20);
  
// } catch (error) {

//   console.log("Couldn't start camera:", e)
// }