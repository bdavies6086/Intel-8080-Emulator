export const enum RegisterKeys {
    ACC,
    B,
    C,
    D,
    E,
    H,
    L,
    SP,
    PC
}

export type Register = Record<RegisterKeys, string>

export type ConditionBits = {
    carry: boolean,
    auxCarry: boolean,
    sign: boolean,
    zeroBit: boolean,
    parBit: boolean
}