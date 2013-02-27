/* ------------
   Memory.js
   
   The OS Memory - The RAM(?) of the 'computer'
   ------------ */


function Memory()
{
    // Properties
    this.memory = new Queue();
    //this.id     = "memory";
    
    this.init = function()
    {
        for(var i=0; i<768; i++)
        {
            this.memory.enqueue("00");
        }
    }
    
}


