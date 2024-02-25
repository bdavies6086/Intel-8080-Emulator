import { readWith, writeWith } from "../../../src/memory";

describe("memory", () => {
    test("successfully reads correctly from address", () => {
        const memory = Array.from({ length: 10}, () => "00");

        const readIndex = 5;
        memory[readIndex] = "FF";

        const read = readWith(memory);

        expect(read(readIndex.toString(16))).toBe("FF");
    })

    test("successfully writes to correct memory address", () => {
        const memory = Array.from({ length: 10}, () => "00");

        const writeIndex = 5;
        
        const write = writeWith(memory);

        write(writeIndex.toString(16), "FF");

        expect(memory[writeIndex]).toBe("FF");
    })
})