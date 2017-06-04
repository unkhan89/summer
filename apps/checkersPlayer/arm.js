
var async = require('async'),
    servoController = require('../../lib/pscDriver'),
    motorController = require('../../lib/l293dDriver'),
    GRIPPER_DURATION_MS = 120,
    STABLE_TIMEOUT_MS = 5000,
    context,
    config,
    log;

    
var model = {
  'base' : {
    'id' : 0,
    'default' : -1,
    'current' : -1,
  },
  'shoulder' : {
    'id' : 1,
    'default' : -1,
    'current' : -1,
  },
  'elbow' : {
    'id' : 2,
    'default' : -1,
    'current' : -1,
  },
  'hand' : {
    'isOpen' : true 
  }
};


function init(contextObj, callback) {

  context = contextObj;

  log = context.log;

  config = context.config;

  log.trace('Arm init() config: \n' + JSON.stringify(config));

  servoController.init(context, function(error) {

    if(error) {
      callback(new Error('Failed to initialize PSC: ' + error));
      return;
    } 
    
    motorController.init(context, function(error) { 

      if(error) {
        callback(new Error('Failed to initialize L293D Driver: ' + error));
        return;
      }

      config.psc.servos.forEach(function(servo) {

        switch(servo.id) {

          case 0:
            model.base.default = servo.default;
            break;
          case 1:
            model.shoulder.default = servo.default;
            break;
          case 2:
            model.elbow.default = servo.default;
            break;
          default:
            callback(new Error('Unexpected servo in config: ' + JSON.stringify(servo)));
            return;
        }
      });

      //log.warn('IGNORING setting default positions for now!');
      setDefaultPosition(function(error) {

        if(error) {
          callback(new Error('Failed to set arm to default position: ' + error));
          return;
        } 

        callback();
      });
    });
  });
}


function setDefaultPosition(callback) {

  setShoulder(model.shoulder.default, function(error) {

    setElbow(model.elbow.default, function(error) {

      setBase(model.base.default, function(error) {

        openHand(function(error) {

          callback(error);

        }, true);
      });
    });
  });
}


function setBase(newPosition, callback) {

  servoController.setServoPosition(model.base.id, newPosition, function(error) {
    
    if(error) {
      
      log.error('Error returned from servo controller', error);
      callback(error);

    } else {

      model.base.current = newPosition;
      
      callback();
    }    
  });
}


function setShoulder(newPosition, callback) {

  servoController.setServoPosition(model.shoulder.id, newPosition, function(error) {
    
    if(error) {
     
      log.error('Error returned from servo controller', error);
      callback(error);
     
    } else {

      model.shoulder.current = newPosition;
      
      callback();
    }    
  });
}


function setElbow(newPosition, callback) {

  servoController.setServoPosition(model.elbow.id, newPosition, function(error) {
  
    if(error) {
     
      log.error('Error returned from servo controller', error);
      callback(error);
     
   } else {

      model.elbow.current = newPosition;
      
      callback();
   }    
  });
}


function openHand(callback, ignoreState) {

  if(ignoreState === true || model.hand.isOpen === false) {

    log.trace('Arm: opening hand');

    motorController.rotateClockwise(GRIPPER_DURATION_MS, function(error) {

      if(error) {
      
        log.warn('Error opening hand', error);
        motorController.stopMotor(function() {});      
        callback(error);

      } else {

        model.hand.isOpen = true;

        callback();
      }    
    }); 

  } else {

    log.warn('Hand already open, caller expecting to open it');

    callback();
  }
}


function closeHand(callback) {

  if(model.hand.isOpen === true) {
    
    log.debug('Arm: Closing hand');

    motorController.rotateCounterClockwise(GRIPPER_DURATION_MS, function(error) {

      if(error) {
      
        log.warn('Error closing hand', error);
        motorController.stopMotor(function() {});      
        callback(error);

      } else {

        model.hand.isOpen = false;

        callback();
      }
    });

  } else {

    log.warn('Hand already closed, caller expecting to close it');

    callback();
  }
}


function getModel() {

  return model;
}


/*
 * Functions specifically for playing checkers:
 */


var ELBOW_BUFFER = 100;

