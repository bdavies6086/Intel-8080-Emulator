const REGISTER_INDEXES = {
    ACC: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    H: 5,
    L: 6
}

var intel8080 = (function() {

    function Intel8080() {

    }

    // The program counter. A 16 bit register
    Intel8080.prototype.pc = 0;

    // The stack pointer. A 16 bit register
    Intel8080.prototype.sp = 0;

    // The scratch pad registers 
    // [0] - Accumulator
    // [1] - B
    // [2] - C
    // [3] - D
    // [4] - E
    // [5] - H
    // [6] - L
    Intel8080.prototype.registers = new Uint8Array(7);

    // These condition bits are used to add additional information about
    // a calculation. For example JNZ will check if the zeroBit isn't 0 so it can continue
    // (used in loops)
    Intel8080.prototype.conditionBits = {
        carry: 1,
        auxCarry: 1,
        sign: 1,
        zeroBit: 1,
        parBit: 1
    };

    Intel8080.prototype.memory = [];

    Intel8080.prototype.interruptsEnabled = true;

    Intel8080.prototype.interruptPointer;

    Intel8080.prototype.handleInterrupt = function (pointer) {
        this.interruptPointer = pointer;
    }

    Intel8080.prototype.setup = function(romDump) {
        this.romDump = romDump;
        this.pc[0] = 0;
        this.sp[0] = 0;

        for(var i = 0; i < this.registers.length; i++) {
            this.registers[i] = 0;
        }

        for(var j = 0; j < romDump.length; j=j+2) {
            this.memory.push(romDump.slice(j,j+2));
        }

      //  this.memory[8384] = 1;

      this.memory[8427] = "FF";
      this.memory[8222] = "00";       
        //this.pc = parseInt("0x1815");
       // this.cycle();

        doSomething();
    }

    Intel8080.prototype.cycle = function() {
        // Grab the op code out of memory
         //while(true) {
             //let a = 0;

           window.setInterval(() => {
            if(this.interruptsEnabled && !!this.interruptPointer) {
                var currentAddress = this.pc.toString("16");
                var byteArr = toByteArray(currentAddress);
               // debugger;
                
                this.sp = this.sp -1;
                this.memory[this.sp] = byteArr[0];
                this.sp = this.sp -1;
                this.memory[this.sp] = byteArr[1];

                this.pc = parseInt(this.interruptPointer);
                this.interruptPointer = undefined;
            }
            // if(this.pc.toString("16") == "add") {
            //     this.memory[8384] = "00";
            // }

            // if(this.pc.toString("16") == "57") {
            //     debugger;
            // }
            
           // this.memory[170] = "00";
           // this.memory[8222] = "00";   
           // a = a + 1;
            //console.log(a);
          
          // console.log(`PC: ${processor.pc.toString("16")}    ACC: ${window.processor.registers[REGISTER_INDEXES.ACC].toString("16")}      B: ${processor.registers[REGISTER_INDEXES.B].toString("16")}     C: ${processor.registers[REGISTER_INDEXES.C].toString("16")}     D: ${processor.registers[REGISTER_INDEXES.D].toString("16")}      E: ${processor.registers[REGISTER_INDEXES.E].toString("16")}      H: ${processor.registers[REGISTER_INDEXES.H].toString("16")}       L: ${processor.registers[REGISTER_INDEXES.L].toString("16")}`)
            var opCode = this.memory[this.pc];
            this.process(opCode);
           // this.cycle();
          }, 0);
        // }  
        // }
            
    }

    
            

    Intel8080.prototype.process = function(opCode) {

      
        switch(opCode) {
            case "00": {break;}
            // LXI B 
            // Load 2 bytes into registers B and C
            // Storing as big endian
            case "01": {
                var byte1 = this.memory[this.pc + 2];
                this.registers[REGISTER_INDEXES.B] = parseInt("0x" + byte1);
                var byte2 = this.memory[this.pc + 1];
                this.registers[REGISTER_INDEXES.C] = parseInt("0x" + byte2);
                this.pc = this.pc + 3;   
                return;
            }
            case "02": {break;}
            case "03": {
                
                var tempResult = parseInt("0x" + this.registers[REGISTER_INDEXES.B].toString(16) + "00") | parseInt("0x" + this.registers[REGISTER_INDEXES.C].toString(16));

                var result = toByteArray((tempResult + 1).toString(16));
                this.registers[REGISTER_INDEXES.B] = parseInt("0x" + result[0]);
                this.registers[REGISTER_INDEXES.C] = parseInt("0x" + result[1]);

                break;}
            case "04": {break;}
            // DCR B
            // Decrements register B by 1
            // If this becomes a negative number we need to flip the bits
            case "05": {
                var tempInt = this.registers[REGISTER_INDEXES.B];
                if(tempInt == 0) {
                    this.conditionBits.zeroBit = 0;
                    tempInt = parseInt("0xff");
                }
                else {
                    tempInt = tempInt - 1;
                    if(tempInt == 0) {
                        this.conditionBits.zeroBit = 1;
                    }
                    else {
                        this.conditionBits.zeroBit = 0;
                    }
                }

                // console.log(`TEMP: ${tempInt}`);
                this.registers[REGISTER_INDEXES.B] = tempInt;

                break;
            }
            // MVI B
            // Loads byte into register B
            case "06": {
                this.registers[REGISTER_INDEXES.B] = parseInt("0x"+ this.memory[this.pc + 1]);
                this.pc = this.pc + 2;
                return;
            }
            case "07": {console.log(`not implemented ` + opCode);break;}
            case "08": {console.log(`not implemented ` + opCode);break;}
            // DAD B
            // Adds BC to HL
            case "09": {

                let bHexPre = this.registers[REGISTER_INDEXES.B].toString("16");
                if(bHexPre.length == 1) {
                    bHexPre = "0" + bHexPre;
                }

                var bHex = "0x" + bHexPre + "00";

                let cHexPre = this.registers[REGISTER_INDEXES.C].toString("16");
                if(cHexPre.length == 1) {
                    cHexPre = "0" + cHexPre;
                }

                var cHex = "0x" + cHexPre;


                var bcVal = parseInt(bHex) | parseInt(cHex);

                // console.log(`B: ${parseInt(bHex)}    C: ${parseInt(this.registers[REGISTER_INDEXES.C])}`);

                // console.log(`PC: ${this.pc.toString("16")}`);

                // console.log(`BC: ${bcVal.toString("16")}     BC DEC: ${bcVal}`);

                let hHexPre = this.registers[REGISTER_INDEXES.H].toString("16");
                if(hHexPre.length == 1) {
                    hHexPre = "0" + hHexPre;
                }

                var hHex = "0x" + hHexPre + "00";

                let lHexPre = this.registers[REGISTER_INDEXES.L].toString("16");
                if(lHexPre.length == 1) {
                    lHexPre = "0" + lHexPre;
                }

                var lHex = "0x" + lHexPre;

                var hlVal = parseInt(hHex) | parseInt(lHex);

                // console.log(`HL: ${hlVal.toString("16")}     HL DEC: ${hlVal}`);

                var result = bcVal + hlVal;

                // console.log(`RESULT: ${result}`);

                this.conditionBits.zeroBit = result == 0 ? 1: 0;
                if(result & 0x80) {
                    this.conditionBits.sign = 1;
                }
                else {
                    this.conditionBits.sign = 0;
                }
                if(result > 255) {
                    this.conditionBits.carry = 1;
                }
                else {
                    this.conditionBits.carry = 0;
                }

                this.setParityBit(result & 0xff, 8);

                var bytes = toByteArray(result.toString("16"));

                // console.log(`BYTES RESULT: ${bytes.join()}`);
                if(bytes.join() == "25,1e") {
                    //debugger;
                }
                if(bytes.length == 1) {
                    this.registers[REGISTER_INDEXES.H] = 0;
                    this.registers[REGISTER_INDEXES.L] = parseInt("0x" + bytes[0]);
                }
                else {
                    this.registers[REGISTER_INDEXES.H] = parseInt("0x" + bytes[0]);
                    this.registers[REGISTER_INDEXES.L] = parseInt("0x" + bytes[1]);
                }


                break;
            }
            case "0a": {
                var tempD = parseInt("0x" + this.registers[REGISTER_INDEXES.B].toString("16") + "00");
                var tempE = parseInt("0x" + this.registers[REGISTER_INDEXES.C].toString("16"));
                var address = tempD | tempE;
                
                this.registers[REGISTER_INDEXES.ACC] = parseInt("0x" + this.memory[address]);
                break;
                break;
            }
            case "0b": {console.log(`not implemented ` + opCode);break;}
            case "0c": {console.log(`not implemented ` + opCode);break;}
            // DCR C - decrease the value of the C register by 1
            case "0d": {
                var tempInt = this.registers[REGISTER_INDEXES.C];
                if(tempInt == 0) {
                    this.conditionBits.zeroBit = 0;
                    tempInt = parseInt("0xff");
                }
                else {
                    tempInt = tempInt - 1;
                    if(tempInt == 0) {
                        this.conditionBits.zeroBit = 1;
                    }
                    else {
                        this.conditionBits.zeroBit = 0;
                    }
                }
                this.registers[REGISTER_INDEXES.C] = tempInt;
                break;
            }
            // MVI move a byte into the C register
            case "0e": {
                var arg = parseInt("0x" + this.memory[this.pc + 1]);
                this.registers[REGISTER_INDEXES.C] = arg;
                this.pc = this.pc + 2;
                return;
            }
            // RRC rotate accumulator
            case "0f": {
                var temp = this.registers[REGISTER_INDEXES.ACC];
                var result = ((temp & 1) << 7 | temp >> 1);
                this.conditionBits.carry = (result & 1) == 1;
                this.registers[REGISTER_INDEXES.ACC] = result;
                break;
            }
            case "10": {break;}
            // LXI D
            // Moves 1 byte into Register D
            // and 1 byte into Register E
            case "11": {
                this.registers[REGISTER_INDEXES.D] = parseInt("0x" + this.memory[this.pc + 2]);
                this.registers[REGISTER_INDEXES.E] = parseInt("0x" + this.memory[this.pc + 1]);
                this.pc = this.pc + 3;
                return;
            }
            case "12": {break;}
            // INX D
            // Increments the registers D and E by one
            case "13": {
                var address = getHexAddress(this.registers[REGISTER_INDEXES.D], this.registers[REGISTER_INDEXES.E]);

                var result = toByteArray((parseInt(address) + 1).toString(16));
                this.registers[REGISTER_INDEXES.D] = parseInt("0x" + result[0]);
                this.registers[REGISTER_INDEXES.E] = parseInt("0x" + result[1]);
                break;
            }
            case "14": {console.log(`not implemented ` + opCode);break;}
            case "15": {console.log(`not implemented ` + opCode);break;}
            case "16": {console.log(`not implemented ` + opCode);break;}
            case "17": {console.log(`not implemented ` + opCode);break;}
            case "18": {console.log(`not implemented ` + opCode);break;}
            // DAD D
            // Adds HL to DE
            case "19": {

                let hHexpre = this.registers[REGISTER_INDEXES.H].toString("16");
                if(hHexpre.length == 1) {
                    hHexpre = "0" + hHexpre;
                }

                var hHex = "0x" + hHexpre + "00";
                if(this.registers[REGISTER_INDEXES.H] == 0) {
                    hHex = hHex + "0";
                }

                let lHexPre = this.registers[REGISTER_INDEXES.L].toString("16");
                if(lHexPre.length == 1) {
                    lHexPre = "0" + lHexPre;
                }

                var lHex = "0x" + lHexPre;

                var hlVal = (parseInt(hHex) | parseInt(lHex));

                let dHexPre = this.registers[REGISTER_INDEXES.D].toString("16");
                if(dHexPre.length == 1) {
                    dHexPre = "0" + dHexPre;
                }

                var dHex = "0x" + dHexPre + "00";
                if(this.registers[REGISTER_INDEXES.D] == 0) {
                    dHex = dHex + "0";
                }

                let eHexPre = this.registers[REGISTER_INDEXES.E].toString("16");
                if(eHexPre.length == 1) {
                    eHexPre = "0" + eHexPre;
                }

                var eHex = "0x" + eHexPre;

                var deVal = (parseInt(dHex) | parseInt(eHex));

                var result = hlVal + deVal;

                this.conditionBits.zeroBit = result == 0 ? 1: 0;
                if(result & 0x80) {
                    this.conditionBits.sign = 1;
                }
                else {
                    this.conditionBits.sign = 0;
                }
                if(result > 255) {
                    this.conditionBits.carry = 1;
                }
                else {
                    this.conditionBits.carry = 0;
                }

                this.setParityBit(result & 0xff, 8);

                var bytes = toByteArray(result.toString("16"));
                if(bytes.length == 1) {
                    this.registers[REGISTER_INDEXES.L] = parseInt("0x" + bytes[0]);
                }
                else {
                    this.registers[REGISTER_INDEXES.H] = parseInt("0x" + bytes[0]);
                    this.registers[REGISTER_INDEXES.L] = parseInt("0x" + bytes[1]);
                }

                break;
            }
            // LDAX D
            // Loads into the accumulator using the address
            // stored in registers D and E
            case "1a": {

                var tempD = parseInt("0x" + this.registers[REGISTER_INDEXES.D].toString("16") + "00");
                var tempE = parseInt("0x" + this.registers[REGISTER_INDEXES.E].toString("16"));
                var address = tempD | tempE;
                
                this.registers[REGISTER_INDEXES.ACC] = parseInt("0x" + this.memory[address]);
                break;
            }
            case "1b": {console.log(`not implemented ` + opCode);break;}
            case "1c": {console.log(`not implemented ` + opCode);break;}
            case "1d": {console.log(`not implemented ` + opCode);break;}
            case "1e": {console.log(`not implemented ` + opCode);break;}
            case "1f": {
                var temp = this.registers[REGISTER_INDEXES.ACC];
                this.conditionBits.carry = (result & 1) == 1;
                var result = (temp >> 1 | (temp) << 7);
                
                this.registers[REGISTER_INDEXES.ACC] = result;
                break;
                //console.log(`not implemented ` + opCode);break;
            }
            case "20": {console.log(`not implemented ` + opCode);break;}
            // LXI H
            // Moves a byte into register H
            // and moves a byte into register L
            case "21": {
                this.registers[REGISTER_INDEXES.H] = parseInt("0x" + this.memory[this.pc + 2]);
                this.registers[REGISTER_INDEXES.L] = parseInt("0x" + this.memory[this.pc + 1]);
                // Move the PC past the data
                this.pc = this.pc + 3;
                return;
            }
            case "22": {
                var address = "0x" + this.memory[this.pc + 2] + this.memory[this.pc + 1];
                address = parseInt(address);
                var tempH = parseInt("0x" + this.registers[REGISTER_INDEXES.H].toString("16") + "00");
                var tempL = parseInt("0x" + this.registers[REGISTER_INDEXES.L].toString("16"));
                var val = tempH | tempL;
                this.memory[address] = val.toString("16");
                this.pc = this.pc + 3;
                return;
            }
            // INX H
            // Increment the HL pair by 1
            case "23": {
                var tempResult = parseInt("0x" + this.registers[REGISTER_INDEXES.H].toString(16) + "00") | parseInt("0x" + this.registers[REGISTER_INDEXES.L].toString(16));

                var result = toByteArray((tempResult + 1).toString(16));
                this.registers[REGISTER_INDEXES.H] = parseInt("0x" + result[0]);
                this.registers[REGISTER_INDEXES.L] = parseInt("0x" + result[1]);
                break;
            }
            case "24": {console.log(`not implemented ` + opCode);break;}
            case "25": {console.log(`not implemented ` + opCode);break;}
            // MVI L
            // Moves a byte into the L register
            // Were going to put H in as were doing big endian and H
            // has the most significant bit
            case "26": {
                var theByte = parseInt("0x" + this.memory[this.pc + 1]);
                this.registers[REGISTER_INDEXES.H] = theByte;
                this.pc = this.pc + 2;
                return;
            }
            case "27": {break;}
            case "28": {break;}
            // DAD 
            // doubles the values of HL
            case "29": {

                let hHexPre = this.registers[REGISTER_INDEXES.H].toString("16");
                if(hHexPre.length == 1) {
                    hHexPre = "0" + hHexPre;
                }

                var hHex = "0x" + hHexPre + "00";
                if(this.registers[REGISTER_INDEXES.H] == 0) {
                    hHex = hHex + "0";
                }

                let lHexPre = this.registers[REGISTER_INDEXES.L].toString("16");
                if(lHexPre.length == 1) {
                    lHexPre = "0" + lHexPre;
                }
                var lHex = "0x" + lHexPre;

                var result = (parseInt(hHex) | parseInt(lHex)) * 2;
                this.conditionBits.zeroBit = result == 0 ? 1: 0;
                if(result & 0x80) {
                    this.conditionBits.sign = 1;
                }
                else {
                    this.conditionBits.sign = 0;
                }
                if(result > 255) {
                    this.conditionBits.carry = 1;
                }
                else {
                    this.conditionBits.carry = 0;
                }

                this.setParityBit(result & 0xff, 8);

                var bytes = toByteArray(result.toString("16"));
                if(bytes.length == 1) {
                    this.registers[REGISTER_INDEXES.L] = parseInt("0x" + bytes[0]);
                }
                else {
                    this.registers[REGISTER_INDEXES.H] = parseInt("0x" + bytes[0]);
                    this.registers[REGISTER_INDEXES.L] = parseInt("0x" + bytes[1]);
                }
                
                break;
            }
            case "2a": {
                this.registers[REGISTER_INDEXES.H] = parseInt("0x" + this.memory[this.pc + 2]);
                this.registers[REGISTER_INDEXES.L] = parseInt("0x" + this.memory[this.pc + 1]);
                // Move the PC past the data
                this.pc = this.pc + 3;
                return;
            }
            case "2b": {console.log(`not implemented ` + opCode);break;}
            case "2c": {console.log(`not implemented ` + opCode);break;}
            case "2d": {console.log(`not implemented ` + opCode);break;}
            case "2e": {
                this.registers[REGISTER_INDEXES.L] = parseInt("0x" + this.memory[this.pc + 1]);
                this.pc = this.pc + 2;
                return;
            }
            case "2f": {console.log(`not implemented ` + opCode);break;}
            case "30": {console.log(`not implemented ` + opCode);break;}
            // LXI SP
            // Points the stack pointer to a certain memory address
            case "31": {
                var address = "0x" + this.memory[this.pc + 2] + this.memory[this.pc +1];
                this.sp = parseInt(address);
                this.pc = this.pc + 3;
                return;
            }
            // STA adr - Stores the accumulator in the arg address
            case "32": 
            {
                var address = "0x" + this.memory[this.pc + 2] + this.memory[this.pc + 1];
                address = parseInt(address);
                this.memory[address] = this.registers[REGISTER_INDEXES.ACC].toString("16");
                this.pc = this.pc + 3;
                return;
            }
            case "33": {console.log(`not implemented ` + opCode);break;}
            case "34": {console.log(`not implemented ` + opCode);break;}
            // DCR M
            // Decrements the value stored in HL by 1
            case "35": {
                //console.log(`not implemented ` + opCode);
                var hHex = "0x" + this.registers[REGISTER_INDEXES.H].toString("16") + "00";
                var lHex = "0x" + this.registers[REGISTER_INDEXES.L].toString("16");

                var hl = parseInt(hHex) | parseInt(lHex);

                hl = hl -1;
                this.setConditionBits(hl, 16);
                var byteResult = toByteArray(hl.toString("16"));
                if(byteResult.length == 1) {
                    this.registers[REGISTER_INDEXES.L] = parseInt("0x" + byteResult[0]);
                }
                else {
                    this.registers[REGISTER_INDEXES.H] = parseInt("0x" + byteResult[0]);
                    this.registers[REGISTER_INDEXES.L] = parseInt("0x" + byteResult[1]);
                } 

                // break;
            }
            // MVI M
            // Load the byte into registers H and L
            case "36": {
                var address = getHexAddress(this.registers[REGISTER_INDEXES.H], this.registers[REGISTER_INDEXES.L]);
                this.memory[parseInt(address)] = this.memory[this.pc+ 1];                
                this.pc = this.pc + 2;
                return;
            }
            case "37": {this.conditionBits.carry = 1; 
                break;}
            case "38": {console.log(`not implemented ` + opCode);break;}
            case "39": {console.log(`not implemented ` + opCode);break;}
            // LDA address
            // loads the memory at address arg into the accumulator
            case "3a": {
                var address = "0x" + this.memory[this.pc + 2] + this.memory[this.pc + 1];
                var data = this.memory[parseInt(address)] ?? "00";
                this.registers[REGISTER_INDEXES.ACC] = parseInt("0x" + data);
                this.pc = this.pc + 3;
                return;
            }
            case "3b": {console.log(`not implemented ` + opCode);break;}
            case "3c": {console.log(`not implemented ` + opCode);break;}
            case "3d": {
                var tempInt = this.registers[REGISTER_INDEXES.ACC];
                if(tempInt == 0) {
                    this.conditionBits.zeroBit = 0;
                    tempInt = parseInt("0xff");
                }
                else {
                    tempInt = tempInt - 1;
                    if(tempInt == 0) {
                        this.conditionBits.zeroBit = 1;
                    }
                    else {
                        this.conditionBits.zeroBit = 0;
                    }
                }

                // console.log(`TEMP: ${tempInt}`);
                this.registers[REGISTER_INDEXES.ACC] = tempInt;
                break;
            }
            // MVI A
            // Moves a byte into the accumulator
            case "3e": {
                var arg = parseInt("0x" + this.memory[this.pc + 1]);
                this.registers[REGISTER_INDEXES.ACC] = arg;
                this.pc = this.pc + 2;
                return;
            }
            case "3f": {console.log(`not implemented ` + opCode);break;}
            case "40": {console.log(`not implemented ` + opCode);break;}
            case "41": {console.log(`not implemented ` + opCode);break;}
            case "42": {console.log(`not implemented ` + opCode);break;}
            case "43": {console.log(`not implemented ` + opCode);break;}
            case "44": {console.log(`not implemented ` + opCode);break;}
            case "45": {console.log(`not implemented ` + opCode);break;}
            case "46": {
                var address = getHexAddress(this.registers[REGISTER_INDEXES.H], this.registers[REGISTER_INDEXES.L]);
                this.registers[REGISTER_INDEXES.B] = parseInt("0x" + this.memory[parseInt(address)]);
                break;
            }
            case "47": {console.log(`not implemented ` + opCode);break;}
            case "48": {console.log(`not implemented ` + opCode);break;}
            case "49": {console.log(`not implemented ` + opCode);break;}
            case "4a": {console.log(`not implemented ` + opCode);break;}
            case "4b": {console.log(`not implemented ` + opCode);break;}
            case "4c": {console.log(`not implemented ` + opCode);break;}
            case "4d": {console.log(`not implemented ` + opCode);break;}
            case "4e": {console.log(`not implemented ` + opCode);break;}
            case "4f": {
                this.registers[REGISTER_INDEXES.C] = this.registers[REGISTER_INDEXES.ACC];    
                break;
            }
            case "50": {console.log(`not implemented ` + opCode);break;}
            case "51": {console.log(`not implemented ` + opCode);break;}
            case "52": {console.log(`not implemented ` + opCode);break;}
            case "53": {console.log(`not implemented ` + opCode);break;}
            case "54": {console.log(`not implemented ` + opCode);break;}
            case "55": {console.log(`not implemented ` + opCode);break;}
            // MOV DM
            // Moves the value HL is pointing to into register D
            case "56": {
                var address = getHexAddress(this.registers[REGISTER_INDEXES.H], this.registers[REGISTER_INDEXES.L]);
                this.registers[REGISTER_INDEXES.D] = parseInt("0x" + this.memory[parseInt(address)]);
                break;
            }
            case "57": {
                this.registers[REGISTER_INDEXES.D] = this.registers[REGISTER_INDEXES.ACC];    
                break;
            }
            case "58": {console.log(`not implemented ` + opCode);break;}
            case "59": {console.log(`not implemented ` + opCode);break;}
            case "5a": {console.log(`not implemented ` + opCode);break;}
            case "5b": {console.log(`not implemented ` + opCode);break;}
            case "5c": {console.log(`not implemented ` + opCode);break;}
            case "5d": {console.log(`not implemented ` + opCode);break;}
            // MOV whatevers in HL into Register E
            case "5e": {
                //debugger;
                var address = getHexAddress(this.registers[REGISTER_INDEXES.H], this.registers[REGISTER_INDEXES.L]);
                this.registers[REGISTER_INDEXES.E] = parseInt("0x" + this.memory[parseInt(address)]);
                break;
            }
            case "5f": {
                this.registers[REGISTER_INDEXES.E] = this.registers[REGISTER_INDEXES.ACC];    
                break;
            }
            case "60": {console.log(`not implemented ` + opCode);break;}
            case "61": {console.log(`not implemented ` + opCode);break;}
            case "62": {console.log(`not implemented ` + opCode);break;}
            case "63": {console.log(`not implemented ` + opCode);break;}
            case "64": {console.log(`not implemented ` + opCode);break;}
            case "65": {console.log(`not implemented ` + opCode);break;}
            // MOV H,M
            // Moves what HL is pointing to into H
            case "66": {
                var address = getHexAddress(this.registers[REGISTER_INDEXES.H], this.registers[REGISTER_INDEXES.L]);
                this.registers[REGISTER_INDEXES.H] = parseInt("0x" +  this.memory[parseInt(address)]);
                break;
            }
            case "67": {
                this.registers[REGISTER_INDEXES.H] = this.registers[REGISTER_INDEXES.ACC];    
                break;
            }
            case "68": {console.log(`not implemented ` + opCode);break;}
            case "69": {console.log(`not implemented ` + opCode);break;}
            case "6a": {console.log(`not implemented ` + opCode);break;}
            case "6b": {console.log(`not implemented ` + opCode);break;}
            case "6c": {console.log(`not implemented ` + opCode);break;}
            case "6d": {console.log(`not implemented ` + opCode);break;}
            case "6e": {console.log(`not implemented ` + opCode);break;}
            // MOV L,A 
            // moves the accumulator into L
            case "6f": {
                this.registers[REGISTER_INDEXES.L] = this.registers[REGISTER_INDEXES.ACC];    
                break;
            }
            case "70": {console.log(`not implemented ` + opCode);break;}
            case "71": {console.log(`not implemented ` + opCode);break;}
            case "72": {console.log(`not implemented ` + opCode);break;}
            case "73": {console.log(`not implemented ` + opCode);break;}
            case "74": {console.log(`not implemented ` + opCode);break;}
            case "75": {console.log(`not implemented ` + opCode);break;}
            case "76": {console.log(`not implemented ` + opCode);break;}
            // MOV M,A
            // Moves whatevers in the accumulator into the memory 
            // at the address currently stored in HL
            case "77": {
                if(this.pc.toString("16") != "1443") {
                   //  debugger;
                }
                var address = getHexAddress(this.registers[REGISTER_INDEXES.H], this.registers[REGISTER_INDEXES.L]);
                let a = this.registers[REGISTER_INDEXES.ACC].toString("16");
                if(a == undefined) {
                   // debugger;
                }
                this.memory[parseInt(address)] = this.registers[REGISTER_INDEXES.ACC].toString("16");
                break;
            }
            case "78": {console.log(`not implemented ` + opCode);break;}
            case "79": {
                this.registers[REGISTER_INDEXES.ACC] = this.registers[REGISTER_INDEXES.C]
                break;
            }
            // MOV A,D
            // Moves D into the ACC register
            case "7a": {
                this.registers[REGISTER_INDEXES.ACC] = this.registers[REGISTER_INDEXES.D];
                break;
            }
            // MOV A,E
            // Moves E into the ACC register
            case "7b": {
                this.registers[REGISTER_INDEXES.ACC] = this.registers[REGISTER_INDEXES.E];    
                break;
            }
            // MOV A,H
            // Moves whats currently in REGISTER HL into the accumulator
            // Because Ive gone for Big Endian we'll be passing L into the accumulator
            case "7c": {
                this.registers[REGISTER_INDEXES.ACC] = this.registers[REGISTER_INDEXES.H];
                break;
            }
            case "7d": {
                this.registers[REGISTER_INDEXES.ACC] = this.registers[REGISTER_INDEXES.L];
                break;
            }
            // MOV HL into the accumulator
            case "7e": {
                var address = getHexAddress(this.registers[REGISTER_INDEXES.H], this.registers[REGISTER_INDEXES.L]);
                this.registers[REGISTER_INDEXES.ACC] = parseInt("0x" + this.memory[parseInt(address)]);
                break;
            }
            case "7f": {debugger;break;}
            case "80": {console.log(`not implemented ` + opCode);console.log(`not implemented ` + opCode);break;}
            case "81": {console.log(`not implemented ` + opCode);break;}
            case "82": {console.log(`not implemented ` + opCode);break;}
            case "83": {console.log(`not implemented ` + opCode);break;}
            case "84": {console.log(`not implemented ` + opCode);break;}
            case "85": {console.log(`not implemented ` + opCode);break;}
            case "86": {console.log(`not implemented ` + opCode);break;}
            case "87": {console.log(`not implemented ` + opCode);break;}
            case "88": {console.log(`not implemented ` + opCode);break;}
            case "89": {console.log(`not implemented ` + opCode);break;}
            case "8a": {console.log(`not implemented ` + opCode);break;}
            case "8b": {console.log(`not implemented ` + opCode);break;}
            case "8c": {console.log(`not implemented ` + opCode);break;}
            case "8d": {console.log(`not implemented ` + opCode);break;}
            case "8e": {console.log(`not implemented ` + opCode);break;}
            case "8f": {console.log(`not implemented ` + opCode);break;}
            case "90": {console.log(`not implemented ` + opCode);break;}
            case "91": {console.log(`not implemented ` + opCode);break;}
            case "92": {console.log(`not implemented ` + opCode);break;}
            case "93": {console.log(`not implemented ` + opCode);break;}
            case "94": {console.log(`not implemented ` + opCode);break;}
            case "95": {console.log(`not implemented ` + opCode);break;}
            case "96": {console.log(`not implemented ` + opCode);break;}
            case "97": {console.log(`not implemented ` + opCode);break;}
            case "98": {console.log(`not implemented ` + opCode);break;}
            case "99": {console.log(`not implemented ` + opCode);break;}
            case "9a": {console.log(`not implemented ` + opCode);break;}
            case "9b": {console.log(`not implemented ` + opCode);break;}
            case "9c": {console.log(`not implemented ` + opCode);break;}
            case "9d": {console.log(`not implemented ` + opCode);break;}
            case "9e": {console.log(`not implemented ` + opCode);break;}
            case "9f": {console.log(`not implemented ` + opCode);break;}
            case "a0": {console.log(`not implemented ` + opCode);break;}
            case "a1": {console.log(`not implemented ` + opCode);break;}
            case "a2": {console.log(`not implemented ` + opCode);break;}
            case "a3": {console.log(`not implemented ` + opCode);break;}
            case "a4": {console.log(`not implemented ` + opCode);break;}
            case "a5": {console.log(`not implemented ` + opCode);break;}
            case "a6": {console.log(`not implemented ` + opCode);break;}
            // AND the aconsole.log(`not implemented ` + opCode);ccumulator with itself
            // I'm not entirely sure the point unless we're doing something
            // with the condition bits based off of this
            case "a7": {
                var tempAcc = this.registers[REGISTER_INDEXES.ACC];
                var result = tempAcc & tempAcc;
                this.setConditionBits(result, 8);
                this.registers[REGISTER_INDEXES.ACC] = result;
                break;
            }
            case "a8": {console.log(`not implemented ` + opCode);break;}
            case "a9": {console.log(`not implemented ` + opCode);break;}
            case "aa": {console.log(`not implemented ` + opCode);break;}
            case "ab": {console.log(`not implemented ` + opCode);break;}
            case "ac": {console.log(`not implemented ` + opCode);break;}
            case "ad": {console.log(`not implemented ` + opCode);break;}
            case "ae": {console.log(`not implemented ` + opCode);break;}
            // XOR the accumulator with itself 
            // I'm not entirely sure the point unless we're doing something
            // with the condition bits based off of this
            case "af": {
                var tempAcc = this.registers[REGISTER_INDEXES.ACC];
                var result = tempAcc ^ tempAcc;
                this.setConditionBits(result, 8);
                this.registers[REGISTER_INDEXES.ACC] = result;
                break;
            }
            case "b0": {
                var acc = this.registers[REGISTER_INDEXES.ACC];
                var arg = this.registers[REGISTER_INDEXES.B];

                var result = acc | arg;

                this.setConditionBits(result, 8);

                break;
            }
            case "b1": {console.log(`not implemented ` + opCode);break;}
            case "b2": {console.log(`not implemented ` + opCode);break;}
            case "b3": {console.log(`not implemented ` + opCode);break;}
            case "b4": {console.log(`not implemented ` + opCode);break;}
            case "b5": {console.log(`not implemented ` + opCode);break;}
            case "b6": {
                let hHexPre = this.registers[REGISTER_INDEXES.H].toString("16");
                if(hHexPre.length == 1) {
                    hHexPre = "0" + hHexPre;
                }

                var hHex = "0x" + hHexPre + "00";
                if(this.registers[REGISTER_INDEXES.H] == 0) {
                    hHex = hHex + "0";
                }

                let lHexPre = this.registers[REGISTER_INDEXES.L].toString("16");
                if(lHexPre.length == 1) {
                    lHexPre = "0" + lHexPre;
                }
                var lHex = "0x" + lHexPre;

                var acc = this.registers[REGISTER_INDEXES.ACC];
                var result = acc | (parseInt(hHex) | parseInt(lHex))
                
                this.setConditionBits(result, 8);

                break;
            }
            case "b7": {console.log(`not implemented ` + opCode);break;}
            case "b8": {console.log(`not implemented ` + opCode);break;}
            case "b9": {console.log(`not implemented ` + opCode);break;}
            case "ba": {console.log(`not implemented ` + opCode);break;}
            case "bb": {console.log(`not implemented ` + opCode);break;}
            case "bc": {console.log(`not implemented ` + opCode);break;}
            case "bd": {console.log(`not implemented ` + opCode);break;}
            case "be": {console.log(`not implemented ` + opCode);break;}
            case "bf": {console.log(`not implemented ` + opCode);break;}
            case "c0": {
                if(!this.conditionBits.zeroBit) {
                    var address = "0x" + this.memory[this.sp + 1] + this.memory[this.sp];
                    this.sp = this.sp + 2;
                    // Our program counter is going to be pointed to CALL we need to add 3
                    // To jump past the CALLs address arguments 
                    this.pc = parseInt(address) + 3;
                    return;
                }
                break;
            }
            // POP BC off the stack and into the registers
            case "c1": {
                this.registers[REGISTER_INDEXES.C] = parseInt("0x" + this.memory[this.sp]);
                this.sp = this.sp + 1;
                this.registers[REGISTER_INDEXES.B] = parseInt("0x" + this.memory[this.sp]);
                this.sp = this.sp + 1;
                break;
            }
            // JNZ adr
            // if the zeroBit is not set to 1
            // set the PC to a certain address.
            case "c2": {
                if(!this.conditionBits.zeroBit) {
                   var address = "0x" + this.memory[this.pc + 2] + this.memory[this.pc + 1]; 
                   this.pc = parseInt(address);
                }
                // Point the pointer counter past our JNZs arguments
                else {
                    this.pc = this.pc + 3;
                }
                return;    
            }
            // JMP adr
            // JMP to a certain address in memory
            case "c3": {
                // hex address
                var address = "0x" + this.memory[this.pc + 2] + this.memory[this.pc +1];
                this.pc = parseInt(address);
                return;
            }
            case "c4": {break;}
            // PUSH BC onto the stack
            case "c5": {
                this.sp = this.sp -1;
                this.memory[this.sp] = this.registers[REGISTER_INDEXES.B].toString("16");
                this.sp = this.sp - 1;
                this.memory[this.sp] = this.registers[REGISTER_INDEXES.C].toString("16");

                break;
            }
            // ADI D8 
            // Adds byte arg to the accumulator
            case "c6": {
                var acc = this.registers[REGISTER_INDEXES.ACC];
                var arg = parseInt("0x" + this.memory[this.pc + 1]);

                var result = acc + arg;
                this.setConditionBits(result);
                this.registers[REGISTER_INDEXES.ACC] = result;
                this.pc = this.pc + 2;
                return;
            }
            case "c7": {break;}
            case "c8": {
                if(this.conditionBits.zeroBit == 1) {
                    var address = "0x" + this.memory[this.sp + 1] + this.memory[this.sp];
                    this.sp = this.sp + 2;
                    // Our program counter is going to be pointed to CALL we need to add 3
                    // To jump past the CALLs address arguments 
                    this.pc = parseInt(address) + 3;
                    return;
                }
                break;
            }
            // RET
            // Return out of a procedure
            // Increment the stack pointer by 2, grab the address
            // and set the PC to it
            case "c9": {
                var address = "0x" + this.memory[this.sp + 1] + this.memory[this.sp];
             //   console.log(address);
                this.sp = this.sp + 2;
                // Our program counter is going to be pointed to CALL we need to add 3
                // To jump past the CALLs address arguments 
                this.pc = parseInt(address) + 3;
                return;
            }
            case "ca": {
                var address = "0x" + this.memory[this.pc + 2] + this.memory[this.pc + 1]; 
                // JP if zero
                if(this.conditionBits.zeroBit) {
                    this.pc = parseInt(address);
                    return;
                }
                else {
                    this.pc = this.pc + 3;
                    return;
                }
            
            }
            case "cb": {console.log(`not implemented ` + opCode);break;}
            case "cc": {console.log(`not implemented ` + opCode);break;}
            // CALL
            // Calls a certain sub routine
            case "cd": {
                // decrement the stack pointer by one so we don't overwrite
                this.sp = this.sp - 1;
                // We are going to store our current pc in the stack as hex
                var currentAddress = this.pc.toString("16");
                var byteArr = toByteArray(currentAddress);
                this.memory[this.sp] = byteArr[0];
                this.sp = this.sp - 1;
                this.memory[this.sp] = byteArr[1];
                var address = "0x" + this.memory[this.pc + 2] + this.memory[this.pc + 1];
                this.pc = parseInt(address); 
                return;
            }
            case "ce": {console.log(`not implemented ` + opCode);break;}
            case "cf": {console.log(`not implemented ` + opCode);break;}
            case "d0": {
                
                if(this.conditionBits.carry == 0) {
                    console.log(this.pc);
                    var address = "0x" + this.memory[this.sp + 1] + this.memory[this.sp];
                    this.sp = this.sp + 2;
                    // Our program counter is going to be pointed to CALL we need to add 3
                    // To jump past the CALLs address arguments 
                    this.pc = parseInt(address) + 3;
                    return;
                }
                else {
                    console.log('here');
                }
                
                break;
            }
            // POP D
            // Populate the DE registers with the next 2 items on the stack
            case "d1": {
                this.registers[REGISTER_INDEXES.E] = parseInt("0x" + this.memory[this.sp]);
                this.sp = this.sp + 1;

                this.registers[REGISTER_INDEXES.D] = parseInt("0x" + this.memory[this.sp]);
                this.sp = this.sp + 1;
                break;
            }
            case "d2": {
                if (!this.conditionBits.carry) {
                    var address = "0x" + this.memory[this.pc + 2] + this.memory[this.pc + 1]; 
                    this.pc = parseInt(address);
                } else {
                    this.pc = this.pc + 3;
                }
                return;
            }
            case "d3": {
                // Output to the bus?
                this.pc = this.pc + 2;    
                return;
            }
            case "d4": {console.log(`not implemented ` + opCode);break;}
            // PUSH D
            // Pushes the register pair DE onto the stack
            case "d5": {
                var dHex = this.registers[REGISTER_INDEXES.D].toString("16");
                var eHex = this.registers[REGISTER_INDEXES.E].toString("16");

                this.sp = this.sp - 1;
                this.memory[this.sp] = dHex;
                this.sp = this.sp - 1;
                this.memory[this.sp] = eHex;
                break;
            }
            case "d6": {
               
                var arg = parseInt("0x" + this.memory[this.pc + 1]);
                var accVal = parseInt("0x" + this.registers[REGISTER_INDEXES.ACC]);
                var result = arg - accVal;
                this.registers[REGISTER_INDEXES.ACC] = result.toString("16");
                this.setConditionBits(result, 8);
                this.pc = this.pc + 2;
                return;
            }
            case "d7": {console.log(`not implemented ` + opCode);break;}
            case "d8": {
                if(this.conditionBits.carry == 1) {
                    var address = "0x" + this.memory[this.sp + 1] + this.memory[this.sp];
                    this.sp = this.sp + 2;
                    // Our program counter is going to be pointed to CALL we need to add 3
                    // To jump past the CALLs address arguments 
                    this.pc = parseInt(address) + 3;
                    return;
                }
                
                break;
            }
            case "d9": {console.log(`not implemented ` + opCode);break;}
            // If CY set to 1 jump to address argument
            case "da": {
                if(this.conditionBits.carry == 1) {
                    var address = "0x" + this.memory[this.pc + 2] + this.memory[this.pc + 1];
                    this.pc = parseInt(address);
                    return;
                }
                this.pc = this.pc + 3;
                return;
            }
            // Not implemented
            case "db": {
                // Controller input
                this.registers[REGISTER_INDEXES.ACC] = 3; 
                this.pc = this.pc + 2;
                return;
            }
            case "dc": {console.log(`not implemented ` + opCode);break;}
            case "dd": {console.log(`not implemented ` + opCode);break;}
            case "de": {console.log(`not implemented ` + opCode);break;}
            case "df": {console.log(`not implemented ` + opCode);break;}
            case "e0": {console.log(`not implemented ` + opCode);break;}
            // POP 
            // pops whats currently on the stack into the HL registers
            case "e1": {
                this.registers[REGISTER_INDEXES.L] = parseInt("0x" + this.memory[this.sp]);
                this.sp = this.sp + 1;
                this.registers[REGISTER_INDEXES.H] = parseInt("0x" + this.memory[this.sp]);
                this.sp = this.sp + 1;
                break;
            }
            case "e2": {console.log(`not implemented ` + opCode);break;}
            case "e3": {console.log(`not implemented ` + opCode);break;}
            case "e4": {console.log(`not implemented ` + opCode);break;}
            // PUSH H
            // Pushes the contents of registers HL onto the stack
            case "e5": {
                var hHex = this.registers[REGISTER_INDEXES.H].toString("16");
                var lHex = this.registers[REGISTER_INDEXES.L].toString("16");
                this.sp = this.sp -1;
                this.memory[this.sp] = hHex;
                this.sp = this.sp - 1;
                this.memory[this.sp] = lHex;
                break;
            }
            // ANI D8
            // ANDs the accumulator with byte arg passed in 
            case "e6": {
                var acc = this.registers[REGISTER_INDEXES.ACC];
                var arg = parseInt("0x" + this.memory[this.pc + 1]);

                var result = acc & arg;

                this.setConditionBits(result, 8);

                this.registers[REGISTER_INDEXES.ACC] = result;
                this.pc = this.pc + 2;
                return;
            }
            case "e7": {console.log(`not implemented ` + opCode);break;}
            case "e8": {console.log(`not implemented ` + opCode);break;}
            case "e9": {console.log(`not implemented ` + opCode);break;}
            case "ea": {console.log(`not implemented ` + opCode);break;}
            // XCHG 
            // swaps the contents between DE and HL
            case "eb": {
                var tempD = this.registers[REGISTER_INDEXES.D];
                var tempE = this.registers[REGISTER_INDEXES.E];

                this.registers[REGISTER_INDEXES.D] = this.registers[REGISTER_INDEXES.H];
                this.registers[REGISTER_INDEXES.E] = this.registers[REGISTER_INDEXES.L];

                this.registers[REGISTER_INDEXES.H] = tempD;
                this.registers[REGISTER_INDEXES.L] = tempE;
                break;
            }
            case "ec": {console.log(`not implemented ` + opCode);break;}
            case "ed": {console.log(`not implemented ` + opCode);break;}
            case "ee": {console.log(`not implemented ` + opCode);break;}
            case "ef": {
                console.log(`not implemented ` + opCode);
                break;
            }
            case "f0": {console.log(`not implemented ` + opCode);break;}
            // POP PSW
            // Pops the PSW flags and the ACC off the stack
            case "f1": {
                var accVal = parseInt("0x" + this.memory[this.sp])
                this.registers[REGISTER_INDEXES.ACC] = accVal;
                this.sp = this.sp + 1;

                var pswFlags = parseInt("0x" + this.memory[this.sp]);
                this.conditionBits.zeroBit = pswFlags >> 4 & 1;
                this.conditionBits.sign = pswFlags >> 3 & 1;
                this.conditionBits.parBit = pswFlags >> 2 & 1;
                this.conditionBits.carry = pswFlags >> 1 & 1;
                this.conditionBits.auxCarry = pswFlags & 1;
                this.sp = this.sp + 1;
                break;
            }
            case "f2": {console.log(`not implemented ` + opCode);break;}
            case "f3": {console.log(`not implemented ` + opCode);break;}
            case "f4": {console.log(`not implemented ` + opCode);break;}
            // PUSH PSW
            // Pushes the conditional flags and ACC onto the stack
            case "f5": {
                var psw = (this.conditionBits.auxCarry | this.conditionBits.carry << 1 | 
                    this.conditionBits.parBit << 2 | this.conditionBits.sign << 3 | this.conditionBits.zeroBit << 4);
                this.sp = this.sp - 1;
                this.memory[this.sp] = psw.toString("16");
                this.sp = this.sp - 1;
                this.memory[this.sp] = this.registers[REGISTER_INDEXES.ACC].toString("16");
                break;
            }
            case "f6": {console.log(`not implemented ` + opCode);break;}
            case "f7": {console.log(`not implemented ` + opCode);break;}
            case "f8": {console.log(`not implemented ` + opCode);break;}
            case "f9": {console.log(`not implemented ` + opCode);break;}
            case "fa": {console.log(`not implemented ` + opCode);break;}
            case "fb": {
                break;}
            case "fc": {console.log(`not implemented ` + opCode);break;}
            case "fd": {console.log(`not implemented ` + opCode);break;}
            // CPI - Compares the accumulator value with 
            // argument byte
            case "fe": {
                var tempAcc = this.registers[REGISTER_INDEXES.ACC];
                var arg = parseInt("0x" + this.memory[this.pc + 1]);
                var result = tempAcc - arg;
                result == 0 ? this.conditionBits.zeroBit = 1 : this.conditionBits.zeroBit = 0;
                // Bit 7 is the sign bit. If we AND our result with 128 we know if the sign bit was on
                this.conditionBits.sign = result == (result & 0x80);
                // If the arg is greater than the ACC val the carry bit will be set
                this.conditionBits.carry = tempAcc < arg || tempAcc == 255 ? 1 : 0;
                this.setParityBit(result, 8);
                this.pc = this.pc + 2;
                return;
            }
            case "ff": {console.log(`not implemented ` + opCode);break;}
            default: {
                console.log('wtf');
            }
        }
        
        this.pc = this.pc + 1;
    }

    // The parity flag is used to tell if a numbers got an odd amount of bits or even
    Intel8080.prototype.setParityBit = function(val, totalBits) {

        var bitCounter = 0;
        for(var i = 0; i < totalBits; i++) {
            if(val & 0x1) {
                bitCounter = bitCounter + 1;
            }
            val = val >> 1;
        }

        this.conditionBits.parBit = bitCounter % 2 == 0 ? 1: 0;
    }

    Intel8080.prototype.setConditionBits = function(result, noOfBits) {
        this.conditionBits.zeroBit = result == 0 ? 1 : 0;
        if(result & 0x80) {
            this.conditionBits.sign = 1;
        }
        else {
            this.conditionBits.sign = 0;
        }
        if(result > 255) {
            this.conditionBits.carry = 1;
        }
        else {
            this.conditionBits.carry = 0;
        }

        this.setParityBit(result, noOfBits);
    }

    function getHexAddress(highestByte, lowestByte) {
        var tempA = parseInt("0x" + highestByte.toString("16") + "00");
        var tempB = parseInt("0x00" + lowestByte.toString("16"));
        var tempC = tempA | tempB;
        return "0x" + tempC.toString("16");
    }

    function toByteArray(hex) {
        if(hex.length % 2 != 0) {
            hex = "0" + hex;
        }
        var result = [];
        for(var i = 0; i < hex.length; i = i+2) {
            result.push(hex.slice(i, i+2));
        }
        return result;
    }

    return Intel8080;

})();


