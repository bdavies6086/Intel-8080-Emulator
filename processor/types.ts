export const enum RegisterKeys {
    ACC,
    B,
    C,
    D,
    E,
    H,
    L
}

export type Register = Record<RegisterKeys, number>;

export type ConditionBits = {
    carry: boolean,
    auxCarry: boolean,
    sign: boolean,
    zeroBit: boolean,
    parBit: boolean
}