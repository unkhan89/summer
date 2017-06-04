
module.exports = {
  'logging' : {
  
    'logLevel' : 'trace',
  }, 
  'port' : 3000,
  'psc' : {
    'enableStrict' : false,
    'servos' : [            // calibration for current project
                            // perspective: directly behind arm
      { 
        'id' : 0,           // rotational base
        'max' : 1120,       // right
        'default' : 690,    // center, facing forward
        'min' : 280         // left
      },
      {
        'id' : 1,           // shoulder axis
        'max' : 1100,       // almost horizontal, TODO might be too harsh to hold weigth at this postision 
        'default' : 730,    // vertical
        'min' : 690         // slight lean back from verticle
      },
      {
        'id' : 2,           // elbow axis
        'max' : 1050,       // verticle 
        'default' : 480,    // 
        'min' : 280         // facing down
      }
    ]
  },
  'l293d' : {
    'gpioPin1' : 18,
    'gpioPin2' : 23
  }
};