var invadersDump = "000000c3d4180000f5c5d5e5c38c0000f5c5d5e53e8032722021c02035cdcd17db010fda67003aea20a7ca42003aeb20fe99ca3e00c6012732eb20cd4719af32ea203ae920a7ca82003aef20a7c26f003aeb20a7c25d00cdbf0ac382003a9320a7c28200c365073e0132ea20c33f00cd40173a3220328020cd0001cd4802cd130900e1d1c1f1fbc900000000af3272203ae920a7ca82003aef20a7c2a5003ac1200fd28200212020cd4b02cd4101c38200cd8608e57e23666f220920220b20e12b7efe03c2c8003d320820fefe3e00c2d3003c320d20c93e0232fb2132fb22c3e4080000000000000000000000000000000000000000000000000000000000002102207ea7c23815e53a06206f3a6720677ea7e1ca360123237e2346e6fe0707075f160021001c19eb78a7c43b012a0b200610cdd315af320020c921300019ebc93a6820a7c83a0020a7c03a6720673a062016023cfe37cca1016f4605c25401320620cd7a0161220b207dfe28da71197a3204203e01320020c916007d21092046234efe0bfa9401de0b5f78c610477b14c3830168a7c85f79c6104f7b3dc3950115cacd012106203600234e3600cdd9012105207e3ce60177af21672066c900210021063736012305c2c501c9e1c93e0106e0210224c3cc1423462379867723788677c906c011001b210020c3321a214221c3f8012142220e0411201dd5062ccd321ad10dc2fd01c93e01c31b023e01c31402af114222c31e02af1142213281200102162106283e04f5c53a8120a7c24202cd691ac1f13dc8d511e00219d1c32902cd7c14c335022110207efeffc8fefeca810223464fb079c27702237ea7c28802235e2356e5ebe5216f02e3d5e9e1110c0019c34b020504c27d023d05702b7711100019c34b02352b2bc38102e1237efeffca3b032335c047af3268203269203e30326a207836052335c29b032a1a200610cd241421102011101b0610cd321a0600cddc193a6d20a7c03aef20a7c8310024fbcdd719cd2e09a7ca6d16cde7187ea7ca2c033ace20a7ca2c033a6720f50fda3203cd0e02cd78087323722b2b7000cde401f10f3e210600d2120306203e22326720cdb60aaf32112078d3053c329820cdd609cd7f1ac3f907cd7f1ac31708cd0902c3f8020000002168203601237ea7c3b003002b36013a1b20473aef20a7c263033a1d200fda81030fda8e03c36f03cdc0170707da810307da8e03211820cd3b1acd471acd39143e00321220c978fed9ca6f033c321b20c36f0378fe30ca6f033d321b20c36f033ce6013215200707070721701c856f221820c36f03c24a032335c24a03c34603112a20cd061ae1d0237ea7c8fe01cafa03fe02ca0a0423fe03c22a0435ca36047efe0fc0e5cd3004cd5214e123342323353523353535233608cd3004c300143c773a1b20c608322a20cd3004c30014cd3004d5e5c5cd5214c1e1d13a2c20856f322920cd91143a6120a7c8320220c9fe05c8c33604212720c33b1acd3004cd521421252011251b0607cd321a2a8d202c7dfe63da53042e54228d202a8f202c228f203a8420a7c07ee601012902c26e0401e0fe218a2071232370c9e13a321b3232202a38207db4c28a042b223820c91135203ef9cd50053a46203270203a5620327120cd63053a7820a7213520c25b0511301b2130200610c3321ae13a6e20a7c03a8020fe01c01145203eedcd50053a36203270203a5620327120cd63053a7620fe10dae7043a481b3276203a7820a7214520c25b0511401b2140200610cd321a3a82203dc208053e01326e202a7620c37e06e11155203edbcd50053a46203270203a3620327120cd63053a7620fe15da34053a581b3276203a7820a7215520c25b0511501b2150200610cd321a2a7620225820c9327f20217320060bc3321a117320060bc3321a2173207ee680c2c1053ac120fe043a6920cab705a7c82336003a7020a7ca8905473acf20b8d03a7120a7ca9605473acf20b8d0237ea7ca1b062a76204e2300227620cd2f06d0cd7a0179c607677dd60a6f227b202173207ef680772334c9117c20cd061ad0237ee601c244062334cd75063a7920c603217f20bedae205d60c3279203a7b20473a7e2080327b20cd6c063a7b20fe15da12063a6120a7c83a7b20fe1eda1206fe2700d21206973215203a7320f601327320c93a1b20c60867cd6f1579fe0cdaa5050e0bc3a5050d3a6720676916057ea737c07dc60b6f15c23706c9217820357efe03c26706cd750621dc1c227920217c2035352b35353e06327d20c36c06a7c0c37506217920cd3b1ac39114217920cd3b1ac35214224820c9e13a8020fe02c02183207ea7ca0f053a5620a7c20f05237ea7c2ab063a8220fe08da0f053601cd3c07118a20cd061ad02185207ea7c2d606218a207e232386328a20cd3c07218a207efe28daf906fee1d2f906c906fecddc1923357efe1fca4b07fe18ca0c07a7c006ef2198207ea077e620d305000000cd4207cdcb14218320060acd5f0706fec3dc193e0132f1202a8d20460e0421501d114c1d1ab8ca280723130dc21d077e3287202600682929292922f220cd4207c3f108cd4207c33914218720cd3b1ac3471a06102198207eb077cd7017217c1d228720c33c0711831bc3321a3e01329320310024fbcd7919cdd60921133011f31f0e04cdf3083aeb203d2110280e14c2570811cf1acdf308db01e604ca7f070699af32ce203aeb20802732eb20cd471921000022f82022fc20cd2519cd2b19cdd7192101017c32ef2022e72022e520cd5619cdef01cdf501cdd10832ff2132ff22cdd700af32fe2132fe22cdc001cd041921783822fc2122fc22cde401cd7f1acd8d08cdd60900af32c120cdcf013a67200fda7208cd1302cdcf01cdb100cdd1190620cdfa18cd1816cd0a19cdf315cd88093a8220a7caef09cd0e17cd3509cdd808cd2c17cd590aca49080604cdfa18cd7517d306cd0418c31f0800000011ba1acdf3080698db010f0fda6d080fda9807c37f073e01c39b07cd1a02c314083a0820472a0920ebc386080000003a6720672efcc921112b11701b0e0ecdf3083a67200f3e1c211137d4ff083eb032c0203ac020a7c8e604c2bc08cdca09cd3119c3a9080620211c273a67200fdacb08211c39cdcb14c3a908db02e603c603c93a8220fe09d03efb327e20c93ace20a7c0211c390620c3cb140e031ad5cdff08d1130dc2f308c911001ee526006f29292919ebe10608d306c339143a0920fe78d02a91207db4c229092100063e013283202b229120c9cd11162eff7ec9cd10192b2b7ea7c80615db02e608ca48090610cdca09237eb8d8cd2e09347ef521012524243dc25809061011601ccd3914f13ccd8b1acd10192b2b36003eff3299200610c3fa1821a01dfe02d823fe04d823c9cdca093af120a7c8af32f120e52af220ebe17e8327775f237e8a277757237e23666fc3ad097acdb2097bd5f50f0f0f0fe60fcdc509f1e60fcdc509d1c9c61ac3ff083a67200f21f820d821fc20c92102243600237de61ffe1cdae809110600197cfe40dad909c9cd3c0aaf32e920cdd6093a6720f5cde401f13267203a672067e52efe7ee6073c7721a21d233dc2130a7ee12efc772336387c0fda330a3e21329820cdf501cd0419c30408cdef01cdc001c30408cd590ac2520a3e3032c0203ac020a7c8cd590aca470acd590ac2520ac93a1520feffc93aef20a7ca7c0a480608cdfa184178cd7c097e21f32036002b772b3601216220c93e0232c120d3063acb20a7ca850aaf32c120c9d51acdff08d13e0732c0203ac0203dc29e0a130dc2930ac9215020c34b023e40c3d70a3e80c3d70ae1c372003ac1200fdabb0a0fda68180fdaab0ac921142b0e0fc3930a32c0203ac020a7c2da0ac921c220060cc3321aafd303d305cd8219fbcdb10a3aec20a72117300e04c2e80b11fa1ccd930a11af1dcdcf0acdb10acd1518cdb60a3aec20a7c24a0b11951acde20acd800a11b01bcde20acd800acdb10a11c91fcde20acd800acdb10a21b733060acdcb14cdb60acdd6093aff21a7c25d0bcdd10832ff21cd7f1acde401cdc001cdef01cd1a023e0132c120cdcf01cd1816cdf10bd306cd590aca710baf322520cd590ac2830baf32c120cdb10acd88190e0c21112c11901fcdf3083aec20fe00c2ae0b2111333e02cdff08019c1fcd5618cd4c18db0207dac30b01a01fcd3a18cdb60a3aec20fe00c2da0b11d51fcde20acd800acd9e1821ec207e3ce60177cdd609c3df1811ab1dcd930ac30b0bcd0a19c39a19130008130e26020e0f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cd741400c5e51ad304db03b6772313afd304db03b677e101200009c105c20514c90000cd7414c5e5af77237723e101200009c105c22714c9c51a771301200009c105c23914c90000000000000000000000cd7414c5e51ad304db032fa6772313afd304db032fa677e101200009c105c25514c97de607d302c3471ac5e57e1213230dc27e14e101200009c105c27c14c9cd7414af326120c5e51ad304db03f5a6caa9143e01326120f1b6772313afd304db03f5a6cabd143e01326120f1b677e101200009c105c29814c9afc57701200009c105c2cc14c93a2520fe05c8fe02c03a2920fed847d230153a0220a7c878feced27915c606473a0920fe90d20415b8d2301568cd62153a2a2067cd6f152264203e05322520cd81157ea7ca30153600cd5f0acd3b1acdd3153e10320320c93e03322520c34a1521032035c02a64200610cd24143e04322520af32022006f7c3dc19000e00bcd49015bcd0c6100cc35a153a092065cd54154105de106fc93a0a20cd5415de1067c93e01328520c3451578070707808080813d6f3a672067c90cc610fa9015c93a0d20a7c2b71521a43ecdc515d006fe3e01320d20783208203a0e20320720c9212425cdc515d0cdf118afc3a91506177ea7c26b162305c2c715c900cd7414e5c5e51ad304db03772313afd304db0377e101200009c105c2d715e1c9cd11160100377ea7caff150c2305c2f91579328220fe01c0216b203601c92e003a672067c93a1520feffc02110207e2346b0c03a2520a7c03aef20a7ca52163a2d20a7c24816cdc017e610c83e01322520322d20c9cdc017e610c0322d20c921252036012aed20237dfe7eda63162e7422ed207e321d20c937c9afcd8b1acd10193600cdca092311f5201abe1b2b1aca8b16d29816c38f16bed298167e1213237e12cd50193ace20a7cac91621032811a61a0e14cd930a2525061b3a67200fdab716061c78cdff08cdb10acde7187ea7cac916c3ed0221182d11a61a0e0acd930acdb60acdd609af32ef20d305cdd119c3890b310024fbaf321520cdd8140604cdfa18cd590ac2ee16cdd719210127cdfa19afcd8b1a06fbc36b19cdca09237e11b81c21a11a0e04471ab8d2271723130dc21c177e32cf20c93a2520fe00c2391706fdc3dc190602c3fa180000219b2035cc6d173a6820a7ca6d1721962035c02198207ed3053a8220a7ca6d172b7e2b772b36013e04329b20c93a9820e630d305c93a9520a7caaa1721111a11211a3a8220bed28e172313c385171a3297202198207ee630477ee60f07fe10c2a4173e01b077af32952021992035c006efc3dc1906ef2198207ea077d305c9003a67200fd2ca17db01c9db02c9db02e604c83a9a20a7c03100240604cdd60905c2dc173e01329a20cdd719fb11bc1c2116300e04cd930acdb10aaf329a20329320c3c9162184207ea7ca0707237ea7c00601c3fa1821102811a31c0e15cdf3083e0a326c2001be1dcd5618da3718cd4418c32818cdb10a01cf1dcd5618d8cd4c18c33a18c50610cd3914c1c9c53a6c204fcd930ac1c90afeff37c86f030a67030a5f030a5703a7c921c22034234ecdd901473aca20b8ca98183ac220e6042acc20c288181130001922c72021c520cd3b1aebc3d3150000003e0132cb20c921502011c01b0610cd321a3e023280203eff327e203e0432c1203a5520e601cab8183a5520e601c2c0182111333e2600cdff08c3b60a3100240600cde601cd56193e0832cf20c3ea0a3a672021e7200fd023c906023a82203dc004c93a9420b0329420d303c9210022c3c301cdd814c3971521e7203a67200fd823c90e1c211e2411e41ac3f30821f820c3311921fc20c331195e2356237e23666fc3ad090e0721013511a91fc3f3083aeb2021013cc3b20921f420c33119cd5c1acd1a19cd2519cd2b19cd5019cd3c19c34719cddc19c371163e01326d20c3e616cdd719cd4719c33c1932c120c98b19c3d60921032811be190e13c3f308000000003a1e20a7c2ac19db01e676d672c03c321e20db01e676fe34c0211b2e11f70b0e09c3f30828130008130e26020e110f0e110013080e0d283e0132e920c9afc3d319003a9420a0329420d303c9210127cafa1911601c06104fcd3914793dc2ec190610cdcb147cfe35c2fa19c9217220461ae680a8c037c9322b241c16110d0a0807060504030201342e27221c181513100e0d0c0b090705ff1a77231305c2321ac95e2356237e234e2346616fc9c506037c1f677d1f6f05c24a1a7ce63ff62067c1c92100243600237cfe40c25f1ac9c5e51ab67713230dc26b1ae101200009c105c2691ac9cd2e09a7c8f53d77cde619f1210125e60fc3c50900000000ffb8fe201c109e00201c30100b080706000c04260e15041126260f0b001804112426251b260e11261c0f0b001804111226011413130e0d260e0d0b18261b0f0b001804112626011413130e0d262612020e1104241b252607083f12020e11042612020e1104241c25260100001000000000027838783800f8000080008e02ff050c601c203010010000000000bb030010901c2830010400ffff0000027604000000000004ee1c000003000000b604000001001d04e21c0000030000008206000001061d04d01c000003ff00c01c0000102101003000120000000f0b0018260f0b00180411241b25fc0001ffff00000020641dd0291802541d000800060000014000010000109e00201c000304781413081a3d68fcfc683d1a00000001b898a01b10ff00a01b000000000010000e05000000000007d01cc89b030000030478140b193a6dfafa6d3a190000000000000000000001000001741f008000000000001c2f00001c2700001c39000039797a6eecfafaec6e7a79390000000000781dbe6c3c3c3c6cbe1d78000000000000193a6dfafa6d3a19000000000000387a7f6decfafaec6d7f7a3800000000000e18be6d3d3c3d6dbe180e0000000000001a3d68fcfc683d1a0000000000000f1f1f1f1f7fff7f1f1f1f1f0f00000401130307b30f2f032f4904030001400805a30a035b0f27270b4b408411480f993c7e3dbc3e7c99271b1a260f0e080d13122812020e110426000315000d0204261300010b04280210203013080b130008492214814200428114224908000044aa1088542210aa442254884a15be3f5e2504fc0410fc1020fc2080fc8000fe0024fe1200fe0048fe900f0b002900000107010101040b01060301010b090208020b04070a050205040607080a060a03ff0fff1fff3fff7ffffffcfff8fff0fff0fff0fff0fff0fff0fff0fff8fffcffffffffffff7fff3fff1fff0f0510153094979a9d1005051015101005301010100515100500000000040c1e373e7c747e7e747c3e371e0c0400000000002200a54008983db63c361d104862b61d98084290080000261f1a1b1a1a1b1f1a1d1a1a10203060504848484040400f0b0018120f0002042626080d1500030411120e2c681d0c2c201c0a2c401c082c001cff0e2ee01d0c2eea1d0a2ef41d082e991cff2738260c181213041118271d1a260f0e080d1312271c1a260f0e080d13120000001f2444241f0000007f494949360000003e414141220000007f4141413e0000007f494949410000007f484848400000003e414145470000007f0808087f00000000417f4100000000020101017e0000007f081422410000007f010101010000007f2018207f0000007f1008047f0000003e4141413e0000007f484848300000003e4145423d0000007f484c4a31000000324949492600000040407f40400000007e0101017e0000007c0201027c0000007f020c027f000000631408146300000060100f106000000043454951610000003e4549513e00000000217f0100000000234549493100000042414959660000000c14247f04000000725151514e0000001e29494946000000404748506000000036494949360000003149494a3c000000081422410000000000412214080000000000000000000000141414141400000022147f142200000003047804030000241b260e11261c260f0b0018041112252626281b260f0b0018041126261b26020e080d2601010000010002010002010060100f106030181a3d68fcfc683d1a00080d120411132626020e080d0d2a501f0a2a621f072ae11fff021104030813260060100f106038193a6dfafa6d3a19000020404d50200000000000ffb8ff801f109700801f000001d022201c109400201c281c260f0b0018041112261c26020e080d120f141207260008080808080000";
//processor = new intel8080();  
//processor.setup(invadersDump);
window.onload = function() {
    window.processor = new intel8080();  
    window.processor.setup(invadersDump);
    this.theCanvas = document.getElementById("screen");
    this.context = this.theCanvas.getContext("2d");

    this.accEle = document.getElementById("acc");
    this.bEle = document.getElementById("b");
    this.cEle = document.getElementById("c");
    this.dEle = document.getElementById("d");
    this.eEle = document.getElementById("e");
    this.hEle = document.getElementById("h");
    this.lEle = document.getElementById("l");
    this.pcEle = document.getElementById("pc");


    var startAddress = document.getElementById("startAddress");
            var endAddress = document.getElementById("endAddress");

            // startAddress.value = "3501";
            // endAddress.value = "350a";
            // window.memoryDump();

    // setInterval(() => {
    //     render();
    //     window.processor.memory[8384] = window.processor.memory[8384] - 1;
    // }, 300);
}

