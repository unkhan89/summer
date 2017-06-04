
//
// BGR reference for colors
//

var COLOR_WHITE = {
  'base' : [255, 255, 255]
};

var COLOR_BLACK = {
  'base' : [0, 0, 0]
};

var COLOR_BLUE  = {
  'base' : [255, 0, 0],
  'lowerBound' : [110, 100, 100],
  'upperBound' : [130, 255, 255]
};     

var COLOR_GREEN =  {
  'base':  [0, 255, 0],           
  'lowerBound': [50, 100, 100],    
  'upperBound': [70, 255, 255]
};

var COLOR_RED  = {
  'base' : [0, 0, 255],
  'lowerBound' : [0, 100, 100],
  'upperBound' : [10, 255, 255]
};  

var COLOR_YELLOW = {
  'base' : [0, 255, 255],
  'lowerBound' : [20, 145, 145],
  'upperBound' : [40, 255, 255]
};

var COLOR_ORANGE = {
  'base' : [0, 165, 255],
  'lowerBound' : [5, 135, 135],
  'upperBound' : [25, 255, 255]
};



var cv = require('opencv');

// console.log('CV module: ');

// console.dir(cv);

console.log('OpenCV version: ' + cv.version);

//
// opencv.readImage(path, callback(error, imageObject))
// Opens/reads an image from disk
//
cv.readImage('./checkers.jpg', function(err, originalImage) {


///////////////////////////////////////////////////////////////////////////////////////////// IMAGE

  //
  // image.width()
  // image.heigth()
  // Returns the image width and height
  //
  console.log('Image width: ' + originalImage.width());
  console.log('Image heigth: ' + originalImage.height());

  //
  // image.copy()
  // Returns a new image that is a copy
  //
  var image = originalImage.copy();  


  //
  // image.convertGrayscale()
  // Converts image to grayscale
  //
  // image.convertGrayscale();
  

  //
  // image.canny(lowThreshold, highThreshold)
  // Edge detector: converts image to black and white with edges highlighted
  // Increasing high threshold decreases the number of edges 
  //
  // image.canny(10, 500)


  //
  // image.dilate(intensity)
  // Thinkens edges
  //
  // image.dilate(2);


  //
  // matrix.addWeighted(image1, dobule, image2, double)
  // Draws image2 on top of image 1
  // 
  // var result = new cv.Matrix(image1.width(), image1.height());
  // result.addWeighted(image1, 0.7, image2, 0.9);
  // result.save('./tmp/result.png');

  //
  // image.cvtColor(colorSpaceOperation);
  // Converts an image from one color space to another, images by default are in BGR
  // Operations:
  //    CV_BGR2GRAY
  //    CV_BGR2HSV
  //    CV_BGR2RGB  
  //
  image.cvtColor('CV_BGR2HSV'); 

  //
  // image.inRange(lowerThreshold, upperThreshold)
  // Filters out colors not in range
  // Where thresholds are BGR colors as an array of 3 integers (0 to 256?)
  // BGR image needs to be first converted to HSV
  //
  // image.inRange(COLOR_YELLOW.lowerBound, COLOR_YELLOW.upperBound);
  // image.dilate(10);





  // temp testing //////////////////////////////////////////////////////////////////////////////////

  image.inRange([8, 143, 102], [30, 240, 213]); // yellow chess pieces
  image.dilate(25);

  console.log('');

  // var mat = new cv.Matrix(image.height(), image.width());
  // var buf = Buffer(image.height(), image.width());
  // buf.fill(100);
  // mat.put(buf);

  var pixelsChanged = 0;

  for(var i = 0; i < image.width(); i++) {

    for(var j = 0; j < image.height(); j++) {

      var cellPrefix = '(' + i + ', ' + j + ') ';

      if(image.pixel(j, i) !== 0) {

        // console.log(cellPrefix + image.pixel(i, j));

        image.set(j, i, null, 0);

        pixelsChanged++;
      }
    }

    if(i == image.width()-1) {
      
      console.log('DONE iterating pixels, changed ' + pixelsChanged + ' of ' + (image.width()*image.height()) );
    }
  }

  console.log('Setting up window');

  // image.set(100, 100, [255, 255, 255], 255);  
  // var guiWindow2 = new cv.NamedWindow('OpenCV Test | Modified Image');    
  setTimeout(function() {
  //   guiWindow2.show(image);
  //   guiWindow2.blockingWaitKey(0, 10000);
  image.save('/home/ukhan/workspace/summer/node_modules/opencv/examples/tmp/checkers.jpg');
  
  }, 10000);

  

  // console.log(buf);

  // mat.put(buf);


  // var rowNumber = 2238;
  // console.log(image.pixelRow(rowNumber));


  // 
  // console.log('Cells in row ' + rowNumber + ': ' + image.row(rowNumber).length);
  // image.row(rowNumber).forEach(function(cell, index) {
  //   // if(cell != 0) {
  //     console.log('\n----------------------------------------------- ' + index);
  //     console.log(typeof(cell));
  //     console.log(JSON.stringify(cell));
  //     console.dir(cell);
  //     console.log(cell);    
  //   // }
  // });


  // var imageData = '';
  // for(var i = 0; i < image.height(); i++) {
  //   var rowPrefix = '(' + i + ') ';
  //   var rowData = rowPrefix;
  //   image.row(i).forEach(function(cell) {
  //     if(cell != 0) {
  //       rowData += cell;
  //     }
  //   });
  //   if(rowData != rowPrefix) {
  //     console.log(rowData);  
  //   }
  // }




  // var rowData = '';
  // image.row(1).forEach(function(row) {
  //   rowData += row;
  // });
  // console.log('row data: ' + rowData);
  




  // end of temp testing ///////////////////////////////////////////////////////////////////////////



  // 
  // image.erode()
  // TODO


  //  
  // image.houghLinesP();
  // TODO


  //
  // image.detectObject('pathToXMLSpec', options, callback(error, detectedObjects))
  // TODO
  // 
  // image.detectObject("../data/hogcascade_cars_sideview.xml", {}, function(err, cars) {}); 
  

  //
  // iamge.save(pathAndFileName)
  // Saves an image to disk
  //
  // image.save('./output.jpg');



////////////////////////////////////////////////////////////////////////////////////////// Contours

  
  //
  // image.findContours()
  // Converts image and returns an iterable collection of contours found on the image
  //
  // var contours = image.findContours();
  // console.log('Found ' + contours.size() + ' contours');
  

  //
  // contours.area(index)
  // Returns the area of an individual contour in a contours collection
  //
  // console.log('Contour area: ' + contours.area(0));



  //
  // contours.arcLength(index, unknownBoolean)
  // Returns the arc length of an individual contour in a contours collection
  //
  // var arcLength = contours.arcLength(0, true);
  // console.log('Contour arc length: ' + arcLength);


  // 
  // Shape detecting (from detect-shapes example), TBD: 
  //
  // for(var i = 0; i < contours.size(); i++) {
  // var arcLength = contours.arcLength(i, true);
  // console.log('Contour arc length: ' + arcLength);
  // contours.approxPolyDP(i, 0.01 * arcLength, true);
  // switch(contours.cornerCount(i)) {
  //     case 3:
  //       image.drawContour(contours, i, GREEN);
  //       break;
  //     case 4:
  //       image.drawContour(contours, i, RED);
  //       break;
  //     default:
  //       image.drawContour(contours, i, WHITE);
  //   }
  // }

 /////////////////////////////////////////////////////////////////////////////////////////////// UI


  //
  // cv.NamedWindow(windowName, unknownInt);
  // Creates a GUI window
  //
  // var guiWindow1 = new cv.NamedWindow('OpenCV Test | Original Image');
  // var guiWindow2 = new cv.NamedWindow('OpenCV Test | Modified Image');
  // var guiWindow3 = new cv.NamedWindow('OpenCV Test | New Matrix/Image');
  
  // console.dir(guiWindow1);
  // for(var prop in guiWindow1) {
  //   console.log('' + prop);
  //   console.log('' + guiWindow1[prop])
  // }
  
  // //
  // // NamedWindow.show(imageObject);
  // // Shows an image in a window
  // guiWindow1.show(originalImage);
  // guiWindow2.show(image);
  // guiWindow3.show(mat);

  // //
  // // guiWindow.blockingWaitKey(unknownInt, timeoutMs);
  // // Blocks and waits until timeout in miliseconds
  // //
  // guiWindow1.blockingWaitKey(0, 5000);
  // guiWindow2.blockingWaitKey(0, 5000);
  // guiWindow3.blockingWaitKey(0, 5000);

});



//////////////////////////////////////////////////////////////////////////////////////////// Camera


//
// cv.VideoCapture(cameraInterfaceNumber)
// Creates a new camera object
//
// var camera = new cv.VideoCapture(0);


//
// camera.read(callback(error, image))
// Reads an image from a camera instance
//
// camera.read(function(error, image) {});
