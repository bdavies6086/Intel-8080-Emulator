import { Register, RegisterKeys } from "../types";

export const mov = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => () => {
    register[key1] = register[key2];
}

export const assignToRegister = (register: Register, key: RegisterKeys) => (value: string) => register[key] = value;

export const readRegister16 = (register: Register, key1: RegisterKeys, key2: RegisterKeys) => () => register[key1] + register[key2];

export const readRegister8 = (register: Register, registerKey: RegisterKeys) => () => register[registerKey];