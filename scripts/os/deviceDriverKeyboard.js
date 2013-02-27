/* ----------------------------------
   DeviceDriverKeyboard.js
   
   Requires deviceDriver.js
   
   The Kernel Keyboard Device Driver.
   ---------------------------------- */

DeviceDriverKeyboard.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.
function DeviceDriverKeyboard()                     // Add or override specific attributes and method pointers.
{
    // "subclass"-specific attributes.
    // this.buffer = "";    // TODO: Do we need this?
    // Override the base method pointers.
    this.driverEntry = krnKbdDriverEntry;
    this.isr = krnKbdDispatchKeyPress;
    // "Constructor" code.
}

function krnKbdDriverEntry()
{
    // Initialization routine for this, the kernel-mode Keyboard Device Driver.
    this.status = "loaded";
    // More?
}

function krnKbdDispatchKeyPress(params)
{
    // Parse the params.    TODO: Check that they are valid and osTrapError if not.
    var keyCode = params[0];
    var isShifted = params[1];
    krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
    var chr = "";

    // Check to see if we even want to deal with the key that was pressed.
    if ( ((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
         ((keyCode >= 97) && (keyCode <= 123)) )   // a..z
    {
        // Determine the character we want to display.  
        // Assume it's uppercase...
        chr = String.fromCharCode(keyCode + 32);
        // ... then check the shift key and re-adjust if necessary.
        if (isShifted)
        {
            chr = String.fromCharCode(keyCode);
        }
        // TODO: Check for caps-lock and handle as shifted if so.
        _KernelInputQueue.enqueue(chr);
    }    
    else if ((keyCode >= 48) && (keyCode <= 57)) //digits
    {
        if(isShifted)
        {
                switch(keyCode)
                {
                    case 48: // 0
                        keyCode = 41; // )
                        break;
                    case 49: // 1
                        keyCode = 33; // !
                        break;
                    case 50: // 2
                        keyCode = 64; // @
                        break;
                    case 51: // 3
                        keyCode = 35; // #
                        break;
                    case 52: // 4
                        keyCode = 36; // $
                        break;
                    case 53: // 5
                        keyCode = 37; // %
                        break;
                    case 54: // 6  Doesn't work, not a part of ASCII
                        keyCode = 136; // ^
                        break;
                    case 55: // 7
                        keyCode = 38; // &
                        break;
                    case 56: // 8
                        keyCode = 42; // *
                        break;
                    case 57: // 9
                        keyCode = 40; // (
                }
        }
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr); 
    }
    
    else if ((keyCode == 32)||(keyCode == 13)||(keyCode == 8)) // space or enter or backspace
    {
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr);
    }
    else // anything else
    {
        if(isShifted)
        {
            switch(keyCode)
            {
                case 16: //shift, put in to avoid saying it isn't supported
                    break;
                case 188:
                    keyCode = 60; // <
                    break;
                case 190:
                    keyCode = 62; // >
                    break;
                case 191:
                    keyCode = 63; // ?
                    break;
                case 59:
                    keyCode = 58; // :
                    break;
                case 222:
                    keyCode = 34; // "
                    break;
                case 219:
                    keyCode = 123; // {
                    break;
                case 221:
                    keyCode = 125; // }
                    break;
                case 173:
                    keyCode = 95; // _
                    break;
                case 61:
                    keyCode = 43; // +
                    break;
                default:
                    krnTrace("Key code: " + keyCode + " is not supported");

            }
        }
        else
        {
            switch(keyCode)
            {
                case 188:
                    keyCode = 44; // ,
                    break;
                case 190:
                    keyCode = 46; // .
                    break;
                case 191:
                    keyCode = 47; // /
                    break;
                case 59:
                    keyCode = 59; // ;
                    break;
                case 222:
                    keyCode = 39; // '
                    break;
                case 219:
                    keyCode = 91; // [
                    break;
                case 221:
                    keyCode = 93; // ]
                    break;
                case 173: // Doesn't work, not a part of ASCII
                    keyCode = 196;//150; // -
                    break;
                case 61:
                    keyCode = 61; // =
                    break;
                default:
                    krnTrace("Key code: " + keyCode + " is not supported");
            }
        }
        
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr);
    }
    
}