function doSomething() {
    window.requestAnimationFrame(() => {
        render();
        window.processor.memory[8384] = window.processor.memory[8384] - 1;
        //window.processor.memory[8385] = "04";
        window.processor.cycle();
        doSomething();

    });
}



function render() {

    // console.log(`PC: ${processor.pc.toString("16")}    ACC: ${window.processor.registers[REGISTER_INDEXES.ACC].toString("16")}      B: ${processor.registers[REGISTER_INDEXES.B].toString("16")}     C: ${processor.registers[REGISTER_INDEXES.C].toString("16")}     D: ${processor.registers[REGISTER_INDEXES.D].toString("16")}      E: ${processor.registers[REGISTER_INDEXES.E].toString("16")}      H: ${processor.registers[REGISTER_INDEXES.H].toString("16")}       L: ${processor.registers[REGISTER_INDEXES.L].toString("16")}`)

    this.accEle.innerHTML = "ACC: " + window.processor.registers[REGISTER_INDEXES.ACC].toString("16");
    this.bEle.innerHTML = "B: " +  processor.registers[REGISTER_INDEXES.B].toString("16");
    this.cEle.innerHTML = "C: " + processor.registers[REGISTER_INDEXES.C].toString("16");
    this.dEle.innerHTML = "D: " + processor.registers[REGISTER_INDEXES.D].toString("16");
    this.eEle.innerHTML = "E: " + processor.registers[REGISTER_INDEXES.E].toString("16");
    this.hEle.innerHTML = "H: " + processor.registers[REGISTER_INDEXES.H].toString("16");
    this.lEle.innerHTML = "L: " + processor.registers[REGISTER_INDEXES.L].toString("16");
    this.pcEle.innerHTML = "PC: " + processor.pc.toString("16");
    
   // this.context.fillStyle = "rgba("+0+","+0+","+0+","+1+")";
  //  this.context.fillRect(20, 20, 100, 100);
    //return;
  // var imageData = this.context.createImageData(224, 256);
  this.context.imageSmoothingEnabled= false;
  this.context.fillStyle = "rgba("+0+","+0+","+0+","+1+")";
  this.context.fillRect(0,0, 224, 260);
    var counter = 9216;

    let pixY = 256;
    let pixX = 0;

    // loop up 256

    let theMult = 0;
    // debugger;
    for(var k = 0; k < 224; k++) {
        
        for(var l = 256; l > 0; l= l - 8) {
            var tempMem = window.processor.memory[counter];
            var val = parseInt("0x" + tempMem);
            if(val > 0) {
                // debugger;
            }
            for(var m = 0; m < 8; m++) {
                var theBit = val & 1;
                val = val >> 1;
                if(theBit & 1) {
                    // imageData.data[pixelCount] = 0x00;
                    // imageData.data[pixelCount + 1] = 0x00;
                    // imageData.data[pixelCount + 2] = 0x00;
                    // imageData.data[pixelCount + 3] = 0x00;
                    this.context.fillStyle = "rgba("+0+","+256+","+0+","+1+")";
                    this.context.fillRect(k,l - m, 1, 1 );
                    
                }
        
            }
            counter = counter + 1;
        }
    }

//    for(var j = 0; j < 256;j++) {
//         for(var i = 0; i < 28; i++) {
            
//             if(val > 0) {
//               //   debugger;
//             }
            
               
//                 pixelCount = pixelCount + 1;
                
//             }
//             counter = counter + 1;
//         }
   
   //this.context.putImageData(imageData, 0, 0);
}

