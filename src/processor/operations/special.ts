import { readArg } from "../../memory";
import { Register, RegisterKeys } from "../types";

let shiftAmt = 0;
let shiftData = 0;
let port1 = 0;

export const out = (register: Register) => {
    const outArg = readArg(register);

    switch(outArg) {
        case "02": {
            shiftAmt = parseInt(register[RegisterKeys.ACC], 16);
            break;
        }
        case "03": {

            break;
        }
        case "04": {

            const shift = shiftData >> 8;
            const acc = parseInt(register[RegisterKeys.ACC], 16) << 8;

            shiftData = shift | acc;
            break;
        }
    }
}

export const input = (register: Register) => {
    const outArg = readArg(register);

    switch(outArg) {
        case "01": {
            
            register[RegisterKeys.ACC] = port1.toString(16).padStart(2, '0');
            if(register[RegisterKeys.PC1] + register[RegisterKeys.PC2] == "0020") {
                port1 = port1 & 254;
            }
            break;
        }
        case "02": {
            register[RegisterKeys.ACC] = "03";
            break;
        }
        case "03": {

            const readShift = shiftData >> (8 - shiftAmt);

            register[RegisterKeys.ACC] = readShift.toString(16).padStart(2, '0');

            break;
        }
        case "04": {

            break;
        }
    }
    
}


export const insertCredit = (clear = false) => {
    
    port1 = port1 | 1;
}

export const start = (clear = false) => {
    port1 = clear ? port1 ^ 4 : port1 | 4;
}

export const fire = (clear = false) => {
    port1 = clear ? port1 ^ 16 : port1 | 16;
}

export const left = (clear = false) => {
    port1 = clear ? port1 ^ 32 : port1 | 32;
}


export const right = (clear = false) => {
    port1 = clear ? port1 ^ 64 : port1 | 64;
}
