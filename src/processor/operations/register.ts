import { read, write } from "../../memory";
import { Register, RegisterKeys } from "../types";

export const readPc = (register: Register) => {
    const highestByte = register[RegisterKeys.PC1];
    const lowestByte = register[RegisterKeys.PC2];

    return parseInt(highestByte + lowestByte, 16);
}

export const mov = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => () => {
    register[key1] = register[key2];
}

export const assignToRegister = (register: Register, key: RegisterKeys) => (value: string) => { 
    register[key] = value 
};

export const assignToRegister16 = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => (value: string) => {
    const valInt = parseInt(value, 16);
    
    const lowestByte = valInt & 255;
    const highestByte = (valInt & 65280) >> 8;

    register[key1] = highestByte.toString(16).padStart(2, '0');
    register[key2] = lowestByte.toString(16).padStart(2, '0');;
}

export const readRegister16 = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => () => register[key1] + register[key2];

export const readRegister8 = (register: Register, registerKey: RegisterKeys) => register[registerKey];

export const lxi = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => () => {
    const pc = readPc(register);

    const arg1 = read((readPc(register) + 2).toString(16))
    const arg2 = read((readPc(register) + 1).toString(16))
    
    register[key1] = arg1;
    register[key2] = arg2;
}

export const stax = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => () => {
    const address = register[key1] + register[key2];
    write(address, register[RegisterKeys.ACC]);
}

export const sta = (register: Register) => () => {
    const pc = readPc(register);

    const arg1 = read((readPc(register) + 2).toString(16))
    const arg2 = read((readPc(register) + 1).toString(16))

    const address = arg1 + arg2;

    write(address, register[RegisterKeys.ACC]);

}

export const shld = (register: Register) => () => {
    const arg1 = read((readPc(register) + 2).toString(16))
    const arg2 = read((readPc(register) + 1).toString(16))

    const address = arg1 + arg2;
    write(address, register[RegisterKeys.L]);

    const address2 = (parseInt(arg1 + arg2, 16) + 1).toString(16);
    write(address2, register[RegisterKeys.H]);
}

export const lhld = (register: Register) => () => {
    const arg1 = read((readPc(register) + 2).toString(16))
    const arg2 = read((readPc(register) + 1).toString(16))

    const address = arg1 + arg2;
    const l = read(address);

    assignToRegister(register, RegisterKeys.L)(l);

    const address2 = (parseInt(arg1 + arg2, 16) + 1).toString(16);
    const h = read(address2);

    assignToRegister(register, RegisterKeys.H)(h);
}

export const lda = (register: Register) => {
    const hsb = read((readPc(register) + 2).toString(16));
    const lsb = read((readPc(register) + 1).toString(16));

    const address = hsb + lsb;

    register[RegisterKeys.ACC] = read(address);
}

export const xchg = (register: Register) => {
    const tempH = register[RegisterKeys.H];
    const tempL = register[RegisterKeys.L];

    register[RegisterKeys.H] = register[RegisterKeys.D];
    register[RegisterKeys.L] = register[RegisterKeys.E];

    register[RegisterKeys.D] = tempH;
    register[RegisterKeys.E] = tempL;

}

export const incrementPC = (register: Register, size: number) => {
    const address = parseInt(register[RegisterKeys.PC1] + register[RegisterKeys.PC2], 16);
    const newAdd = address + size;
    assignToRegister16(register, RegisterKeys.PC1, RegisterKeys.PC2)(newAdd.toString(16).padStart(4, '0'));
}