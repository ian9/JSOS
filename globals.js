/* ------------  
   Globals.js

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation.)
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//
// Global Constants
//
var APP_NAME = "IanBOS";  // 'cause I was at a loss for an even better name.
var APP_VERSION = "0.2"

var CPU_CLOCK_INTERVAL = 100;   // in ms, or milliseconds, so 1000 = 1 second.

var TIMER_IRQ    = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority). 
                       // NOTE: The timer is different from hardware clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var CRASH_IRQ = 70;     //For testing purposes of course
var SYSCALL_IRQ = 2;
var CONTEXTSWITCH_IRQ = 3;

var NEW = 0;
var READY = 1;
var RUNNING = 2;
var WAITING = 3;
var TERMINATED = 4;


//
// Global Variables
//
var _CPU = null;
var _Memory = null;

var _OSclock = 0;       // Page 23.

var _Mode = 0;   // 0 = Kernel Mode, 1 = User Mode.  See page 21.

// TODO: Fix the naming convention for these next five global vars.
var CANVAS = null;              // Initialized in simInit().
var DRAWING_CONTEXT = null;     // Initialized in simInit().
var DEFAULT_FONT = "sans";      // Ignored, just a place-holder in this version.
var DEFAULT_FONT_SIZE = 13;     
var FONT_HEIGHT_MARGIN = 4;     // Additional space added to font size when advancing a line.

// Default the OS trace to be on.
var _Trace = true;

// OS queues
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;

// Standard input and output
var _StdIn  = null;
var _StdOut = null;

// UI
var _Console = null;
var _ProgramInput = null;
var _MemoryManager = null;
var _Scheduler = null;
var _OsShell = null;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
var _AwesomeMode = false;

//
// Global Device Driver Objects - page 12
//
var krnKeyboardDriver = null;
