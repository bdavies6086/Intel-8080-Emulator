import { ConditionBits, Register, RegisterKeys } from "../types";

type ArithmeticOperation = (val1: number, val2: number, carry: number) => number;

type ArithmeticOptions = {
    setCarry: boolean,
    setConditionalBits: boolean,
    is8BitOp: boolean,
    withCarry: boolean
}

const defaultArithmeticOptions: ArithmeticOptions = {
    setCarry: true,
    setConditionalBits: true,
    is8BitOp: true,
    withCarry: false
}

const setConditionBits = (conditionBits: ConditionBits, options: ArithmeticOperation, value: number) => {

}

const handleBits = (value: number, numberOfBits = 8): { carry: boolean, sign: boolean, result: number } => {
    const highestBit = Math.pow(2, numberOfBits)
    if(value >= highestBit) return { carry: true, sign: false, result: value ^ highestBit };
    if(value < 0) return { carry: true, sign: true, result: (highestBit - 1) + value + 1 };
    return { carry: false, sign: false, result: value };
}

const arithmeticWrapper = (op: ArithmeticOperation, options = defaultArithmeticOptions) => (conditionBits: ConditionBits) => (val1: string, val2: string) => {
    const value1 = parseInt(val1, 16);
    const value2 = parseInt(val2, 16);

    const numOfBits = options.is8BitOp ? 8 : 16;

    const resPostOp = op(value1, value2, options.withCarry && conditionBits.carry ? 1 : 0);

    const { carry, sign, result } = handleBits(resPostOp, numOfBits);

    if(options.setCarry) {
        conditionBits.carry = carry;
    }

    if(options.setConditionalBits) {

        conditionBits.auxCarry = (Math.abs(resPostOp - value1) > 16) && (value1 < 16 || (value1 < 31));
        conditionBits.sign = sign;
        conditionBits.zeroBit = result == 0;

        let bitCounter = 0;
        let val = result;
        for(let i = 0; i < numOfBits; i++) {
            if(val & 0x1) {
                bitCounter = bitCounter + 1;
            }
            val = val >> 1;
        }

        conditionBits.parBit = bitCounter % 2 == 0;
    }

    const padStartMax = options.is8BitOp ? 2 : 4;

    return result.toString(16).padStart(padStartMax, '0');
}


const addition = (val1: number, val2: number, carry: number) => val1 + val2 + carry;
const subtraction = (val1: number, val2: number, carry: number) => (val1 - carry) - val2;


export const add8Bit = arithmeticWrapper(addition);
export const sub8Bit = arithmeticWrapper(subtraction);

export const add16Bit = arithmeticWrapper(addition, { setConditionalBits: false, is8BitOp: false, setCarry: true, withCarry: false});


export const addWithCarry = arithmeticWrapper(addition, { ...defaultArithmeticOptions, withCarry: true })
export const subWithCarry = arithmeticWrapper(subtraction, { ...defaultArithmeticOptions, withCarry: true })
export const build8BitAddition = {
    
}


export const and = arithmeticWrapper((value1: number, value2: number) => value1 & value2);
export const xor = arithmeticWrapper((value1: number, value2: number) => value1 ^ value2);
export const or = arithmeticWrapper((value1: number, value2: number) => value1 | value2);


export const inx = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => () => {
    const regVal = parseInt(register[key1] + register[key2], 16);

    const result = regVal + 1;


    const resStr = result.toString(16).padStart(4, '0');
    

    register[key1] = resStr.slice(0, 2);
    register[key2] = resStr.slice(2, 4);
}

// TODO, how to implement this nicely?
export const inrOp = (val1: number, val2: number, carry = 0) => {
    let result = val1 + val2;
    if(result > 255) result = 0;
    if(result < 0) result = 255;
    return result;
}

export const inr = arithmeticWrapper(inrOp, {...defaultArithmeticOptions, setCarry: false, });


export const dcrOp = (val1: number, val2: number, carry = 0) => {
    const result = val1 - val2;
    return result;
}

export const dcr = arithmeticWrapper(inrOp, {...defaultArithmeticOptions, setCarry: false, });

export const dcxOp = (val1: number, val2: number, carry = 0) => {
    const result = val1 - val2;
    return result;
}

export const dcx = arithmeticWrapper(dcxOp, { setCarry: false, setConditionalBits: false, is8BitOp: false, withCarry: false});


export const rlc = (conditionBits: ConditionBits, register: Register) => () => {
    
    const acc = parseInt(register[RegisterKeys.ACC], 16);

    const result = acc << 1;

    const msb = result & 256;

    conditionBits.carry = msb > 0;

    const finalResult = (conditionBits.carry ? result | 1 : result) & 255;

    register[RegisterKeys.ACC] = finalResult.toString(16).padStart(2, '0');
}

export const ral = (conditionBits: ConditionBits, register: Register) => () => {
    const acc = parseInt(register[RegisterKeys.ACC], 16);

    const carry = conditionBits.carry;

    const result = acc << 1;

    const finalResult = carry ? result | 1 : result;

    conditionBits.carry = (finalResult & 256) > 0;

    const finalResultTo8Bit = finalResult & 255;

    register[RegisterKeys.ACC] = finalResultTo8Bit.toString(16).padStart(2, '0');
}

export const rrc = (conditionBits: ConditionBits, register: Register) => () => {
    
    const acc = parseInt(register[RegisterKeys.ACC], 16);

    const prevBit = (acc & 1) > 0;

    const result = acc >> 1;

    const finalResult = prevBit ? result | 128 : result;

    conditionBits.carry = prevBit;

    register[RegisterKeys.ACC] = finalResult.toString(16).padStart(2, '0');;
}

export const rar = (conditionBits: ConditionBits, register: Register) => () => {

    const accVal = parseInt(register[RegisterKeys.ACC], 16);

    const lsb = (accVal & 1) > 0;

    const result = accVal >> 1 | (conditionBits.carry ? 128 : 0);


    conditionBits.carry = lsb;

    register[RegisterKeys.ACC] = result.toString(16).padStart(2, '0');;
}

export const cma = (register: Register) => () => {
    const acc = register[RegisterKeys.ACC];

    const result = (~parseInt(acc, 16)).toString(16).padStart(2, '0');;

    register[RegisterKeys.ACC] = result;
}

export const cmc = (conditionBits: ConditionBits) => () => {
    conditionBits.carry = !conditionBits.carry;
}

export const daa = (conditionBits: ConditionBits, register: Register) => {
    const acc = parseInt(register[RegisterKeys.ACC], 16);

    let adjustedResult = acc;

    let lsb = acc & 15;
    if(lsb > 9 || conditionBits.auxCarry) { 
        adjustedResult = (adjustedResult + 6);
        conditionBits.auxCarry = true;
    }
    else {
        conditionBits.auxCarry = false;
    }

    let msb = (adjustedResult & 240) >> 4;
    if(msb > 9 || conditionBits.carry) {
        adjustedResult = adjustedResult + 96;
        conditionBits.carry = true;
    }
    else {
        conditionBits.carry = false;
    }

    const { sign, result } = handleBits(adjustedResult, 8);

    conditionBits.sign = sign;
    conditionBits.zeroBit = result == 0;
    let bitCounter = 0;
        let val = result;
        for(let i = 0; i < 8; i++) {
            if(val & 0x1) {
                bitCounter = bitCounter + 1;
            }
            val = val >> 1;
        }

        conditionBits.parBit = bitCounter % 2 == 0;

    register[RegisterKeys.ACC] = (result & 255).toString(16);
}