// Moves a piece from one position to another per coordinates in config,
// where moveObj is similar to the following:
// {
//    'from' : 'A4',
//    'to' : 'OUT'
// }
//
// NOTE: Starting position of arm is expected to be default. 
//       For collision safety, ELBOW_BUFFER is applied to elbow before and after base and shoulder is moved.
//       Gripper/hand is expected to already be open.
//       In case of any error, default position shall be fired and callback called.
//
function movePiece(moveObj, callback) {

  log.info('Moving piece from ' + moveObj.from + ' to ' + moveObj.to);

  if(!config.board.hasOwnProperty(moveObj.from) || !config.board.hasOwnProperty(moveObj.to)) {

    callback(new Error('Unknown positions given: ' + JSON.stringify(moveObj)));
    return;
  }

  var from = config.board[moveObj.from];

  var to = config.board[moveObj.to];

  if(!from.base || !from.shoulder || !from.elbow) {

    callback(new Error('No config found for cell ' + moveObj.from));
    return;
  }

  if(!to.base || !to.shoulder || !to.elbow) {

    callback(new Error('No config found for cell ' + moveObj.to));
    return;
  }

  log.debug('Moving piece from ' + JSON.stringify(from) + ' to ' + JSON.stringify(to));


  // first move base:

  setBase(from.base, function(error) {

    if(error) {

      log.error('Error returned from moving arm base', error);
      setDefaultPosition();
      callback(new Error('Unable to execute move ' + JSON.stringify(moveObj)));

    } else {

      // move elbow to safe position:

      var safeElbowPosition = from.elbow + ELBOW_BUFFER;

      log.debug('Moving elbow to ' + safeElbowPosition);

      setElbow(safeElbowPosition, function(error) {

        if(error) {

          log.error('Error returned from moving arm elbow to safe position', error);
          setDefaultPosition();
          callback(new Error('Unable to execute move ' + JSON.stringify(moveObj)));

        } else {

          // move shoulder: 

          setShoulder(from.shoulder, function(error) {

            if(error) {

              log.error('Error returned from moving arm shoulder', error);
              setDefaultPosition();
              callback(new Error('Unable to execute move ' + JSON.stringify(moveObj)));

            } else {

              // move elbow to a gripping position:

              setElbow(from.elbow, function(error) {

                if(error) {

                  log.error('Error returned from moving arm elbow', error);
                  setDefaultPosition();
                  callback(new Error('Unable to execute move ' + JSON.stringify(moveObj)));

                } else {

                  // close gripper/hand: 

                  closeHand(function(error) {

                    if(error) {

                      log.error('Error returned from closing arm hand/gripper', error);
                      setDefaultPosition();
                      callback(new Error('Unable to execute move ' + JSON.stringify(moveObj)));

                    } else {                    

                      // move elbow to safe position again:

                      setElbow(safeElbowPosition, function(error) {

                        if(error) {

                          log.error('Error returned from moving arm elbow to safe position', error);
                          setDefaultPosition();
                          callback(new Error('Unable to execute move ' + JSON.stringify(moveObj)));

                        } else {

                          // move base to target position:

                          if(moveObj.to === 'OUT') {
                
                            // TODO
                          }                          
                
                          setBase(to.base, function(error) {

                            if(error) {

                              log.error('Error returned from moving arm base', error);
                              setDefaultPosition();
                              callback(new Error('Unable to execute move ' + JSON.stringify(moveObj)));

                            } else {

                              setTimeout(function() {   // cheap arm shakes when extended, allow some time for shake to settle after base move

                              // move shoulder to target position:

                              var toMove = to.shoulder - 15;

                              if(moveObj.to == 'OUT') { toMove = to.shoulder; };

                              setShoulder(toMove , function(error) {

                                if(error) {

                                  log.error('Error returned from moving arm shoulder', error);
                                  setDefaultPosition();
                                  callback(new Error('Unable to execute move ' + JSON.stringify(moveObj)));

                                } else {

                                  // move elbow to target position:
  
                                  var toMove = to.elbow - 15;

                                  if(moveObj.to == 'OUT') { toMove = to.elbow; };                                  

                                  setElbow(toMove, function(error) {

                                    if(error) {

                                      log.error('Error returned from moving arm elbow', error);
                                      setDefaultPosition();
                                      callback(new Error('Unable to execute move ' + JSON.stringify(moveObj)));

                                    } else {

                                      // open hand/gripper:

                                      openHand(function(error) {

                                        if(error) {

                                          log.error('Error returned from opening arm hand/gripper', error);
                                          setDefaultPosition();
                                          callback(new Error('Unable to execute move ' + JSON.stringify(moveObj)));

                                        } else {

                                          // move elbow to safe position again: 

                                          setElbow(safeElbowPosition, function(error) {

                                            if(error) {

                                              log.error('Error returned from moving arm elbow to safe position', error);
                                              setDefaultPosition();
                                              callback(new Error('Unable to execute move ' + JSON.stringify(moveObj)));

                                            } else {

                                              log.info('DONE performing move ' + JSON.stringify(moveObj) + ', setting to default position');

                                              setDefaultPosition(function() {
                                                
                                                callback();
                                              
                                              });
                                            }
                                          });
                                        }
                                      });
                                    }
                                  });
                                }
                              }); }, STABLE_TIMEOUT_MS);
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
}


module.exports = {
  init : init,
  setDefaultPosition : setDefaultPosition,
  setBase : setBase,
  setShoulder : setShoulder,
  setElbow : setElbow,
  openHand : openHand, 
  closeHand : closeHand,
  isHandOpen : model.hand.isOpen, 
  getModel : getModel,
  movePiece : movePiece
};
