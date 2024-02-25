import { read, write } from "../../memory";
import { ConditionBits, Register, RegisterKeys } from "../types";
import { add8Bit, addWithCarry, and, inx, or, sub8Bit, subWithCarry, xor } from "./arithmetic";
import { assignToRegister, lxi, mov, readRegister8, shld, sta, stax } from "./register";

type Operation = {
    op: (args: string[]) => void,
    size: number
}

type Operations = Record<string, Operation>

const noop = () => {};

export const buildOperations = (register: Register, conditionBits: ConditionBits): Operations => ({
    "00": { size: 1, op: noop },
    "01": { size: 3, op: lxi(register, RegisterKeys.B, RegisterKeys.C) },
    "02": { size: 1, op: stax(register, RegisterKeys.B, RegisterKeys.C) },
    "03": { size: 1, op: inx(register, RegisterKeys.B, RegisterKeys.C)},



    "10": { size: 1, op: noop },
    "11": { size: 3, op: lxi(register, RegisterKeys.D, RegisterKeys.E) },
    "12": { size: 1, op: stax(register, RegisterKeys.D, RegisterKeys.E) },
    "13": { size: 1, op: inx(register, RegisterKeys.D, RegisterKeys.E)},



    "20": { size: 1, op: noop },
    "21": { size: 3, op: lxi(register, RegisterKeys.H, RegisterKeys.L) },
    "22": { size: 3, op: shld(register)},
    "23": { size: 1, op: inx(register, RegisterKeys.H, RegisterKeys.L)},


    "30": { size: 1, op: noop },
    "31": { size: 3, op: lxi(register, RegisterKeys.S, RegisterKeys.P) },
    "32": { size: 3, op: sta(register)},
    "33": { size: 1, op: inx(register, RegisterKeys.S, RegisterKeys.P)},

    // MOV
    "40": { size: 1, op: mov(register, RegisterKeys.B, RegisterKeys.B)},
    "41": { size: 1, op: mov(register, RegisterKeys.B, RegisterKeys.C)},
    "42": { size: 1, op: mov(register, RegisterKeys.B, RegisterKeys.D)},
    "43": { size: 1, op: mov(register, RegisterKeys.B, RegisterKeys.E)},
    "44": { size: 1, op: mov(register, RegisterKeys.B, RegisterKeys.H)},
    "45": { size: 1, op: mov(register, RegisterKeys.B, RegisterKeys.L)},
    "46": { size: 1, op: () => assignToRegister(register, RegisterKeys.B)(read(register[RegisterKeys.H] + register[RegisterKeys.L]))},
    "47": { size: 1, op: mov(register, RegisterKeys.B, RegisterKeys.ACC)},
    "48": { size: 1, op: mov(register, RegisterKeys.C, RegisterKeys.B)},
    "49": { size: 1, op: mov(register, RegisterKeys.C, RegisterKeys.C)},
    "4a": { size: 1, op: mov(register, RegisterKeys.C, RegisterKeys.D)},
    "4b": { size: 1, op: mov(register, RegisterKeys.C, RegisterKeys.E)},
    "4c": { size: 1, op: mov(register, RegisterKeys.C, RegisterKeys.H)},
    "4d": { size: 1, op: mov(register, RegisterKeys.C, RegisterKeys.L)},
    "4e": { size: 1, op: () => assignToRegister(register, RegisterKeys.C)(read(register[RegisterKeys.H] + register[RegisterKeys.L]))},
    "4f": { size: 1, op: mov(register, RegisterKeys.C, RegisterKeys.ACC)},

    "50": { size: 1, op: mov(register, RegisterKeys.D, RegisterKeys.B)},
    "51": { size: 1, op: mov(register, RegisterKeys.D, RegisterKeys.C)},
    "52": { size: 1, op: mov(register, RegisterKeys.D, RegisterKeys.D)},
    "53": { size: 1, op: mov(register, RegisterKeys.D, RegisterKeys.E)},
    "54": { size: 1, op: mov(register, RegisterKeys.D, RegisterKeys.H)},
    "55": { size: 1, op: mov(register, RegisterKeys.D, RegisterKeys.L)},
    "56": { size: 1, op: () => assignToRegister(register, RegisterKeys.D)(read(register[RegisterKeys.H] + register[RegisterKeys.L]))},
    "57": { size: 1, op: mov(register, RegisterKeys.D, RegisterKeys.ACC)},

    "58": { size: 1, op: mov(register, RegisterKeys.E, RegisterKeys.B)},
    "59": { size: 1, op: mov(register, RegisterKeys.E, RegisterKeys.C)},
    "5a": { size: 1, op: mov(register, RegisterKeys.E, RegisterKeys.D)},
    "5b": { size: 1, op: mov(register, RegisterKeys.E, RegisterKeys.E)},
    "5c": { size: 1, op: mov(register, RegisterKeys.E, RegisterKeys.H)},
    "5d": { size: 1, op: mov(register, RegisterKeys.E, RegisterKeys.L)},
    "5e": { size: 1, op: () => assignToRegister(register, RegisterKeys.E)(read(register[RegisterKeys.H] + register[RegisterKeys.L]))},
    "5f": { size: 1, op: mov(register, RegisterKeys.E, RegisterKeys.ACC)},

    "60": { size: 1, op: mov(register, RegisterKeys.H, RegisterKeys.B)},
    "61": { size: 1, op: mov(register, RegisterKeys.H, RegisterKeys.C)},
    "62": { size: 1, op: mov(register, RegisterKeys.H, RegisterKeys.D)},
    "63": { size: 1, op: mov(register, RegisterKeys.H, RegisterKeys.E)},
    "64": { size: 1, op: mov(register, RegisterKeys.H, RegisterKeys.H)},
    "65": { size: 1, op: mov(register, RegisterKeys.H, RegisterKeys.L)},
    "66": { size: 1, op: () => assignToRegister(register, RegisterKeys.H)(read(register[RegisterKeys.H] + register[RegisterKeys.L]))},
    "67": { size: 1, op: mov(register, RegisterKeys.H, RegisterKeys.ACC)},

    "68": { size: 1, op: mov(register, RegisterKeys.L, RegisterKeys.B)},
    "69": { size: 1, op: mov(register, RegisterKeys.L, RegisterKeys.C)},
    "6a": { size: 1, op: mov(register, RegisterKeys.L, RegisterKeys.D)},
    "6b": { size: 1, op: mov(register, RegisterKeys.L, RegisterKeys.E)},
    "6c": { size: 1, op: mov(register, RegisterKeys.L, RegisterKeys.H)},
    "6d": { size: 1, op: mov(register, RegisterKeys.L, RegisterKeys.L)},
    "6e": { size: 1, op: () => assignToRegister(register, RegisterKeys.L)(read(register[RegisterKeys.H] + register[RegisterKeys.L]))},
    "6f": { size: 1, op: mov(register, RegisterKeys.L, RegisterKeys.ACC)},

    "70": { size: 1, op: () => write(register[RegisterKeys.H] + register[RegisterKeys.L], readRegister8(register, RegisterKeys.B)) },
    "71": { size: 1, op: () => write(register[RegisterKeys.H] + register[RegisterKeys.L], readRegister8(register, RegisterKeys.C)) },
    "72": { size: 1, op: () => write(register[RegisterKeys.H] + register[RegisterKeys.L], readRegister8(register, RegisterKeys.D)) },
    "73": { size: 1, op: () => write(register[RegisterKeys.H] + register[RegisterKeys.L], readRegister8(register, RegisterKeys.E)) },
    "74": { size: 1, op: () => write(register[RegisterKeys.H] + register[RegisterKeys.L], readRegister8(register, RegisterKeys.H)) },
    "75": { size: 1, op: () => write(register[RegisterKeys.H] + register[RegisterKeys.L], readRegister8(register, RegisterKeys.L)) },
    // "76" HLT?
    "77": { size: 1, op: () => write(register[RegisterKeys.H] + register[RegisterKeys.L], readRegister8(register, RegisterKeys.ACC)) }, 
    
    "78": { size: 1, op: mov(register, RegisterKeys.ACC, RegisterKeys.B)},
    "79": { size: 1, op: mov(register, RegisterKeys.ACC, RegisterKeys.C)},
    "7a": { size: 1, op: mov(register, RegisterKeys.ACC, RegisterKeys.D)},
    "7b": { size: 1, op: mov(register, RegisterKeys.ACC, RegisterKeys.E)},
    "7c": { size: 1, op: mov(register, RegisterKeys.ACC, RegisterKeys.H)},
    "7d": { size: 1, op: mov(register, RegisterKeys.ACC, RegisterKeys.L)},
    "7e": { size: 1, op: () => assignToRegister(register, RegisterKeys.L)(read(register[RegisterKeys.H] + register[RegisterKeys.L]))},
    "7f": { size: 1, op: mov(register, RegisterKeys.ACC, RegisterKeys.ACC)},

    // ADD
    "80": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(add8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.B)))},
    "81": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(add8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.C)))},
    "82": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(add8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.D)))},
    "83": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(add8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.E)))},
    "84": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(add8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.H)))},
    "85": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(add8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.L)))},
    "86": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(add8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), read(register[RegisterKeys.H] + register[RegisterKeys.L])))},
    "87": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(add8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.ACC)))},

    // ADD WITH CARRY
    "88": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(addWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.B)))},
    "89": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(addWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.C)))},
    "8a": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(addWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.D)))},
    "8b": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(addWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.E)))},
    "8c": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(addWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.H)))},
    "8d": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(addWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.L)))},
    "8e": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(addWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), read(register[RegisterKeys.H] + register[RegisterKeys.L])))},
    "8f": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(addWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.ACC)))},

    // SUB
    "90": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.B)))},
    "91": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.C)))},
    "92": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.D)))},
    "93": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.E)))},
    "94": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.H)))},
    "95": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.L)))},
    "96": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), read(register[RegisterKeys.H] + register[RegisterKeys.L])))},
    "97": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.ACC)))},

    // SUB WITH CARRY
    "98": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(subWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.B)))},
    "99": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(subWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.C)))},
    "9a": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(subWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.D)))},
    "9b": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(subWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.E)))},
    "9c": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(subWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.H)))},
    "9d": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(subWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.L)))},
    "9e": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(subWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), read(register[RegisterKeys.H] + register[RegisterKeys.L])))},
    "9f": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(subWithCarry(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.ACC)))},

    // AND
    "a0": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(and(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.B)))},
    "a1": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(and(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.C)))},
    "a2": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(and(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.D)))},
    "a3": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(and(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.E)))},
    "a4": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(and(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.H)))},
    "a5": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(and(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.L)))},
    "a6": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(and(conditionBits)(readRegister8(register, RegisterKeys.ACC), read(register[RegisterKeys.H] + register[RegisterKeys.L])))},
    "a7": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(and(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.ACC)))},

    // XOR
    "a8": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(xor(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.B)))},
    "a9": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(xor(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.C)))},
    "aa": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(xor(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.D)))},
    "ab": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(xor(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.E)))},
    "ac": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(xor(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.H)))},
    "ad": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(xor(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.L)))},
    "ae": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(xor(conditionBits)(readRegister8(register, RegisterKeys.ACC), read(register[RegisterKeys.H] + register[RegisterKeys.L])))},
    "af": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(xor(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.ACC)))},

    // OR
    "b0": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(or(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.B)))},
    "b1": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(or(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.C)))},
    "b2": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(or(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.D)))},
    "b3": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(or(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.E)))},
    "b4": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(or(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.H)))},
    "b5": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(or(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.L)))},
    "b6": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(or(conditionBits)(readRegister8(register, RegisterKeys.ACC), read(register[RegisterKeys.H] + register[RegisterKeys.L])))},
    "b7": { size: 1, op: () => assignToRegister(register, RegisterKeys.ACC)(or(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.ACC)))},

    // CMP
    "b8": { size: 1, op: () => sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.B))},
    "b9": { size: 1, op: () => sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.C))},
    "ba": { size: 1, op: () => sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.D))},
    "bb": { size: 1, op: () => sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.E))},
    "bc": { size: 1, op: () => sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.H))},
    "bd": { size: 1, op: () => sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.L))},
    "be": { size: 1, op: () => sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), read(register[RegisterKeys.H] + register[RegisterKeys.L]))},
    "bf": { size: 1, op: () => sub8Bit(conditionBits)(readRegister8(register, RegisterKeys.ACC), readRegister8(register, RegisterKeys.ACC))}
}