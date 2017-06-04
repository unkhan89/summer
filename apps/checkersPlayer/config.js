
module.exports = {
  'logging' : {
    'logLevel' : 'trace'
  },
  'port' : 3000,
  'cvControllerPort' : 5000,
  'psc' : {
    'enableStrict' : true,
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
        'default' : 280,    // 
        'min' : 280         // facing down
      }
    ]
  },
  'l293d' : {
    'gpioPin1' : 18,
    'gpioPin2' : 23
  }, 
  'board' : {
    'OUT': {
      'base' : 300,
      'shoulder' : 760,
      'elbow' : 340
    }, 
    'A2': {
      'base' : null,
      'shoulder' : null,
      'elbow' : null
    }, 
    'A4': {
      'base' : 530,
      'shoulder' : 910,
      'elbow' : 620
    },
    'A6': {
      'base' : 500,
      'shoulder' : 870,
      'elbow' : 530
    },
    'A8' : {
      'base' : 450,
      'shoulder' : 850,
      'elbow' : 440
    },
    'B1' : {
      'base' : null,
      'shoulder' : null,
      'elbow' : null
    },
    'B3' : {
      'base' : null,
      'shoulder' : null,
      'elbow' : null
    },
    'B5' : {
      'base' : 540,
      'shoulder' : 870,
      'elbow' : 550
    },
    'B7' : {
      'base' : 510,
      'shoulder' : 820,
      'elbow' : 440
    },
    'C2' : {
      'base' : null,
      'shoulder' : null,
      'elbow' : null
    },
    'C4' : {
      'base' : 590,
      'shoulder' : 880,
      'elbow' : 580
    },
    'C6' : {
      'base' : 560,
      'shoulder' : 830,
      'elbow' : 490
    },
    'C8' : {
      'base' : 520,
      'shoulder' : 830,
      'elbow' : 390
    },
    'D1' : {
      'base' : null,
      'shoulder' : null,
      'elbow' : null
    },
    'D3' : {
      'base' : null,
      'shoulder' : null,
      'elbow' : null
    },
    'D5' : {
      'base' : 610,
      'shoulder' : 860,
      'elbow' : 520
    },
    'D7' : {
      'base' : 600,
      'shoulder' : 800,
      'elbow' : 410
    },
    'E2' : {
      'base' : null,
      'shoulder' : null,
      'elbow' : null
    },
    'E4' : {
      'base' : 660,
      'shoulder' : 870,
      'elbow' : 560
    },
    'E6' : {
      'base' : 650,
      'shoulder' : 820,
      'elbow' : 450
    },
    'E8' : {
      'base' : 630,
      'shoulder' : 820,
      'elbow' : 370
    },
    'F1' : {
      'base' : null,
      'shoulder' : null,
      'elbow' : null
    },
    'F3' : {
      'base' : null,
      'shoulder' : null,
      'elbow' : null
    },
    'F5' : {
      'base' : 690,
      'shoulder' : 850,
      'elbow' : 510
    },
    'F7' : {
      'base' : 690,
      'shoulder' : 790,
      'elbow' : 390
    },
    'G2' : {
      'base' : null,
      'shoulder' : null,
      'elbow' : null
    },
    'G4' : {
      'base' : 720,
      'shoulder' : 870,
      'elbow' : 560
    },
    'G6':  {
      'base' : 730,
      'shoulder' : 840,
      'elbow' : 470
    },
    'G8' : {
      'base' : 760,
      'shoulder' : 830,
      'elbow' : 380
    },
    'H1' :  {
      'base' : null,
      'shoulder' : null,
      'elbow' : null
    },
    'H3' : {
      'base' : null,
      'shoulder' : null,
      'elbow' : null
    },
    'H5' : {
      'base' : 750,
      'shoulder' : 860,
      'elbow' : 540
    },
    'H7' : {
      'base' : 780,
      'shoulder' : 810,
      'elbow' : 420
    }
  }
};
