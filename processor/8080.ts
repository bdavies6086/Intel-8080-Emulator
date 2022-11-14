import { ConditionBits, Register, RegisterKeys } from "./types";

const memory = [];

const register: Record<RegisterKeys, number> = {
    [RegisterKeys.ACC]: 0,
    [RegisterKeys.B]: 0,
    [RegisterKeys.C]: 0,
    [RegisterKeys.D]: 0,
    [RegisterKeys.E]: 0,
    [RegisterKeys.H]: 0,
    [RegisterKeys.L]: 0
}

const conditionBits: ConditionBits = {
    carry: false,
    auxCarry: false,
    sign: false,
    zeroBit: false,
    parBit: false
}

function get16BitNumber(highestByte: number, lowestByte: number) {
    var tempA = parseInt("0x" + highestByte.toString(16) + "00");
    var tempB = parseInt("0x00" + lowestByte.toString(16));
    var tempC = tempA | tempB;
    return tempC;
}

const split16Bit = (val: number): [number, number] => {
    const highestByte = val >> 8;
    const lowestByte = val & 255;

    return [highestByte, lowestByte];
}

const noop = () => {};

export const movRegisterWith = (register: Register) => (key1: RegisterKeys, key2: RegisterKeys) => {
    register[key1] = register[key2];
}

const mov = movRegisterWith(register);

const readMemoryWith = (memory: string[]) => (index: number) => parseInt("0x" + memory[index]);

const readMemory = readMemoryWith(memory);

export const readAddressWith = (register: Register, memory: string[]) => (key1: RegisterKeys, key2: RegisterKeys): number => {
    const address = get16BitNumber(register[key1], register[key2]);
    return parseInt(memory[address], 16);
}

const readAddress = readAddressWith(register, memory);

export const assignToRegisterWith = (register: Register) => (key: RegisterKeys, value: number) => register[key] = value;


const readRegisterWith = (register: Register) => (key: RegisterKeys) => register[key];

const readRegister = readRegisterWith(register);

const assignToRegister = assignToRegisterWith(register);

export const writeMemoryWith = (register: Register, memory: string[]) => (val: number, index: number) => {
    memory[index] = val.toString(16);
}

const writeMemory = writeMemoryWith(register, memory);


const read16BitRegisterWith = (register: Register) => (key1: RegisterKeys, key2: RegisterKeys) => {
    const value1 = register[key1];
    const value2 = register[key2];
    return (value1 << 8) | value2;
}

const read16BitRegister = read16BitRegisterWith(register);

const write16BitToRegisterWith = (register: Register) => (value: number, key1: RegisterKeys, key2: RegisterKeys) => {
    const value1 = value >> 8;
    register[key1] = value1;
    const value2 = (value1 << 8) ^ value;
    register[key2] = value2;
}

const write16BitToRegister = write16BitToRegisterWith(register);

const handleBits = (value: number, numberOfBits = 8): { carry: boolean, sign: boolean, result: number } => {
    const highestBit = Math.pow(2, numberOfBits)
    if(value >= highestBit) return { carry: true, sign: false, result: value ^ highestBit };
    if(value < 0) return { carry: true, sign: true, result: (highestBit - 1) + value + 1 };
    return { carry: false, sign: false, result: value };
}

