import { invaders } from "./invaders"

export const readWith = (memory: string[]) => (address: string) => memory[parseInt(address, 16)];
export const read = readWith(invaders);

export const writeWith = (memory: string[]) => (address: string, value: string) => memory[parseInt(address, 16)] = value
export const write = writeWith(invaders)