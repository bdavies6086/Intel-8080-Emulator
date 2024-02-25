import { read, write } from "../../memory";
import { Register, RegisterKeys } from "../types";

export const mov = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => () => {
    register[key1] = register[key2];
}

export const assignToRegister = (register: Register, key: RegisterKeys) => (value: string) => { register[key] = value };

export const readRegister16 = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => () => register[key1] + register[key2];

export const readRegister8 = (register: Register, registerKey: RegisterKeys) => register[registerKey];

export const lxi = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => () => {
    const pc = parseInt(register[RegisterKeys.PC], 16);

    const arg1 = read((parseInt(register[RegisterKeys.PC], 16) + 2).toString(16))
    const arg2 = read((parseInt(register[RegisterKeys.PC], 16) + 1).toString(16))

    const address1 = arg1 + arg2;
    const address2 = (parseInt(address1, 16) + 1).toString(16);
    
    register[key1] = read(address1);
    register[key2] = read(address2);
}

export const stax = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => () => {
    const address = register[key1] + register[key2];
    write(address, register[RegisterKeys.ACC]);
}

export const sta = (register: Register) => () => {
    const pc = parseInt(register[RegisterKeys.PC], 16);

    const arg1 = read((parseInt(register[RegisterKeys.PC], 16) + 2).toString(16))
    const arg2 = read((parseInt(register[RegisterKeys.PC], 16) + 1).toString(16))

    const address = arg1 + arg2;

    write(address, register[RegisterKeys.ACC]);

}

export const shld = (register: Register) => () => {
    const arg1 = read((parseInt(register[RegisterKeys.PC], 16) + 2).toString(16))
    const arg2 = read((parseInt(register[RegisterKeys.PC], 16) + 1).toString(16))

    const address = arg1 + arg2;
    write(address, register[RegisterKeys.H]);

    const address2 = (parseInt(arg1 + arg2, 16) + 1).toString(16);
    write(address2, register[RegisterKeys.L]);
}