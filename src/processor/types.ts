export const enum RegisterKeys {
    ACC,
    B,
    C,
    D,
    E,
    H,
    L,
    SP1,
    SP2,
    PC1,
    PC2
}

export type Register = Record<RegisterKeys, string>

export type ConditionBits = {
    carry: boolean,
    auxCarry: boolean,
    sign: boolean,
    zeroBit: boolean,
    parBit: boolean
}