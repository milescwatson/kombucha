import Adafruit_MCP3008
import math
import sys

def getF():
        if(len(sys.argv) < 2):
            #print('invalid argument')
            return 0

        channel = sys.argv[1]
        channel = int(channel)
        CLK  = 18
        MISO = 23
        MOSI = 24
        CS   = 25
        mcp = Adafruit_MCP3008.MCP3008(clk=CLK, cs=CS, miso=MISO, mosi=MOSI)

        #helper function
        try:
            isValid = True
            channel_value = mcp.read_adc(channel)
            if(channel_value < 10):
                isValid = False
            volts = (channel_value * 3.3) / 1024
            ohms = ((1/volts)*3300)-1000
            ohms = ohms * 10
            #print(ohms)
            #Simple
            #tempc = (7*(10**(-8)) * (ohms**2)) - (0.0038 * ohms) + 57.145
            #return tempc * 1.8 + 32
            #LOGi
            if(isValid):
                return ((-22.36) * (math.log(ohms))+ 231.32)*1.8+32
            else:
                return 0

        except Exception as e:
            #print(e)
            return 0

print(getF());