const operationWrapperWith = (conditionBits: ConditionBits) => (operation: (value1: number, value2: number) => number) => (setCarry: boolean, setConditionBits: boolean, value1: number, value2: number, numOfBits = 8) => {
    const afterOp = operation(value1, value2);
    const { carry, sign, result } = handleBits(afterOp, numOfBits);

    if(setCarry) {
        conditionBits.carry = carry;
    }

    if(setConditionBits) {
        conditionBits.zeroBit = result == 0;
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

    return result;
}

const operationWrapper = operationWrapperWith(conditionBits);
const add = operationWrapper((value1: number, value2: number) => value1 + value2);
const subtract = operationWrapper((value1: number, value2: number) => value1 - value2);
const and = operationWrapper((value1: number, value2: number) => value1 & value2);
const xor = operationWrapper((value1: number, value2: number) => value1 ^ value2);
const or = operationWrapper((value1: number, value2: number) => value1 | value2);

const rlcWith = (register: Register, conditionBits: ConditionBits) => (key1: RegisterKeys) => {
    const result = register[key1] << 1;

    const carry = (result & 256) > 0;

    const resultWithCarryApplied = carry ? result | 1 : result;

    register[key1] = resultWithCarryApplied;
    conditionBits.carry = carry;

}

const rlc = rlcWith(register, conditionBits);

const rrcWith = (register: Register, conditionBits: ConditionBits) => (key1: RegisterKeys) => {
    const val = register[key1];
    const carry = (val & 1) > 0;
    const result = val >> 1;

    const resultWithCarryApplied = carry ? result | 128 : result;

    register[key1] = resultWithCarryApplied;
    conditionBits.carry = carry;

}

const rrc = rrcWith(register, conditionBits);

const dad = (highestByte1: number, lowestByte1: number, highestByte2: number, lowestByte2: number) => {
    const sixteenBit1 = get16BitNumber(highestByte1, lowestByte1);
    const sixteenBit2 = get16BitNumber(highestByte2, lowestByte2);

    return split16Bit(add(true, false, sixteenBit1, sixteenBit2, 16));
}

const staxWith = (memory: string[], read: typeof readRegister) => (index: number) => {
    const acc = read(RegisterKeys.ACC);
    const [highestOrderByte, lowestOrderByte] = split16Bit(acc);
    memory[index] = lowestOrderByte.toString(16);
    memory[index + 1] = highestOrderByte.toString(16);
}

const stax = staxWith(memory, readRegister);

const dcxWith = (read: typeof readRegister, assign: typeof assignToRegister, sub: typeof subtract) => (key1: RegisterKeys, key2: RegisterKeys) => {
    const sixteenBit = get16BitNumber(read(key1), read(key2));
    const [highestOrderByte, lowestOrderByte] = split16Bit(sub(false, false, sixteenBit, 1, 16));
    assign(key1, highestOrderByte);
    assign(key2, lowestOrderByte);
}

const dcx = dcxWith(readRegister, assignToRegister, subtract);

const inxWith = (read: typeof readRegister, assign: typeof assignToRegister, add: typeof subtract) => (key1: RegisterKeys, key2: RegisterKeys) => {
    const sixteenBit = get16BitNumber(read(key1), read(key2));
    const [highestOrderByte, lowestOrderByte] = split16Bit(add(false, false, sixteenBit, 1, 16));
    assign(key1, highestOrderByte);
    assign(key2, lowestOrderByte);
}

const inx = inxWith(readRegister, assignToRegister, subtract);

const OperationMap: Record<string, { size: number, op: (pc: number) => void}> = {
    "00": { size: 1, op: noop },
    "01": { size: 3, op: (pc) => { assignToRegister(RegisterKeys.B, readMemory(pc + 2)); assignToRegister(RegisterKeys.C, readMemory(pc + 1))} },
    "02": { size: 1, op: () => write16BitToRegister(readRegister(RegisterKeys.ACC), RegisterKeys.B, RegisterKeys.C) },
    "03": { size: 1, op: () => write16BitToRegister(read16BitRegister(RegisterKeys.B, RegisterKeys.C) + 1, RegisterKeys.B, RegisterKeys.C) },
    "04": { size: 1, op: () => assignToRegister(RegisterKeys.B, add(false, true, readRegister(RegisterKeys.B), 1)) },
    "05": { size: 1, op: () => assignToRegister(RegisterKeys.B, subtract(false, true, readRegister(RegisterKeys.B), 1)) },
    "06": { size: 2, op: (pc) => assignToRegister(RegisterKeys.B, readMemory(pc+1)) },
    "07": { size: 1, op: () => rlc(RegisterKeys.ACC) },
    "08": { size: 1, op: noop },
    "09": { size: 1, op: () => {
        const [highestByte, lowestByte] = dad(readRegister(RegisterKeys.H), readRegister(RegisterKeys.L), readRegister(RegisterKeys.B), readRegister(RegisterKeys.C));
        assignToRegister(RegisterKeys.H, highestByte);
        assignToRegister(RegisterKeys.L, lowestByte);
    }},
    "0a": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, readMemory(readAddress(RegisterKeys.B, RegisterKeys.C))) },
    "0b": { size: 1, op: () => dcx(RegisterKeys.B, RegisterKeys.C)},
    "0c": { size: 1, op: () => assignToRegister(RegisterKeys.C, add(false, true, readRegister(RegisterKeys.C), 1)) },
    "0d": { size: 1, op: () => assignToRegister(RegisterKeys.C, subtract(false, true, readRegister(RegisterKeys.C), 1)) },
    "0e": { size: 2, op: (pc) => assignToRegister(RegisterKeys.C, readMemory(pc + 1)) },
    "0f": { size: 1, op: () => rrc(RegisterKeys.ACC) },
    "10": { size: 1, op: noop },
    "11": { size: 3, op: (pc) => { assignToRegister(RegisterKeys.D, readMemory(pc+2)); assignToRegister(RegisterKeys.E, readMemory(pc+1)); } },
    "12": { size: 1, op: () => stax(readAddress(RegisterKeys.D, RegisterKeys.E)) },
    "13": { size: 1, op: () => inx(RegisterKeys.D, RegisterKeys.E)},
    "14": { size: 1, op: () => assignToRegister(RegisterKeys.D, add(false ,true ,readRegister(RegisterKeys.D), 1)) },
    "15": { size: 1, op: () => assignToRegister(RegisterKeys.D, subtract(false ,true ,readRegister(RegisterKeys.D), 1))},
    "16": { size: 2, op: (pc) => assignToRegister(RegisterKeys.D, readMemory(pc + 1)) },
    "17": { size: 1 },
    "18": { size: 1, op: noop },
    "19": { size: 1, op: () => {
        const [highestByte, lowestByte] = dad(readRegister(RegisterKeys.H), readRegister(RegisterKeys.L), readRegister(RegisterKeys.D), readRegister(RegisterKeys.E));
        assignToRegister(RegisterKeys.H, highestByte);
        assignToRegister(RegisterKeys.L, lowestByte);
    }},
    "1a": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, readMemory(readAddress(RegisterKeys.D, RegisterKeys.E))) },
    "1b": { size: 1, op: () => dcx(RegisterKeys.D, RegisterKeys.E) },
    "1c": { size: 1, op: () => assignToRegister(RegisterKeys.E, add(false, true, readRegister(RegisterKeys.E), 1)) },
    "1d": { size: 1, op: () => assignToRegister(RegisterKeys.E, subtract(false, true, readRegister(RegisterKeys.E), 1))  },
    "1e": { size: 2, op: (pc) => assignToRegister(RegisterKeys.E, readMemory(pc + 1)) },
    "1f": { size: 1 },
    "20": { size: 1, op: noop },
    "21": { size: 3, op: (pc) => { assignToRegister(RegisterKeys.H, readMemory(pc+2)); assignToRegister(RegisterKeys.L, readMemory(pc+1)); } },
    "22": { size: 3 },
    "23": { size: 1, op: () => inx(RegisterKeys.H, RegisterKeys.L) },
    "24": { size: 1, op: () => assignToRegister(RegisterKeys.H, add(false, true, readRegister(RegisterKeys.H), 1)) },
    "25": { size: 1 },
    "26": { size: 2, op: (pc) => assignToRegister(RegisterKeys.H, readMemory(pc + 1)) },
    "27": { size: 1 },
    "28": { size: 1, op: noop },
    "29": { size: 1, op: () => {
        const [highestByte, lowestByte] = dad(readRegister(RegisterKeys.H), readRegister(RegisterKeys.L), readRegister(RegisterKeys.H), readRegister(RegisterKeys.L));
        assignToRegister(RegisterKeys.H, highestByte);
        assignToRegister(RegisterKeys.L, lowestByte);
    } },
    "2a": { size: 3 },
    "2b": { size: 1, op: () => dcx(RegisterKeys.H, RegisterKeys.L) },
    "2c": { size: 1, op: () => assignToRegister(RegisterKeys.L, add(false, true, readRegister(RegisterKeys.L), 1)) },
    "2d": { size: 1, op: () => assignToRegister(RegisterKeys.L, subtract(false, true, readRegister(RegisterKeys.L), 1)) },
    "2e": { size: 2, op: (pc) => assignToRegister(RegisterKeys.L, readMemory(pc + 1)) },
    "2f": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, (~readRegister(RegisterKeys.ACC)) & (2^16 -1)) },
    "30": { size: 1, op: noop },
    "31": { size: 3 },
    "32": { size: 3 },
    "33": { size: 1 },
    "34": { size: 1 },
    "35": { size: 1 },
    "36": { size: 2 },
    "37": { size: 1 },
    "38": { size: 1, op: noop },
    "39": { size: 1 },
    "3a": { size: 3 },
    "3b": { size: 1 },
    "3c": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(false, true, readRegister(RegisterKeys.ACC), 1)) },
    "3d": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(false, true, readRegister(RegisterKeys.ACC), 1)) },
    "3e": { size: 2, op: (pc) => assignToRegister(RegisterKeys.ACC, readMemory(pc + 1)) },
    "3f": { size: 1 },
    "40": { size: 1, op: () => mov(RegisterKeys.B, RegisterKeys.B) },
    "41": { size: 1, op: () => mov(RegisterKeys.B, RegisterKeys.C) },
    "42": { size: 1, op: () => mov(RegisterKeys.B, RegisterKeys.D) },
    "43": { size: 1, op: () => mov(RegisterKeys.B, RegisterKeys.E) },
    "44": { size: 1, op: () => mov(RegisterKeys.B, RegisterKeys.H) },
    "45": { size: 1, op: () => mov(RegisterKeys.B, RegisterKeys.L) },
    "46": { size: 1, op: () => assignToRegister(RegisterKeys.B, readAddress(RegisterKeys.H, RegisterKeys.L)) },
    "47": { size: 1, op: () => mov(RegisterKeys.B, RegisterKeys.ACC) },
    "48": { size: 1, op: () => mov(RegisterKeys.C, RegisterKeys.B) },
    "49": { size: 1, op: () => mov(RegisterKeys.C, RegisterKeys.C) },
    "4a": { size: 1, op: () => mov(RegisterKeys.C, RegisterKeys.D) },
    "4b": { size: 1, op: () => mov(RegisterKeys.C, RegisterKeys.E) },
    "4c": { size: 1, op: () => mov(RegisterKeys.C, RegisterKeys.H) },
    "4d": { size: 1, op: () => mov(RegisterKeys.C, RegisterKeys.L) },
    "4e": { size: 1, op: () => assignToRegister(RegisterKeys.C, readAddress(RegisterKeys.H, RegisterKeys.L)) },
    "4f": { size: 1, op: () => mov(RegisterKeys.C, RegisterKeys.ACC) },
    "50": { size: 1, op: () => mov(RegisterKeys.D, RegisterKeys.B) },
    "51": { size: 1, op: () => mov(RegisterKeys.D, RegisterKeys.C) },
    "52": { size: 1, op: () => mov(RegisterKeys.D, RegisterKeys.D) },
    "53": { size: 1, op: () => mov(RegisterKeys.D, RegisterKeys.E) },
    "54": { size: 1, op: () => mov(RegisterKeys.D, RegisterKeys.H) },
    "55": { size: 1, op: () => mov(RegisterKeys.D, RegisterKeys.L) },
    "56": { size: 1, op: () => assignToRegister(RegisterKeys.D, readAddress( RegisterKeys.H, RegisterKeys.L)) },
    "57": { size: 1, op: () => mov(RegisterKeys.D, RegisterKeys.ACC) },
    "58": { size: 1, op: () => mov(RegisterKeys.E, RegisterKeys.B) },
    "59": { size: 1, op: () => mov(RegisterKeys.E, RegisterKeys.C) },
    "5a": { size: 1, op: () => mov(RegisterKeys.E, RegisterKeys.D) },
    "5b": { size: 1, op: () => mov(RegisterKeys.E, RegisterKeys.E) },
    "5c": { size: 1, op: () => mov(RegisterKeys.E, RegisterKeys.H) },
    "5d": { size: 1, op: () => mov(RegisterKeys.E, RegisterKeys.L) },
    "5e": { size: 1, op: () => assignToRegister(RegisterKeys.E, readAddress( RegisterKeys.H, RegisterKeys.L)) },
    "5f": { size: 1, op: () => mov(RegisterKeys.E, RegisterKeys.ACC) },
    "60": { size: 1, op: () => mov(RegisterKeys.H, RegisterKeys.B) },
    "61": { size: 1, op: () => mov(RegisterKeys.H, RegisterKeys.C) },
    "62": { size: 1, op: () => mov(RegisterKeys.H, RegisterKeys.D) },
    "63": { size: 1, op: () => mov(RegisterKeys.H, RegisterKeys.E) },
    "64": { size: 1, op: () => mov(RegisterKeys.H, RegisterKeys.H) },
    "65": { size: 1, op: () => mov(RegisterKeys.H, RegisterKeys.L) },
    "66": { size: 1, op: () => assignToRegister(RegisterKeys.H, readAddress(RegisterKeys.H, RegisterKeys.L)) },
    "67": { size: 1, op: () => mov(RegisterKeys.H, RegisterKeys.ACC) },
    "68": { size: 1, op: () => mov(RegisterKeys.L, RegisterKeys.B) },
    "69": { size: 1, op: () => mov(RegisterKeys.L, RegisterKeys.C) },
    "6a": { size: 1, op: () => mov(RegisterKeys.L, RegisterKeys.D) },
    "6b": { size: 1, op: () => mov(RegisterKeys.L, RegisterKeys.E) },
    "6c": { size: 1, op: () => mov(RegisterKeys.L, RegisterKeys.H) },
    "6d": { size: 1, op: () => mov(RegisterKeys.L, RegisterKeys.L) },
    "6e": { size: 1, op: () => assignToRegister(RegisterKeys.L, readAddress(RegisterKeys.H, RegisterKeys.L)) },
    "6f": { size: 1, op: () => mov(RegisterKeys.L, RegisterKeys.ACC) },
    "70": { size: 1, op: () => writeMemory(readRegister(RegisterKeys.B), readAddress(RegisterKeys.H, RegisterKeys.L)) },
    "71": { size: 1, op: () => writeMemory(readRegister(RegisterKeys.C), readAddress(RegisterKeys.H, RegisterKeys.L)) },
    "72": { size: 1, op: () => writeMemory(readRegister(RegisterKeys.D), readAddress(RegisterKeys.H, RegisterKeys.L)) },
    "73": { size: 1, op: () => writeMemory(readRegister(RegisterKeys.E), readAddress(RegisterKeys.H, RegisterKeys.L)) },
    "74": { size: 1, op: () => writeMemory(readRegister(RegisterKeys.H), readAddress(RegisterKeys.H, RegisterKeys.L)) },
    "75": { size: 1, op: () => writeMemory(readRegister(RegisterKeys.L), readAddress(RegisterKeys.H, RegisterKeys.L)) },
    "76": { size: 1 },
    "77": { size: 1, op: () => writeMemory(readRegister(RegisterKeys.ACC), readAddress(RegisterKeys.H, RegisterKeys.L)) },
    "78": { size: 1, op: () => mov(RegisterKeys.ACC, RegisterKeys.B) },
    "79": { size: 1, op: () => mov(RegisterKeys.ACC, RegisterKeys.C) },
    "7a": { size: 1, op: () => mov(RegisterKeys.ACC, RegisterKeys.D) },
    "7b": { size: 1, op: () => mov(RegisterKeys.ACC, RegisterKeys.E) },
    "7c": { size: 1, op: () => mov(RegisterKeys.ACC, RegisterKeys.H) },
    "7d": { size: 1, op: () => mov(RegisterKeys.ACC, RegisterKeys.L) },
    "7e": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, readAddress(RegisterKeys.H, RegisterKeys.L)) },
    "7f": { size: 1, op: () => mov(RegisterKeys.ACC, RegisterKeys.ACC) },
    "80": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.B))) },
    "81": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.C))) },
    "82": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.D))) },
    "83": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.E))) },
    "84": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.H))) },
    "85": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.L))) },
    "86": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readAddress(RegisterKeys.H, RegisterKeys.L))) },
    "87": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.ACC))) },
    "88": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.B))) },
    "89": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.C))) },
    "8a": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.D))) },
    "8b": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.E))) },
    "8c": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.H))) },
    "8d": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.L))) },
    "8e": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readAddress(RegisterKeys.H, RegisterKeys.L))) },
    "8f": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.ACC))) },
    "90": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.B))) },
    "91": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.C))) },
    "92": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.D))) },
    "93": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.E))) },
    "94": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.H))) },
    "95": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.L))) },
    "96": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, readRegister(RegisterKeys.ACC), readAddress(RegisterKeys.H, RegisterKeys.L))) },
    "97": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.ACC))) },
    "98": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.B)), conditionBits.carry ? 1 : 0)) },
    "99": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.C)), conditionBits.carry ? 1 : 0)) },
    "9a": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.D)), conditionBits.carry ? 1 : 0)) },
    "9b": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.E)), conditionBits.carry ? 1 : 0)) },
    "9c": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.H)), conditionBits.carry ? 1 : 0)) },
    "9d": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.L)), conditionBits.carry ? 1 : 0)) },
    "9e": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, readMemory(get16BitNumber(readRegister(RegisterKeys.H), readRegister(RegisterKeys.L))), conditionBits.carry ? 1 : 0)) },
    "9f": { size: 1, op: () => assignToRegister(RegisterKeys.ACC, subtract(true, true, subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.ACC)), conditionBits.carry ? 1 : 0)) },
    "a0": { size: 1, op: () => and(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.B)) },
    "a1": { size: 1, op: () => and(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.C)) },
    "a2": { size: 1, op: () => and(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.D)) },
    "a3": { size: 1, op: () => and(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.E)) },
    "a4": { size: 1, op: () => and(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.H)) },
    "a5": { size: 1, op: () => and(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.L)) },
    "a6": { size: 1, op: () => and(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readMemory(readAddress(RegisterKeys.H, RegisterKeys.L))) },
    "a7": { size: 1, op: () => and(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.ACC)) },
    "a8": { size: 1, op: () => xor(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.B)) },
    "a9": { size: 1, op: () => xor(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.C)) },
    "aa": { size: 1, op: () => xor(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.D)) },
    "ab": { size: 1, op: () => xor(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.E)) },
    "ac": { size: 1, op: () => xor(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.H)) },
    "ad": { size: 1, op: () => xor(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.L)) },
    "ae": { size: 1, op: () => xor(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readMemory(readAddress(RegisterKeys.H, RegisterKeys.L))) },
    "af": { size: 1, op: () => xor(true, true,RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.ACC)) },
    "b0": { size: 1, op: () => or(true, true, RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.B)) },
    "b1": { size: 1, op: () => or(true, true, RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.C)) },
    "b2": { size: 1, op: () => or(true, true, RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.D)) },
    "b3": { size: 1, op: () => or(true, true, RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.E)) },
    "b4": { size: 1, op: () => or(true, true, RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.H)) },
    "b5": { size: 1, op: () => or(true, true, RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.L)) },
    "b6": { size: 1, op: () => or(true, true, RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readMemory(readAddress(RegisterKeys.H, RegisterKeys.L))) },
    "b7": { size: 1, op: () => or(true, true, RegisterKeys.ACC, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.ACC)) },
    "b8": { size: 1, op: () => subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.B)) },
    "b9": { size: 1, op: () => subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.C)) },
    "ba": { size: 1, op: () => subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.D)) },
    "bb": { size: 1, op: () => subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.E)) },
    "bc": { size: 1, op: () => subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.H)) },
    "bd": { size: 1, op: () => subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.L)) },
    "be": { size: 1, op: () => subtract(true, true, readRegister(RegisterKeys.ACC), readMemory(readAddress(RegisterKeys.H, RegisterKeys.L))) },
    "bf": { size: 1, op: () => subtract(true, true, readRegister(RegisterKeys.ACC), readRegister(RegisterKeys.ACC)) },
    "c0": { size: 1 },
    "c1": { size: 1 },
    "c2": { size: 3 },
    "c3": { size: 3 },
    "c4": { size: 1 },
    "c5": { size: 2 },
    "c6": { size: 1 },
    "c7": { size: 1 },
    "c8": { size: 1 },
    "c9": { size: 1 },
    "ca": { size: 3 },
    "cb": { size: 1, op: noop },
    "cc": { size: 3 },
    "cd": { size: 3 },
    "ce": { size: 2, op: (pc) => assignToRegister(RegisterKeys.ACC, add(true, true, readRegister(RegisterKeys.ACC), readMemory(pc) + (conditionBits.carry ? 1 : 0)))},
    "cf": { size: 1 },
    "d0": { size: 1 },
    "d1": { size: 1 },
    "d2": { size: 3 },
    "d3": { size: 2 },
    "d4": { size: 3 },
    "d5": { size: 1 },
    "d6": { size: 2, op: (pc) => assignToRegister(RegisterKeys.ACC, subtract(true, true, readRegister(RegisterKeys.ACC), readMemory(pc))) },
    "d7": { size: 1 },
    "d8": { size: 1 },
    "d9": { size: 1, op: noop },
    "da": { size: 3 },
    "db": { size: 2 },
    "dc": { size: 3 },
    "dd": { size: 1, op: noop },
    "de": { size: 2 },
    "df": { size: 1 },
    "e0": { size: 1 },
    "e1": { size: 1 },
    "e2": { size: 3 },
    "e3": { size: 1 },
    "e4": { size: 3 },
    "e5": { size: 1 },
    "e6": { size: 2, op: (pc) => assignToRegister(RegisterKeys.ACC, and(true, true, readRegister(RegisterKeys.ACC), readMemory(pc))) },
    "e7": { size: 1 },
    "e8": { size: 1 },
    "e9": { size: 1 },
    "ea": { size: 3 },
    "eb": { size: 1 },
    "ec": { size: 3 },
    "ed": { size: 1, op: noop },
    "ee": { size: 2, op: (pc) => assignToRegister(RegisterKeys.ACC, xor(true, true, readRegister(RegisterKeys.ACC), readMemory(pc))) },
    "ef": { size: 1 },
    "f0": { size: 1 },
    "f1": { size: 1 },
    "f2": { size: 3 },
    "f3": { size: 1 },
    "f4": { size: 3 },
    "f5": { size: 1 },
    "f6": { size: 2, op: (pc) => assignToRegister(RegisterKeys.ACC, or(true, true, readRegister(RegisterKeys.ACC), readMemory(pc))) },
    "f7": { size: 1 },
    "f8": { size: 1 },
    "f9": { size: 1 },
    "fa": { size: 3 },
    "fb": { size: 1 },
    "fc": { size: 3 },
    "fd": { size: 1, op: noop },
    "fe": { size: 2 },
    "ff": { size: 1 }
}