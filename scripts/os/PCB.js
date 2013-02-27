/* ------------
   PCB.js
   
   A Process Control Block - Where information for a process is kept
   ------------ */


function PCB()
{
    // Properties
    this.PC    = 0;     // Program Counter
    this.Acc   = 0;     // Accumulator
    this.Xreg  = 0;     // X register
    this.Yreg  = 0;     // Y register
    this.Zflag = 0;     // Z-ero flag (Think of it as "isZero".)
    this.isExecuting = false;
    this.id = 5000;
    this.state = NEW;
    this.base = 0;      //Where the memory starts
    this.limit = 256;   //How big the block is
    
    // Methods
    this.init = pcbInit;
    
}

function pcbInit(theId, pcbListSize)
{
    this.PC    = 256*pcbListSize;
    this.Acc   = 0;
    this.Xreg  = 0;
    this.Yreg  = 0;
    this.Zflag = 0;
    this.isExecuting = false;
    this.id = theId;
    this.state = READY;
    this.base = 256*pcbListSize;
    this.limit = 256;
}