
var Gpio = require('pigpio').Gpio,
    m1 = new Gpio(18, {mode: Gpio.OUTPUT}), // logical pin number
    m2 = new Gpio(23, {mode: Gpio.OUTPUT}),
    dutyCycle = 0,
    increment = 1;

m1.pwmFrequency(50);
m2.pwmFrequency(50);

m1.pwmWrite(dutyCycle);
m2.pwmWrite(dutyCycle);

setInterval(function () {

  console.log('Setting duty cycle ' + dutyCycle);

  try {

  m1.pwmWrite(dutyCycle);

  
  } catch(error) {

    console.log('Error:' + JSON.stringify(error) );
  }

  dutyCycle += increment;

}, 100);