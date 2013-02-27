/* ------------  
   Control.js

   Requires global.js.
   
   Routines for the hardware simulation, NOT for our client OS itself. In this manner, it's A LITTLE BIT like a hypervisor,
   in that the Document envorinment inside a browser is the "bare metal" (so to speak) for which we write code that
   hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using JavaScript in 
   both the host and client environments.
   
   This (and other host/simulation scripts) is the only place that we should see "web" code, like 
   DOM manipulation and JavaScript event handling, and so on.  (Index.html is the only place for markup.)
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */


//
// Control Services
//
function simInit()
{
	// Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
	CANVAS  = document.getElementById('display');
	// Get a global reference to the drawing context.
	DRAWING_CONTEXT = CANVAS.getContext('2d');
	// Enable the added-in canvas text functions (see canvastext.js for provenance and details).
	CanvasTextFunctions.enable(DRAWING_CONTEXT);
	// Clear the log text box.
	document.getElementById("taLog").value="";
	// Set focus on the start button.
        document.getElementById("btnStartOS").focus();     // TODO: This does not seem to work.  Why?
        //Give an initial testable value
        document.getElementById("input").defaultValue =
        "A9 03 8D 41 00 A9 01 8D 40 00 AC 40 00" + 
        " A2 01 FF EE 40 00 AE 40 00 EC 41 00 D0" +
        " EF A9 44 8D 42 00 A9 4F 8D 43 00 A9 4E 8D" +
        " 44 00 A9 45 8D 45 00 A9 00 8D 46 00" + 
        " A2 02 A0 42 FF 00";
        //initialize text in the utility box
        var date = new Date();date = date.toUTCString();
        document.getElementById("utility").value = date + "\n\n" + "Status - "; //Write the date on the utility bar
}

function simLog(msg, source)
{
    // Check the source.
    if (!source)
    {
        source = "?";
    }

    // Note the OS CLOCK.
    var clock = _OSclock;

    // Note the REAL clock in milliseconds since January 1, 1970.
    var now = new Date().getTime();

    // Build the log string.   
    var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";    
    // WAS: var str = "[" + clock   + "]," + "[" + now    + "]," + "[" + source + "]," +"[" + msg    + "]"  + "\n";

    // Update the log console.
    taLog = document.getElementById("taLog");
    taLog.value = str + taLog.value;
    // Optionally udpate a log database or some streaming service.
}

function simNote(msg)
{
    //Applies the status to the status bar
    var date = new Date().toUTCString();
    document.getElementById("utility").value = date + "\n\n" + "Status - " + msg.toString();
}

function simBlueScreen()
{
    //Draws the blue screen
    DRAWING_CONTEXT.fillStyle="#0000EE";
    DRAWING_CONTEXT.fillRect(0,0,CANVAS.width,CANVAS.height);
}

function simHexInput()
{
    //Returns the text in the input box as a string (ignoring carrige reutrns [I think])
    return document.getElementById("input").value.split(" ");
}

function simDisplayMemory(readyQueue)
{
    var hold = "";
    for(var i=0; i<readyQueue.q.length; i++)
    {
        hold += ("PC\t" + (readyQueue.q[i].PC%256).toString(10) + "\t");
    }
    hold += ("\n");
    for(i=0; i<readyQueue.q.length; i++)
    {
        hold += ("Acc\t" + (readyQueue.q[i].Acc) + "\t");
    }
    hold += ("\n");
    for(i=0; i<readyQueue.q.length; i++)
    {
        hold += ("Xreg\t" + (readyQueue.q[i].Xreg) + "\t");
    }
    hold += ("\n");
    for(i=0; i<readyQueue.q.length; i++)
    {
        hold += ("Yreg\t" + (readyQueue.q[i].Yreg) + "\t");
    }
    hold += ("\n");
    for(i=0; i<readyQueue.q.length; i++)
    {
        hold += ("Zflag\t" + (readyQueue.q[i].Zflag) + "\t");
    }
    hold += ("\n");
    for(i=0; i<readyQueue.q.length; i++)
    {
        hold += ("ID\t" + (readyQueue.q[i].id) + "\t");
    }
    document.getElementById("readyQueue").value = hold;
    
    hold = "PC\t" + (_CPU.PC%256).toString(10) + "\nAcc\t" + _CPU.Acc + "\nXreg\t" 
        + _CPU.Xreg + "\nYreg\t" + _CPU.Yreg + "\nZflag\t" + _CPU.Zflag + "\nID\t" + _CPU.id;
    document.getElementById("cpu").value = hold;
    
    var temp = _Memory.memory.toString(/,/g, "");
    for(i=0; i<_Memory.memory.length; i+=4)
    {//Doesnt work
        var tempQueue = _Memory.memory.slice(i,i+4);
        document.getElementById("memory").value = document.getElementById("memory").value + tempQueue;
        document.getElementById("memory").value = document.getElementById("memory").value + "\n";
    }
    document.getElementById("memory").value = temp;
}

function simUpdateTime()
{
    //Make a new date, take the old date off the utility bar, and then attach the new date
    var temp = document.getElementById("utility").value;
    var date = new Date();
    date = date.toUTCString();
    temp = temp.slice(date.length);
    date = date.concat(temp);
    document.getElementById("utility").value = date;
}


//
// Control Events
//
function simBtnStartOS_click(btn)
{
    // Disable the start button...
    btn.disabled = true;
    
    // .. enable the Emergency Halt and Reset buttons ...
    document.getElementById("btnHaltOS").disabled = false;
    document.getElementById("btnReset").disabled = false;
    
    // .. set focus on the OS console display ... 
    document.getElementById("display").focus();
    
    // ... Create and initialize the CPU ...
    _CPU = new cpu();
    _CPU.init();
    
    // ... Create and initialize the Memory ...
    _Memory = new Memory();
    _Memory.init();

    // ... then set the clock pulse simulation to call ?????????.
    hardwareClockID = setInterval(simClockPulse, CPU_CLOCK_INTERVAL);
    // .. and call the OS Kernel Bootstrap routine.
    krnBootstrap();
}

function simBtnHaltOS_click(btn)
{
    simLog("emergency halt", "host");
    simLog("Attempting Kernel shutdown.", "host");
    // Call the OS sutdown routine.
    krnShutdown();
    // Stop the JavaScript interval that's simulating our clock pulse.
    clearInterval(hardwareClockID);
    // TODO: Is there anything else we need to do here?
}

function simBtnReset_click(btn)
{
    // The easiest and most thorough way to do this is to reload (not refresh) the document.
    //location.reload(true);
    // Disable the start button...
    btn.disabled = true;
    
    // .. enable the Emergency Halt and Reset buttons ...
    document.getElementById("btnHaltOS").disabled = false;
    document.getElementById("btnReset").disabled = false;
    
    // .. set focus on the OS console display ... 
    document.getElementById("display").focus();
    
    // ... Create and initialize the CPU ...
    _CPU = new cpu();
    _CPU.init();
    
    // ... Create and initialize the Memory ...
    _Memory = new Memory();
    _Memory.init();
    
    taLog.value = "";
    _OSclock = 0;
    
    // .. and call the OS Kernel Bootstrap routine.
    krnBootstrap();
    // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
    // be reloaded from the server. If it is false or not specified, the browser may reload the 
    // page from its cache, which is not what we want.
}

function simBtnStep_click(btn)
{
    _CPU.isExecuting = true;
}

function simDisableStep(btn)
{
    document.getElementById("btnStepOS").disabled = true;
}

function simEnableStep(btn)
{
    document.getElementById("btnStepOS").disabled = false;
}
