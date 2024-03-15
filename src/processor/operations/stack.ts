import { read, write } from "../../memory";
import { ConditionBits, Register, RegisterKeys } from "../types"

const updateSp = (register: Register, spInt: number) => {
    const msb = (spInt & 65280) >> 8;

    const lsb = spInt & 255;

    const msbStr = msb.toString(16).padStart(2, '0');
    const lsbStr = lsb.toString(16).padStart(2, '0');

    register[RegisterKeys.SP1] = msbStr;
    register[RegisterKeys.SP2] = lsbStr;
}

const decodeConditionBits = (byte: string): ConditionBits => {

    const int = parseInt(byte, 16);
    
    const carry = int & 1;
    const parity = int & 4;
    const auxCarry = int & 16;
    const zero = int & 64;
    const sign = int & 128;

    return {
        carry: carry > 0,
        parBit: parity > 0,
        auxCarry: auxCarry > 0,
        zeroBit: zero > 0,
        sign: sign > 0,
    }
}

const encodeConditionBits = (conditionBits: ConditionBits) => {

    let bits = 0;
    if(conditionBits.carry) bits = bits ^ 1;
    if(conditionBits.parBit) bits = bits ^ 4;
    if(conditionBits.auxCarry) bits = bits ^ 16;
    if(conditionBits.zeroBit) bits = bits ^ 64;
    if(conditionBits.sign) bits = bits ^ 128;

    return bits.toString(16).padStart(2, '0');
}
const stack: string[] = [];

export const pop = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => {

    const sp = register[RegisterKeys.SP1] + register[RegisterKeys.SP2];

    let spInt = parseInt(sp, 16);


    register[key2] = read(spInt.toString(16));
    stack.pop();
    
    spInt = spInt + 1;

    register[key1] = read(spInt.toString(16));
    stack.pop();

    spInt = spInt + 1;

    updateSp(register, spInt);
}

export const popPsw = (register: Register, conditionBits: ConditionBits) => {
    const sp = register[RegisterKeys.SP1] + register[RegisterKeys.SP2];

    let spInt = parseInt(sp, 16);


    register[RegisterKeys.ACC] = read(spInt.toString(16));

    spInt = spInt + 1;


    const conditionByte = read(spInt.toString(16));

    spInt = spInt + 1;
    stack.pop();

    const newConditionBits = decodeConditionBits(conditionByte);

    conditionBits.auxCarry = newConditionBits.auxCarry;
    conditionBits.carry = newConditionBits.carry;
    conditionBits.parBit = newConditionBits.parBit;
    conditionBits.sign = newConditionBits.sign;
    conditionBits.zeroBit = newConditionBits.zeroBit;

    

    updateSp(register, spInt);
}

export const pushPsw = (register: Register, conditionBits: ConditionBits) => {

    
    const sp = register[RegisterKeys.SP1] + register[RegisterKeys.SP2];

    let spInt = parseInt(sp, 16);

    spInt = spInt - 1;

    write(spInt.toString(16), encodeConditionBits(conditionBits));
    stack.push(encodeConditionBits(conditionBits));

    spInt = spInt -1;
    write(spInt.toString(16), register[RegisterKeys.ACC]);

    updateSp(register, spInt);
}


 
export const push = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => {
    const sp = register[RegisterKeys.SP1] + register[RegisterKeys.SP2];

    let spInt = parseInt(sp, 16);

    spInt = spInt - 1;

    write(spInt.toString(16), register[key1]);

    stack.push(register[key1]);

    spInt = spInt - 1;

    write(spInt.toString(16), register[key2]);
    stack.push(register[key2]);

    updateSp(register, spInt);
}

export const xthl = (register: Register) => {

    const tempH = register[RegisterKeys.H];
    const tempL = register[RegisterKeys.L];

    pop(register, RegisterKeys.H, RegisterKeys.L);

    const sp = register[RegisterKeys.SP1] + register[RegisterKeys.SP2];

    let spInt = parseInt(sp, 16);

    spInt = spInt - 1;

    write(spInt.toString(16), tempH);

    spInt = spInt - 1;

    write(spInt.toString(16), tempL);

    updateSp(register, spInt);

}