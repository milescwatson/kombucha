import math
import sys
import time
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BCM)

GPIO.setwarnings(False)

RELAY_1 = 12
RELAY_2 = 16
RELAY_3 = 20

def controlRelay():
    gpioMapping = {0:12, 1:16, 2:20, 3:21}
    if(len(sys.argv) < 3):
        #print('invalid arg number')
        return 0
    try:
        relay = int(sys.argv[1])
        state = int(sys.argv[2])
        relayBoard = gpioMapping[relay]

    except Exception as e:
        return -1
    
    #print('channel = ', relayBoard)
    #print('state = ', state)
    GPIO.setup(relayBoard, GPIO.OUT)

    GPIO.output(relayBoard, state)
    
    if(state == 0):
        GPIO.cleanup()
    return 0

print(controlRelay())
