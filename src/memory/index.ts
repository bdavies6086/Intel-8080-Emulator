import { hexToNumber } from "../processor/operations/utils"
import { invaders } from "./invaders"

const invadersMemory = invaders();

export const read = (address: string) => invadersMemory[hexToNumber(address)];
export const write = (address: string, value: string) => invadersMemory[hexToNumber(address)] = value;