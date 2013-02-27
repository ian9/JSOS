/* ------------
scheduler.js   
------------ */

function Scheduler(_irq, _params) {
    // Properties
    this.quantum = 6;
    this.quantumCount = 0;

    //Methods
    this.incrementQ = incrementQuantum;
}

function incrementQuantum() {
    if (this.quantumCount++ == this.quantum) {
        this.quantumCount = 0;

        return true;
    }
    return false;
}