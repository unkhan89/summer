
var fs = require('fs'), 
    path = require('path'), 
    express = require('express'), 
    http = require('http'), 
    async = require('async'), 
    url = require('url'), 
    context,
    config,
    log,
    app,
    server,
    cv = require('opencv'), 
    windowName = 'OpenCV Test',
    windowBlockWaitKeyMs = 50,
    originalWindow,
    hsvWindow,
    modifiedWindow, 
    originalImage,
    modifiedImage,
    // INPUT_MEDIA = __dirname + '/sampleImages/chess/24.jpg',      // either path to an image or 'camera'
                   // ../../docs/examples-opencv-py/
    INPUT_MEDIA = '../../docs/examples-opencv-py/checkers1.jpg',
    // INPUT_MEDIA = 'camera',
    refreshIntervalImages,                                          // interval object placeholder
    refreshIntervalImagesMs = 20,                                   // how refreshInterval should run
    DIALATION = 1,
    EROSION = 0,
    l1 = 0, l2 = 0, l3 = 0, u1 = 255, u2 = 255, u3 = 255,           // BGR lower and upper bounds for color filtering
    cameraObj,
    refreshIntervalVideoMs = 100;
  

function init(contextObj, callback) {

  context = contextObj;
  
  log = context.log;

  log.trace('Initializing controller');
  
  app = context.app = express();
  app.disable('etag');
  app.use(rawBodyParser);
  app.use(express.static('./html'));

  server = context.server = http.createServer(app);

  app.all('*', function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Content-Type", "application/json");
      
    next();
  });


  app.get('/setBounds', function(req, res) {

    if(isNaN(req.query.lower1) || isNaN(req.query.lower2) || isNaN(req.query.lower3) || 
       isNaN(req.query.upper1) || isNaN(req.query.upper2) || isNaN(req.query.upper3)) {

      sendBadRequest(res, 'Invalid bound values given: ' + JSON.stringify(req.query));
      return;
    }

    l1 = parseInt(req.query.lower1);
    l2 = parseInt(req.query.lower2);
    l3 = parseInt(req.query.lower3);
    u1 = parseInt(req.query.upper1);
    u2 = parseInt(req.query.upper2);
    u3 = parseInt(req.query.upper3);

    if(INPUT_MEDIA !== 'camera') {

      refreshImages();
    }

    sendText(res, 'OK');
  });


  app.get('/setDialation', function(req, res) {

    if(!req.query.dialation || isNaN(req.query.dialation)) {

      sendBadRequest(res, 'Invalid dialation value given: ' + req.query.dialation);
      return;
    }

    DIALATION = parseFloat(req.query.dialation);

    if(INPUT_MEDIA !== 'camera') {

      refreshImages();
    }

    sendText(res, 'OK');
  });


  app.get('/setErosion', function(req, res) {

    if(!req.query.erosion || isNaN(req.query.erosion)) {

      sendBadRequest(res, 'Invalid erosion value given: ' + req.query.erosion);
      return;
    }

    EROSION = parseFloat(req.query.erosion);

    if(INPUT_MEDIA !== 'camera') {

      refreshImages();
    }

    sendText(res, 'OK');
  });

  app.get('*', function(req, res) {

    sendNotFoundError(res);
  });



  try {

    originalWindow = new cv.NamedWindow(windowName + ' | Original');
    
    hsvWindow = new cv.NamedWindow(windowName + ' | HSV');
    
    modifiedWindow = new cv.NamedWindow(windowName + ' | Modified');
    
    if(INPUT_MEDIA == 'camera') {

      cameraObj = new cv.VideoCapture(0);
    
      refreshVideo();
      
      callback();  
    
    } else {    // load a static image

      cv.readImage(INPUT_MEDIA, function(err, readImage) {
      
        originalImage = readImage;
      
        refreshImages();
      
        callback();
      });

    }

  } catch (error) {

    log.fatal('Unable to setup opencv windows/images/camera', error);
  }
}


function refreshVideo() {

  log.trace('refreshVideo()');
  log.trace('> bounds: ' + l1 + ', ' + l2 + ', ' + l3 + ', ' + u1 + ', ' + u2 + ', ' + u3);
  log.trace('> erosion: ' + EROSION);
  log.trace('> dialation: ' + DIALATION);

  var i = 1;

  setInterval(function() {
    
    // log.trace('Interval, camera.read()');  

    cameraObj.read(function(error, imageFromCamera) {
    
      console.time('' + i);

      if (error) {
      
        log.error('Error reading image from camera', error);
      }
      
      if(imageFromCamera.size()[0] > 0 && imageFromCamera.size()[1] > 0) { 

        originalImage = imageFromCamera;

        originalWindow.show(originalImage);

        originalWindow.blockingWaitKey(0, windowBlockWaitKeyMs);

        modifiedImage = originalImage.copy();

        modifiedImage.cvtColor('CV_BGR2HSV'); 

        hsvWindow.show(modifiedImage);

        hsvWindow.blockingWaitKey(0, windowBlockWaitKeyMs);

        modifiedImage.inRange([l1, l2, l3], [u1, u2, u3]);

        modifiedImage.erode(EROSION);

        modifiedImage.dilate(DIALATION);

        modifiedWindow.show(modifiedImage);

        modifiedWindow.blockingWaitKey(0, windowBlockWaitKeyMs);
        
        console.timeEnd('' + i);

        i++;
            
      } else {

        log.warn('No image to display in window');
      }
  
    });
  
  }, refreshIntervalVideoMs);
}


function refreshImages() {

  log.trace('refreshImages()');
  log.trace('> bounds: ' + l1 + ', ' + l2 + ', ' + l3 + ', ' + u1 + ', ' + u2 + ', ' + u3);
  log.trace('> erosion: ' + EROSION);
  log.trace('> dialation: ' + DIALATION);
  
  originalWindow.show(originalImage);

  modifiedImage = originalImage.copy();

  modifiedImage.cvtColor('CV_BGR2HSV'); 

  hsvWindow.show(modifiedImage);

  modifiedImage.inRange([l1, l2, l3], [u1, u2, u3]);

  modifiedImage.erode(EROSION);

  modifiedImage.dilate(DIALATION);

  modifiedWindow.show(modifiedImage);

  clearInterval(refreshIntervalImages);

  refreshIntervalImages = setInterval(function() {
    
      originalWindow.blockingWaitKey(0, windowBlockWaitKeyMs);

      hsvWindow.blockingWaitKey(0, windowBlockWaitKeyMs);
      
      modifiedWindow.blockingWaitKey(0, windowBlockWaitKeyMs);
    
  }, refreshIntervalImagesMs);
}


function sendText(res, text) {

  res.writeHead(200, {
    'Content-Type' : 'text/html'
  });

  res.end(text);
}


function sendBadRequest(res, errorMessage) {

  res.status(400).jsonp({'error' : errorMessage});
}


function sendServerError(res, errorMessage) {

  res.status(500).jsonp({'error' : errorMessage});
}


function sendNotFoundError(res) {

  res.status(404).jsonp({'error' : 'not found'});
}


function rawBodyParser(req, res, next) {

  var data = '';
  
  req.setEncoding('utf8');
  
  req.on('data', function(chunk) {
  
    data += chunk;
  });
  
  req.on('end', function() {
  
    req.rawBody = data;
    
    next();
  });
}


module.exports = {
  init : init
};
