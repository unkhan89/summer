
import logging as log
import time
from pscDriver import PSC

global dev

if __name__ == "__main__":
    
    settings = {        
        'logging_level': log.DEBUG, 
        'flask_debug' : True,
        'http' : {
            'host' : "0.0.0.0",
            'port' : 80
        }, 
        'servo_setup' : []
    }

    log.basicConfig(level=settings['logging_level'], format='%(asctime)s | %(levelname)s | %(module)s:%(lineno)s | %(message)s')
    log.info('Hello')    
    
    global dev
    
    dev = PSC(log, settings['servo_setup'])

    dev.set_servo_position(0, 750)

    time.sleep(2)

    dev.set_servo_position(0, 900)

    time.sleep(2)

    dev.set_servo_position(0, 750)
  
    time.sleep(2)

    dev.set_servo_position(0, 500)

    time.sleep(2)

    dev.set_servo_position(0, 750)
    
    time.sleep(2)    


    # rotate_servo(0, "idle")            
    # rotate_servo(0, "clockwise")
    # rotate_servo(0, "counter_clockwise")

