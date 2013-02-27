/* ------------
   Kernel.js
   
   Requires globals.js
   
   Routines for the Operataing System, NOT the host.
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5   
   ------------ */


//
// OS Startup and Shutdown Routines   
//
function krnBootstrap()      // Page 8.
{
    simLog("bootstrap", "host");  // Use simLog because we ALWAYS want this, even if _Trace is off.

    // Initialize our global queues.
    _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
    _KernelBuffers = new Array();         // Buffers... for the kernel.
    _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
    _Console = new Console();             // The console output device.
    _ProgramInput = new ProgramInput();   // The area that text for programs is entered
    _MemoryManager = new MemoryManager();
    _Scheduler = new Scheduler();

    // Initialize the things.
    _Console.init();
    _ProgramInput.init();
    _MemoryManager.init();
    

    // Initialize standard input and output to the _Console.
    _StdIn  = _Console;
    _StdOut = _Console;

    // Load the Keyboard Device Driver
    krnTrace("Loading the keyboard device driver.");
    krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
    krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
    krnTrace(krnKeyboardDriver.status);

    // 
    // ... more?
    //

    // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
    krnTrace("Enabling the interrupts.");
    krnEnableInterrupts();
    // Launch the shell.
    krnTrace("Creating and Launching the shell.")
    _OsShell = new Shell();
    _OsShell.init();
}

function krnShutdown()
{
    krnTrace("begin shutdown OS");
    // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...    
    // ... Disable the Interruupts.
    krnTrace("Disabling the interrupts.");
    krnDisableInterrupts();
    // 
    // Unload the Device Drivers?
    // More?
    //
    krnTrace("end shutdown OS");
}


function krnOnCPUClockPulse() 
{
    /* This gets called from the host hardware every time there is a hardware clock pulse. 
       This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
       This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel 
       that it has to look for interrupts and process them if it finds any.                           */

    // Check for an interrupt, are any. Page 560
    if (_KernelInterruptQueue.getSize() > 0)    
    {
        // Process the first interrupt on the interrupt queue.
        // TODO: Implement a priority queye based on the IRQ number/id to enforce interrupt priority.
        var interrput = _KernelInterruptQueue.dequeue();
        krnInterruptHandler(interrput.irq, interrput.params);        
    }
    else if (_CPU.isExecuting) // If there are no interrupts then run a CPU cycle if there is anything being processed.
    {
        if(_Scheduler.incrementQ())
        {//If quantum reaches 6,
            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXTSWITCH_IRQ, 0));
        }
        else
        {
            //_KernelInterruptQueue.enqueue(new Interrupt(SYSCALL_IRQ, new Array(10))); //Switch to User mode
            _Mode = 0;
            _CPU.cycle();
            //_KernelInterruptQueue.enqueue(new Interrupt(SYSCALL_IRQ, new Array(10))); //Switch to Kernal mode
            _Mode = 1;
        }
        
        if(_CPU.singleStep)
            _CPU.isExecuting = false;
        
        simEnableStep();
    }    
    else                       // If there are no interrupts and there is nothing being executed then just be idle.
    {
       krnTrace("Idle");
       //Not sure if this should go here
       simUpdateTime();
    }
    
    //Not sure if this should go here
   simDisplayMemory(_MemoryManager.readyQueue);

}


// 
// Interrupt Handling
// 
function krnEnableInterrupts()
{
    // Keyboard
    simEnableKeyboardInterrupt();
    // Put more here.
}

function krnDisableInterrupts()
{
    // Keyboard
    simDisableKeyboardInterrupt();
    // Put more here.
}

function krnLoadCPU(pcb)
{
    _CPU.load(pcb);
    _CPU.isExecuting = true;
}

