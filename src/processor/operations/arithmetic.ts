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
        conditionBits.sign = sign;

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

    return result.toString(16);
}


const addition = (val1: number, val2: number, carry: number) => val1 + val2 + carry;
const subtraction = (val1: number, val2: number, carry: number) => val1 - val2 - carry;


export const add8Bit = arithmeticWrapper(addition);
export const sub8Bit = arithmeticWrapper(subtraction);


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
export const inr = (register: Register, key1: RegisterKeys, key2: RegisterKeys, conditionBits: ConditionBits) => () => {
    const regVal = parseInt(register[key1] + register[key2], 16);

    const result = regVal + 1;


}