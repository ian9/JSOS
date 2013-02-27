/* ------------
   Console.js

   Requires globals.js

   The OS Console - stdIn and stdOut by default.
   Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
   ------------ */

function Console()
{
    // Properties
    this.CurrentFont      = DEFAULT_FONT;
    this.CurrentFontSize  = DEFAULT_FONT_SIZE;
    this.CurrentXPosition = 0;
    this.CurrentYPosition = DEFAULT_FONT_SIZE;
    this.canvasHeight     = CANVAS.height;
    this.buffer = "";
    //this.storageBuffer = new Array();
    
    //this.scrollOffset = 0;
    
    // Methods
    this.init        = consoleInit;
    this.clearScreen = consoleClearScreen;
    this.resetXY     = consoleResetXY;
    this.handleInput = consoleHandleInput;
    this.putText     = consolePutText;
    this.deleteText  = consoleDeleteText;
    this.advanceLine = consoleAdvanceLine;
}

function consoleInit()
{
    consoleClearScreen();
    consoleResetXY();
}

function consoleClearScreen()
{
    DRAWING_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
}

function consoleResetXY()
{
    this.CurrentXPosition = 0;
    this.CurrentYPosition = this.CurrentFontSize;    
}

function consoleHandleInput()
{
    while (_KernelInputQueue.getSize() > 0)
    {
        // Get the next character from the kernel input queue.
        var chr = _KernelInputQueue.dequeue();
        // Check to see if it's "special" (enter or ctrl-c or backspace) or "normal" (anything else that the keyboard device driver gave us).
        if (chr == String.fromCharCode(13))  //     Enter key   
        {
            // The enter key marks the end of a console command, so ...
            // ... tell the shell ... 
            _OsShell.handleInput(this.buffer);
            // ... and reset our buffer.
            this.buffer = "";
        }
        else if (chr == String.fromCharCode(8)) // backspace
        {
            this.deleteText();
        }
        // TODO: Write a case for Ctrl-C.
        else
        {
            // This is a "normal" character, so ...
            // ... draw it on the screen...
            this.putText(chr);
            // ... and add it to our buffer.
            this.buffer += chr;
            //this.storageBuffer.push(chr);
        }
    }
}

function consolePutText(txt)    
{
    // My first inclination here was to write two functions: putChar() and putString().
    // Then I remembered that Javascript is (sadly) untyped and it won't differentiate 
    // between the two.  So rather than be like PHP and write two (or more) functions that
    // do the same thing, thereby encouraging confusion and decreasing readability, I 
    // decided to write one function and use the term "text" to connote string or char.
    if (txt != "")
    {
        //var adjustedYPosition = this.CurrentYPosition + ((this.CurrentFontSize + FONT_HEIGHT_MARGIN) * this.scrollOffset );
        // Draw the text at the current X and Y coordinates.
        DRAWING_CONTEXT.drawText(this.CurrentFont, this.CurrentFontSize, this.CurrentXPosition, this.CurrentYPosition, txt);
    	// Move the current X position.
        var offset = DRAWING_CONTEXT.measureText(this.CurrentFont, this.CurrentFontSize, txt);
        this.CurrentXPosition = this.CurrentXPosition + offset;    
    }
}

function consoleDeleteText()
{
    if(this.buffer.length > 0) //If there are characters to delete, delete them
    {
        // Move the current X position.
        var offset = DRAWING_CONTEXT.measureText(this.CurrentFont, this.CurrentFontSize, this.buffer.charAt(this.buffer.length - 1));
        this.CurrentXPosition = this.CurrentXPosition - offset;
        // Draw over the text at the current X and Y coordinates.  the -1 and +1 are ajustments to accomidate j's
        DRAWING_CONTEXT.clearRect(this.CurrentXPosition - 1, this.CurrentYPosition - this.CurrentFontSize, offset + 1, this.CurrentFontSize + 7);
        // Delete the last character in the buffer
        this.buffer = this.buffer.slice(0, this.buffer.length - 1);
    }
}

function consoleAdvanceLine()
{
    this.CurrentXPosition = 0;
    
    this.CurrentXPosition = 0;
    if ((CANVAS.height - this.CurrentYPosition) < (DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN)) //if at last line
    //if(this.CurrentYPosition > this.canvasHeight)
    {
        //copy the the canvas - top line
        var topPart = DRAWING_CONTEXT.getImageData(0, DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN, CANVAS.width, CANVAS.height - (DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN));
        this.clearScreen();
        //paste, don't increment y position, stay at last line
        DRAWING_CONTEXT.putImageData(topPart, 0, 0);
    }
    else
        this.CurrentYPosition += DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN; 
}
