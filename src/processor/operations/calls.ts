import { readArg } from "../../memory";
import { ConditionBits, Register, RegisterKeys } from "../types";
import { inr, inx } from "./arithmetic";
import { incrementPC, readPc } from "./register";
import { pop, push } from "./stack";

type Condition = (conditionBits: ConditionBits) => boolean;

const jump = (condition: Condition) => (register: Register, conditionBits: ConditionBits) => {
    
    if(!condition(conditionBits)) {
        incrementPC(register, 3);
        return;
    }

    const highestByte = readArg(register, 2);
    const lowestByte = readArg(register);

    register[RegisterKeys.PC1] = highestByte;
    register[RegisterKeys.PC2] = lowestByte;
}

const retu = (condition: Condition) => (register: Register, conditionBits: ConditionBits) => {
    if(!condition(conditionBits)) {
        incrementPC(register, 1);
        return;
    }

    pop(register, RegisterKeys.PC1, RegisterKeys.PC2);

    
}

const call = (condition: Condition) => (register: Register, conditionBits: ConditionBits) => {
    if(!condition(conditionBits)) {
        incrementPC(register, 3);
        return;
    }

    const highestByte = readArg(register, 2);
    const lowestByte = readArg(register);
    inx(register, RegisterKeys.PC1, RegisterKeys.PC2)();
    inx(register, RegisterKeys.PC1, RegisterKeys.PC2)();
    inx(register, RegisterKeys.PC1, RegisterKeys.PC2)();

    push(register, RegisterKeys.PC1, RegisterKeys.PC2);

    register[RegisterKeys.PC1] = highestByte;
    register[RegisterKeys.PC2] = lowestByte;
}

const rst = (highestByte: string, lowestByte: string) => (register: Register, enableInterrupts: { value: boolean}) => {
    push(register, RegisterKeys.PC1, RegisterKeys.PC2);

    enableInterrupts.value = false;


    register[RegisterKeys.PC1] = highestByte;
    register[RegisterKeys.PC2] = lowestByte;
}

const notZero = (conditionBits: ConditionBits) => !conditionBits.zeroBit;
const notCarry = (conditionBits: ConditionBits) => !conditionBits.carry;
const parityOdd = (conditionBits: ConditionBits) => !conditionBits.parBit;
const zero = (conditionBits: ConditionBits) => conditionBits.zeroBit;
const carry = (conditionBits: ConditionBits) => conditionBits.carry;
const even = (conditionBits: ConditionBits) => conditionBits.parBit;
const trueCondition = (conditionBits: ConditionBits) => true;
const negative = (conditiionBits: ConditionBits) => conditiionBits.sign;


export const jnz = jump(notZero);
export const jnc = jump(notCarry);
export const jpo = jump(parityOdd);
export const jp = jump(trueCondition);

export const jz = jump(zero);
export const jc = jump(carry);
export const jpe = jump(even);
export const jm = jump(negative);

export const rnz = retu(notZero);
export const rnc = retu(notCarry);
export const rpo = retu(parityOdd);
export const rp = retu(even);
export const ret = retu(trueCondition);

export const cnz = call(notZero);
export const cnc = call(notCarry);
export const cpo = call(parityOdd);
export const cp = call(even);
export const cz = call(zero);
export const cc = call(carry);
export const cpe = call(even);
export const cm = call(negative);
export const ca = call(trueCondition);
 
export const rst0 = rst("00", "00");
export const rst1 = rst("00", "08");
export const rst2 = rst("00", "10");
export const rst3 = rst("00", "12");
export const rst4 = rst("00", "14");
export const rst5 = rst("00", "1C");
export const rst6 = rst("00", "1E");
export const rst7 = rst("00", "26");

export const rz = retu(zero);
export const rc = retu(carry);
export const rpe = retu(even);
export const rm = retu(negative);
