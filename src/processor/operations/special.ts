import { readArg } from "../../memory";
import { Register, RegisterKeys } from "../types";

let shiftData = 0;
let port1 = 0;

export const out = (register: Register) => {
    const outArg = readArg(register);

    switch(outArg) {
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

            port1 = port1 & 254;
            break;
        }
        case "03": {

            const readShift = shiftData & 255;

            register[RegisterKeys.ACC] = readShift.toString(16).padStart(2, '0');

            break;
        }
        case "04": {

            break;
        }
    }
}


export const insertCredit = () => {
    
    port1 = port1 | 1;
}

const start = () => {
    port1 = port1 | 4;
}

const fire = () => {
    port1 = port1 | 16;
}

const left = () => {
    port1 = port1 | 32;
}


const right = () => {
    port1 = port1 | 64;
}

window.addEventListener("keydown", (event) => {
    console.log(event.key);
    if(event.key == " ") {
        fire();
    }
    else if(event.key == "Enter") {
        start();
    }
    else if(event.key.toLowerCase() == "a") {
        left();
    }
    else if(event.key.toLowerCase() == "d") {
        right();
    }
    else if(event.key.toLowerCase() == "c") {
        insertCredit();
    }
})

window.addEventListener("keyup", (event) => {
    console.log(event.key);
    if(event.key == " ") {
        port1 = port1 ^ 16;
    }
    else if(event.key == "Enter") {
        start();
    }
    else if(event.key.toLowerCase() == "a") {
        port1 = port1 ^ 32;
    }
    else if(event.key.toLowerCase() == "d") {
        port1 = port1 ^ 64;
    }
    else if(event.key.toLowerCase() == "c") {
        port1 = port1 ^ 1;
    }
})