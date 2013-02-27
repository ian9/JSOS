/* ------------
   MemoryManager.js
   
   The OS Memory Manager - 
   ------------ */

function MemoryManager()
{
    // Properties
    this.id     = "memory";
    this.quantum = 6;
    this.quantumCount = 0;
    this.pcbList = new Array();
    this.readyQueue = new Queue();
    this.currPro = 0;
    this.numIDs = 0;
    
    this.base = 0;
    this.limit = 256;
    
    // Methods
    this.init   = memoryInit;
    this.display = memoryDisplay;
    this.loadMemory = memoryLoadMemory;
    this.incrementQuant = incrementQuantum;
    this.swapProgram = swapCurrentProgram;
    this.deleteCurrent = deleteCurrentProgram;
    this.remove = removeProgram;
}

function memoryInit()
{
    //Nothing to do yet
}

function memoryDisplay()
{
    simDisplayMemory(this.memory);
}

function memoryLoadMemory(temp)
{
    if (temp.q.length <= 256) {

        if (this.pcbList.length == 3) 
        {
            _StdOut.putText("Cannot yet load more than three programs");
            return;
        }

        var initLocation = 256 * this.pcbList.length;
        
        //_Memory.memory = temp;
        for(var i=initLocation; i<initLocation + temp.q.length; i++)
        {
            var hold = temp.q[i%256];
            _Memory.memory.q[i] = hold;
        }
        
        var newPCB = new PCB();
        newPCB.init(this.numIDs, this.pcbList.length);
        _StdOut.putText("Program ID: " + this.numIDs);
        this.pcbList.push(newPCB);
        this.readyQueue.enqueue(newPCB);
        this.numIDs++;
    }
    else
    {
        _StdOut.putText("The input is too big");
        return;
    }
}

function swapCurrentProgram()
{
    if(this.readyQueue.q.length == 0)
        return loadFromCPU(new PCB());
    
    var tempPCB = this.readyQueue.dequeue();
    
    var oldPCB = new PCB();
    oldPCB = loadFromCPU(oldPCB);
    this.readyQueue.enqueue(oldPCB);
    this.base = tempPCB.base; this.limit = tempPCB.limit;
    tempPCB.state = RUNNING;
    
    this.currPro = tempPCB.id;
    
    return tempPCB;
}

function deleteCurrentProgram()
{
    var tempPCB = this.readyQueue.dequeue();
    this.base = tempPCB.base; this.limit = tempPCB.limit;
    _Scheduler.quantumCount = 0;
    return tempPCB;
}

function removeProgram(id)
{
    id = id[0];
    if(this.pcbList.length == 0)
    {
        _CPU.isExecuting = false;//Probably not completely handled
    }
    this.pcbList = this.pcbList.splice(id-1, 1);
    for(var i=0; i<_MemoryManager.readyQueue.q.length; i++)
    {
        if(_MemoryManager.readyQueue.q[i].id == id)
        {
            _MemoryManager.readyQueue.q.splice(i,1);//Delete the PCB
            break;
        }
    }
}

function loadFromCPU(pcb)
{
    pcb.PC    = _CPU.PC;
    pcb.Acc   = _CPU.Acc;
    pcb.Xreg  = _CPU.Xreg;
    pcb.Yreg  = _CPU.Yreg;
    pcb.Zflag = _CPU.Zflag;
    pcb.isExecuting = false;
    pcb.id = _CPU.id;
    pcb.state = READY;
    pcb.base = 256*_CPU.id;//Wrong
    pcb.limit = 256;
    
    return pcb;
}