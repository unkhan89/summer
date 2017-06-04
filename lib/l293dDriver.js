
var context,
    log,
    Gpio = require('pigpio').Gpio,
    gpioPin1 = 18,          // logical pin number
    gpioPin2 = 23,          // logical pin number
    m1,                     // gpio pwm output to pin 1 (motor input 1)
    m2,                     // gpio pwm output to pin 2 (motor input 2)
    frequency = 50,         // frequency in hertz 
    STOP_DUTY_CYCLE = 0,    // portion (0 to 256) of freq signal should be high, hence 0 = no signal
    ROTATE_DUTY_CYCLE = 235,// acceptable duty cycle (speed) for rotating motor 
    ioDelayMs = 100;

    
function init(contextObj, callback) {

  context = contextObj,
  log = context.log;

  log.trace('l293dDriver.init()');

  if(context.config.l293d.gpioPin1 && !isNaN(context.config.l293d.gpioPin1)) {

    gpioPin1 = context.config.l293d.gpioPin1;
  }

  if(context.config.l293d.gpioPin2 && !isNaN(context.config.l293d.gpioPin2)) {

    gpioPin2 = context.config.l293d.gpioPin2;
  }

  if(context.config.l293d.frequency && !isNaN(context.config.l293d.frequency)) {

    frequency = context.config.l293d.frequency;
  }

  try {

    m1 = new Gpio(gpioPin1, {mode: Gpio.OUTPUT}), 
    m2 = new Gpio(gpioPin2, {mode: Gpio.OUTPUT}),    

    m1.pwmFrequency(frequency);
    m2.pwmFrequency(frequency);

    stopMotor(function(error) {

      if(error) {
       
        log.error('Error setting initial stop on motor: ' + error, error);
        callback(error);
        return;
      
      } else {
                
        log.trace('Done setting up l293d driver');

        callback();
      }

    });

  } catch(error) {

    log.error('Error setting up gpio pins for pwm: ' + error, error);
    callback(error);
    return;
  }  
}


function setDutyCycle(motorInputPin, dutyCycle, callback) {
  
  log.trace('setDutyCycle() motorInputPin: ' + motorInputPin + ', dutyCycle: ' + dutyCycle);

  if(isNaN(dutyCycle) || dutyCycle < 0 || dutyCycle > 256) {

    callback(new Error('Invalid duty cycle given: ' + dutyCycle));
    return;
  }
  
  try {
    switch(motorInputPin) {
    
      case 1:

        m1.pwmWrite(dutyCycle);
        break;
    
      case 2: 
      
        m2.pwmWrite(dutyCycle);
        break;
    
      default:
        callback(new Error('Cannot set duty cycle on unknown motor output: ' + motorInputPin));
    }

  } catch(error) {
    
    var message = 'Error setting duty cycle';       
    log.warn(message, error);
    callback(new Error(message));
    return;
  }

  setTimeout(function() {

    callback();
  
  }, ioDelayMs);
}


function stopMotor(callback) {

  log.trace('stopMotor()');
  
  try {

    m1.pwmWrite(STOP_DUTY_CYCLE);
    m2.pwmWrite(STOP_DUTY_CYCLE);
  
  } catch(error) {
   
    var message = 'Error setting duty cycle';
    log.warn(message, error);
    callback(new Error(message));
    return;
  }

  callback();
}

function rotateClockwise(duration, callback) {

  rotateMotor(1, duration, callback);
}

function rotateCounterClockwise(duration, callback) {

  rotateMotor(2, duration, callback);
}

function rotateMotor(motorInputPin, duration, callback) {

  log.trace('[L293dDriver] rotateMotor() duration: ' + duration);

  if(isNaN(duration) || duration < 1) {  

    var message = 'rotateMotor() Invalid duration given: ' + duration;
    log.warn(message);
    callback(new Error(message));
    return;
  }

  if(motorInputPin !== 1 && motorInputPin !== 2) {
    
    var message = 'Invalid motor input pin given: ' + motorInputPin;
    log.warn(message);
    callback(new Error(message));
    return;
  }

  log.debug('Rotating clockwise for ' + duration + 'ms' );

  stopMotor(function(error) {

    if(error) {

      log.warn('Error stopping motors', error);
      callback(error);
      return;
    }

    setTimeout(function() {
 
      setDutyCycle(motorInputPin, ROTATE_DUTY_CYCLE, function(error) {

        if(error) {

          log.warn('Error returned from setting duty cycle', error);
          stopMotor(function() {});
          callback(error);
          return;
        }

        setTimeout(function() {

          stopMotor(function() {});

          callback();
    
        }, duration);
      });
    }, ioDelayMs);
  });
}
  

module.exports = {
  init : init,
  rotateClockwise : rotateClockwise,
  rotateCounterClockwise : rotateCounterClockwise,
  stopMotor : stopMotor
}