function krnInterruptHandler(irq, params)    // This is the Interrupt Handler Routine.  Page 8.
{
    // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
    krnTrace("Handling IRQ~" + irq);
    // Save CPU state. (I think we do this elsewhere.)

    // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
    // TODO: Use Interrupt Vector in the future.
    // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.  
    //       Maybe the hardware simulation will grow to support/require that in the future.
    switch (irq)
    {
        case TIMER_IRQ:
            krnTimerISR();                   // Kernel built-in routine for timers (not the clock).
            break;
        case KEYBOARD_IRQ:
            krnKeyboardDriver.isr(params);   // Kernel mode device driver
            _StdIn.handleInput();
            break;
        case SYSCALL_IRQ:
            krnSysCall(params);
            break;
        case CONTEXTSWITCH_IRQ:  
            krnTrace("RR swapping out program " + _MemoryManager.currPro);  
            krnLoadCPU(_MemoryManager.swapProgram());
            break;
        default:
            krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
    }

    // 3. Restore the saved state.  TODO: Question: Should we restore the state via IRET in the ISR instead of here? p560.
}

function krnTimerISR()  // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver).
{
    // Check multiprogramming parameters and enfore quanta here. Call the scheduler / context switch here if necessary.
}   



//
// System Calls... that generate software interrupts via tha Application Programming Interface library routines.
//
// Some ideas:
// - ReadConsole
// - WriteConsole
// - CreateProcess
// - ExitProcess
// - WaitForProcessToExit
// - CreateFile
// - OpenFile
// - ReadFile
// - WriteFile
// - CloseFile
function krnSysCall(params)
{
    
    if(parseInt(params[0]) == 0)
    {//Break
        for(var i=0; i<_MemoryManager.pcbList.length; i++)
        {
            if(_MemoryManager.pcbList[i].id == _CPU.id)
            {
                _MemoryManager.pcbList.splice(i,1);//Delete the PCB
            }
        }
        if(_MemoryManager.pcbList.length != 0)
        {
            krnLoadCPU(_MemoryManager.deleteCurrent());
        }
        else
        {
            simDisableStep();
            _CPU.isExecuting = false;
            _StdIn.advanceLine();
            _StdIn.buffer = "";//Clearing the buffer, as it is now contaminated
            _OsShell.putPrompt();//The '>'
            _CPU.init();
        }
    }
    if(parseInt(params[0]) == 1)
    {//Print the integer stored in the Y register
        //_StdOut.putText(parseInt(params[1], 16).toString(16));
        _KernelInputQueue.enqueue( parseInt(params[1], 10).toString() );
        _StdIn.handleInput();
    }
    if(parseInt(params[0]) == 2)
    {//Print the 00-terminated string stored at the address in the Y register
        var k = parseInt(params[1], 16);
        var hold = _Memory.memory.q[k+_MemoryManager.base];

        while(hold != "00")
        {
            k++;
            //Print whatever character is in hold
            _KernelInputQueue.enqueue( String.fromCharCode(parseInt(hold, 16)) );
            //krnKeyboardDriver.isr(new Array(parseInt(hold, 16), false));
            //_StdIn.handleInput();
            hold = _Memory.memory.q[k+_MemoryManager.base];
        }
        _StdIn.handleInput();
    }

    if (parseInt(params[0]) == 10) {//Switch the OS mode
        if (_Mode == 0)
            _Mode = 1;
        else
            _Mode = 0;
    }
}

//
// OS Utility Routines
//
function krnTrace(msg)
{
   // Check globals to see if trace is set ON.  If so, then (maybe) log the message. 
   if (_Trace)
   {
      if (msg === "Idle")
      {
         // We can't log every idle clock pulse because it would lag the browser very quickly.
         if (_OSclock % 10 == 0)  // Check the CPU_CLOCK_INTERVAL in globals.js for an 
         {                        // idea of the tick rate and adjust this line accordingly.
            simLog(msg, "OS");          
         }         
      }
      else
      {
       simLog(msg, "OS");
      }
   }
}
   
function krnTrapError(msg)
{
    simLog("OS ERROR - TRAP: " + msg);
    // TODO: Display error on console, perhaps in some sort of colored screen. (Perhaps blue?)
    simBlueScreen();
    krnShutdown();
}
