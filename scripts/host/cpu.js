/* ------------  
   CPU.js

   Requires global.js.
   
   Routines for the host CPU simulation, NOT for the OS itself.  
   In this manner, it's A LITTLE BIT like a hypervisor,
   in that the Document envorinment inside a browser is the "bare metal" (so to speak) for which we write code
   that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
   JavaScript in both the host and client environments.

   This code references page numbers in the text book: 
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

function cpu()
{
    this.PC    = 0;     // Program Counter, stored as an integer
    this.Acc   = 0;     // Accumulator, stored as a hex string
    this.Xreg  = 0;     // X register, stored as a string
    this.Yreg  = 0;     // Y register, stored as a string
    this.Zflag = 0;     // Z-ero flag (Think of it as "isZero".)
    this.isExecuting = false;
    this.id = -1;     // Id of the PCB in execution
    
    this.singleStep = false;
    
    this.init = function()
    {
        this.PC    = 0;
        this.Acc   = 0;
        this.Xreg  = 0;
        this.Yreg  = 0;
        this.Zflag = 0;      
        this.isExecuting = false;
        this.id = -1;
    }
    
    this.load = function(process)
    {
        this.PC    = process.PC;
        this.Acc   = process.Acc;
        this.Xreg  = process.Xreg;
        this.Yreg  = process.Yreg;
        this.Zflag = process.Zflag;      
        this.isExecuting = false;
        this.id = process.id;
    }
    
    this.pulse = function()
    {
        // TODO: Do we need this?  Probably not.
    }

    this.cycle = function () {
        krnTrace("CPU cycle");
        // TODO: Accumulate CPU usage and profiling statistics here.
        // Do real work here. Set this.isExecuting appropriately.

        var part = _Memory.memory.q.slice(this.PC, this.PC + 1)[0];
        var temp = 0;

        switch (part) {
            case "A9": //Load the Acc with this data
                this.Acc = _Memory.memory.q.slice(this.PC + 1, this.PC + 2)[0];
                this.PC = this.PC + 2;
                break;

            case "AD": //Load the data at given position in Acc
                //temp = The position given in the command
                temp = parseInt(_Memory.memory.q.slice(this.PC + 2, this.PC + 3)[0], 16) * 256
                    + parseInt(_Memory.memory.q.slice(this.PC + 1, this.PC + 2)[0], 16) + _MemoryManager.base;
                if (temp >= _MemoryManager.base + _MemoryManager.limit
                    || temp < _MemoryManager.base)
                    _KernelInterruptQueue.enqueue(new Interrupt(CRASH_IRQ, 0));
                this.Acc = _Memory.memory.q.slice(parseInt(temp, 16), parseInt(temp + 1, 16))[0];
                this.PC = this.PC + 3;
                break;

            case "8D": //Store the Acc in memory
                //temp = The position given in the command
                temp = parseInt(_Memory.memory.q.slice(this.PC + 2, this.PC + 3)[0], 16) * 256
                    + parseInt(_Memory.memory.q.slice(this.PC + 1, this.PC + 2)[0], 16) + _MemoryManager.base;
                if (temp >= _MemoryManager.base + _MemoryManager.limit
                    || temp < _MemoryManager.base)
                    _KernelInterruptQueue.enqueue(new Interrupt(CRASH_IRQ, 0));
                _Memory.memory.q.splice(temp, 1, this.Acc);
                this.PC = this.PC + 3;
                break;

            case "6D": //Add the data to the Acc
                //temp = The position given in the command
                temp = parseInt(_Memory.memory.q.slice(this.PC + 2, this.PC + 3)[0], 16) * 256
                    + parseInt(_Memory.memory.q.slice(this.PC + 1, this.PC + 2)[0], 16) + _MemoryManager.base;
                if (temp >= _MemoryManager.base + _MemoryManager.limit
                    || temp < _MemoryManager.base)
                    _KernelInterruptQueue.enqueue(new Interrupt(CRASH_IRQ, 0));
                this.Acc = (parseInt(this.Acc, 16) + parseInt(_Memory.memory.q.slice(temp, temp + 1)[0], 16)).toString(16);
                this.PC = this.PC + 3;
                break;

            case "A2": //Load Xreg with this data
                this.Xreg = _Memory.memory.q.slice(this.PC + 1, this.PC + 2)[0];
                this.PC = this.PC + 2;
                break;

            case "AE": //Load Xreg with data at given position
                //temp = The position given in the command
                temp = parseInt(_Memory.memory.q.slice(this.PC + 2, this.PC + 3)[0], 16) * 256
                    + parseInt(_Memory.memory.q.slice(this.PC + 1, this.PC + 2)[0], 16) + _MemoryManager.base;
                if (temp >= _MemoryManager.base + _MemoryManager.limit
                    || temp < _MemoryManager.base)
                    _KernelInterruptQueue.enqueue(new Interrupt(CRASH_IRQ, 0));
                this.Xreg = _Memory.memory.q.slice(temp, temp + 1)[0];
                this.PC = this.PC + 3;
                break;

            case "A0": //Load Yreg with this data
                this.Yreg = _Memory.memory.q.slice(this.PC + 1, this.PC + 2)[0];
                this.PC = this.PC + 2;
                break;

            case "AC": //Load Yreg with data at given location
                //temp = The position given in the command
                temp = parseInt(_Memory.memory.q.slice(this.PC + 2, this.PC + 3)[0], 16) * 256
                    + parseInt(_Memory.memory.q.slice(this.PC + 1, this.PC + 2)[0], 16) + _MemoryManager.base;
                if (temp >= _MemoryManager.base + _MemoryManager.limit
                    || temp < _MemoryManager.base)
                    _KernelInterruptQueue.enqueue(new Interrupt(CRASH_IRQ, 0));
                this.Yreg = _Memory.memory.q.slice(temp, temp + 1)[0];
                this.PC = this.PC + 3;
                break;

            case "EA": //No-op
                this.PC = this.PC + 1;
                break;

            case "00": //Break
                var params2 = new Array(0, null);
                _KernelInterruptQueue.enqueue(new Interrupt(SYSCALL_IRQ, params2));
                break;

            case "EC": //If data at given position == Xreg, Zflag = 1
                //temp = The position given in the command
                temp = parseInt(_Memory.memory.q.slice(this.PC + 2, this.PC + 3)[0], 16) * 256
                    + parseInt(_Memory.memory.q.slice(this.PC + 1, this.PC + 2)[0], 16) + _MemoryManager.base;
                if (temp >= _MemoryManager.base + _MemoryManager.limit
                    || temp < _MemoryManager.base)
                    _KernelInterruptQueue.enqueue(new Interrupt(CRASH_IRQ, 0));
                if (parseInt(this.Xreg, 16) == parseInt(_Memory.memory.q.slice(temp, temp + 1)[0], 16)) {
                    this.Zflag = 1;
                }
                else
                    this.Zflag = 0;
                this.PC = this.PC + 3;
                break;

            case "D0": //branch X bytes if Zflag == 0
                if (this.Zflag == 0) {
                    var mathHold1 = parseInt(_Memory.memory.q.slice(this.PC + 1, this.PC + 2)[0], 16);
                    var mathHold = this.PC + mathHold1 + 2;
                    if (mathHold > _MemoryManager.base + _MemoryManager.limit)
                        mathHold = mathHold - 256;

                    this.PC = mathHold;
                }
                else
                    this.PC = this.PC + 2;
                break;

            case "EE": //Increment the data at given position
                //temp = The position given in the command
                temp = parseInt(_Memory.memory.q.slice(this.PC + 2, this.PC + 3)[0], 16) * 256
                    + parseInt(_Memory.memory.q.slice(this.PC + 1, this.PC + 2)[0], 16) + _MemoryManager.base;
                if (temp >= _MemoryManager.base + _MemoryManager.limit
                    || temp < _MemoryManager.base)
                    _KernelInterruptQueue.enqueue(new Interrupt(CRASH_IRQ, 0));
                var hold = _Memory.memory.q.slice(temp, temp + 1)[0]; //Retrieve the information
                var hold2 = parseInt(hold, 16) + 1; //Increment the data at the location
                var hold3 = hold2.toString(16); //Change it back into a string
                if (hold2 / 10 < 1)
                    hold3 = "0" + hold3;
                _Memory.memory.q.splice(temp, 1, hold3);
                this.PC = this.PC + 3;
                break;

            case "FF": //System Call
                var params;
                if (this.Xreg == 1) {
                    //print the integer stored in the Y register
                    params = new Array(this.Xreg, this.Yreg);
                    _KernelInterruptQueue.enqueue(new Interrupt(SYSCALL_IRQ, params));
                }
                if (this.Xreg == 2) {
                    //print the 00-terminated string stored at the address in the Y register.
                    params = new Array(this.Xreg, this.Yreg);
                    _KernelInterruptQueue.enqueue(new Interrupt(SYSCALL_IRQ, params));
                }
                this.PC = this.PC + 1;
                break;

            default:
                //Output that theres an error
                krnTrace("Invalid Op Code, closing program");
                //Break the program
                var params2 = new Array(0, null);
                _KernelInterruptQueue.enqueue(new Interrupt(SYSCALL_IRQ, params2));
                break;
        }
    }
}
