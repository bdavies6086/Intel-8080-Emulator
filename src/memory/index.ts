import { readPc } from "../processor/operations/register";
import { Register, RegisterKeys } from "../processor/types";
import { invaders } from "./invaders"

export const getMemory = () => invaders;

export const readWith = (memory: string[]) => (address: string) => {
   
   
    return memory[parseInt(address, 16)] ?? "00"
};
export const read = readWith(invaders);

export const readArg = (register: Register, argNum = 1) => {

    const address = (readPc(register) + argNum).toString(16);

    

    const res = read(address);
  
    return res;
}

export const writeWith = (memory: string[]) => (address: string, value: string) => {
    if(address.toLowerCase() == "23fd" && value.length  < 2) debugger;
    
    memory[parseInt(address, 16)] = value
}
export const write = writeWith(invaders)