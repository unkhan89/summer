
var Gpio = require('pigpio').Gpio,
    m1 = new Gpio(18, {mode: Gpio.OUTPUT}), // logical pin number
    m2 = new Gpio(23, {mode: Gpio.OUTPUT}),
    //pulseWidth = 500,
    dutyCycle = 0,
    increment = 1;

m1.pwmFrequency(50);
m2.pwmFrequency(50);

m1.pwmWrite(dutyCycle);
m2.pwmWrite(dutyCycle);

//m1.servoWrite(pulseWidth);
//m2.servoWrite(pulseWidth);


setInterval(function () {
  
  // console.log('Setting pulse width ' + pulseWidth);

  console.log('Setting duty cycle ' + dutyCycle);  

  try {

  m1.pwmWrite(dutyCycle);

  //  m1.servoWrite(pulseWidth);

  // pulseWidth += increment;

  //if (pulseWidth >= 2000) {

  //  increment = -100;

  //} else if (pulseWidth <= 1000) {

  //  increment = 100;
  //}

  } catch(error) {

    console.log('Error:' + JSON.stringify(error) );

  }

  //pulseWidth += increment;

  dutyCycle += increment;

}, 100);

