/* ------------
   ProgramInput.js
   
   The OS Program Input - Where you enter hexadecimal programs
   ------------ */


function ProgramInput()
{
    // Properties
    this.buffer = new Queue();
    this.temp = new Queue();
    this.memory = new Queue();
    this.id     = "input";
    // Methods
    this.init   = programInit;
    this.handleInput = programHandleInput;
    this.checkIfLetters = programCheckIfLetters;
    
}

function programInit()
{
    //Nothing to do yet
}

function programHandleInput()
{
    this.buffer.q = simHexInput();// a string of the characters in the input box

    if(this.buffer.q.length == 1)// If the box is empty, prompt for it to be filled
    {
        _StdOut.putText("The input box is empty");
        return;
    }
    
    var max = this.buffer.q.length;
    
    if(max > 256)
    {
        _StdOut.putText("Program is too long, only 256 bytes allowed");
        return;
    }

    for(var i=0; i<max; i++) // For every part (seperated by spaces),
    {
        var part = this.buffer.dequeue();
        if(part.length != 2) // If the part isn't two characters long, illegal program
        {
            _StdOut.putText("There are illegal blocks in the program");
            return;
        }
        for(var j=0; j<2; j++) //Go through each character in the part
        {
            if(!( 
                ((part.charAt(j) >= "A") && (part.charAt(j) <= "F")) || 
                ((part.charAt(j) >= "0") && (part.charAt(j) <= "9"))
                ) 
              ) //If it's not a valid character, quit and let the user know
            {
                _StdOut.putText("There are illegal characters in the program");
                return;
            }
        }
        this.temp.enqueue(part);
    }

    //Else put it in memory
    //Error checking?
    max = this.temp.q.length;
    
    for(var k=0; k<max; k++)
    {
        var memPart = this.temp.dequeue();
        var hold = "";
        
        switch(memPart)
        {
            case "A9":
                this.memory.enqueue("A9");
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                break;

            case "AD":
                this.memory.enqueue("AD");
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                break;

            case "8D":
                this.memory.enqueue("8D");
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                break;

            case "6D":
                this.memory.enqueue("6D");
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                break;

            case "A2":
                this.memory.enqueue("A2");
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                break;

            case "AE":
                this.memory.enqueue("AE");
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                break;

            case "A0":
                this.memory.enqueue("A0");
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                break;

            case "AC":
                this.memory.enqueue("AC");
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                break;
            case "EA":
                this.memory.enqueue("EA");
                break;

            case "00":
                this.memory.enqueue("00");
                break;

            case "EC":
                this.memory.enqueue("EC");
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                break;

            case "D0":
                this.memory.enqueue("D0");
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                break;

            case "EE":
                this.memory.enqueue("EE");
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                hold = this.temp.dequeue();
                this.memory.enqueue(hold);
                k++;
                break;

            case "FF":
                this.memory.enqueue("FF");
                break;
                
            default:
                this.memory.enqueue(memPart);
                break;

            //default:
                //_StdOut.putText("There is an illegal command in the program");
                //return;
        }
    }
    
}

function programCheckIfLetters(temp)
{ //Not being used currently, not sure how to error check
    for(var j=0; j<2; j++) //Go through each character in the part
    {
        if(((temp.charAt(j) >= "A") && (temp.charAt(j) <= "F"))) 
        //If it's not a valid character, quit and let the user know
        {
            return false;
        }
    }
    return true;
}
