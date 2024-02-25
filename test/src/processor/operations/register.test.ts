import { assignToRegister, mov, readRegister16, readRegister8 } from "../../../../src/processor/operations/register"
import { Register, RegisterKeys } from "../../../../src/processor/types"

describe("register", () => {
    test("moves value from one register to another", () => {
        const register: Register = {
            [RegisterKeys.ACC]: "AA",
            [RegisterKeys.B]: "BB",
            [RegisterKeys.C]: "CC",
            [RegisterKeys.D]: "DD",
            [RegisterKeys.E]: "EE",
            [RegisterKeys.H]: "HH",
            [RegisterKeys.L]: "LL",
            [RegisterKeys.SP]: "SP",
            [RegisterKeys.PC]: "00"
        }

        const movBC = mov(register, RegisterKeys.B, RegisterKeys.C);

        movBC();

        const updateRegister = { ...register, [RegisterKeys.B]: "CC" };

        expect(register).toStrictEqual(updateRegister);
    })

    test("writes value to register", () => {
        const register: Register = {
            [RegisterKeys.ACC]: "AA",
            [RegisterKeys.B]: "BB",
            [RegisterKeys.C]: "CC",
            [RegisterKeys.D]: "DD",
            [RegisterKeys.E]: "EE",
            [RegisterKeys.H]: "HH",
            [RegisterKeys.L]: "LL",
            [RegisterKeys.SP]: "SP",
            [RegisterKeys.PC]: "00"
        }

        const assignToRegisterC = assignToRegister(register, RegisterKeys.C);

        assignToRegisterC("EE");

        const expectedRegister = { ...register, [RegisterKeys.C]: "EE" };

        expect(register).toStrictEqual(expectedRegister);
    })

    test("returns 8 bit value from register", () => {
        const register: Register = {
            [RegisterKeys.ACC]: "AA",
            [RegisterKeys.B]: "BB",
            [RegisterKeys.C]: "CC",
            [RegisterKeys.D]: "DD",
            [RegisterKeys.E]: "EE",
            [RegisterKeys.H]: "HH",
            [RegisterKeys.L]: "LL",
            [RegisterKeys.SP]: "SP",
            [RegisterKeys.PC]: "00"
        }

        const readRegisterB = readRegister8(register, RegisterKeys.B);

        const result = readRegisterB();

        expect(result).toEqual("BB");
    })

    test("returns 16 bit value from register", () => {
        const register: Register = {
            [RegisterKeys.ACC]: "AA",
            [RegisterKeys.B]: "BB",
            [RegisterKeys.C]: "CC",
            [RegisterKeys.D]: "DD",
            [RegisterKeys.E]: "EE",
            [RegisterKeys.H]: "HH",
            [RegisterKeys.L]: "LL",
            [RegisterKeys.SP]: "SP",
            [RegisterKeys.PC]: "00"
        }

        const readRegisterBC = readRegister16(register, RegisterKeys.B, RegisterKeys.C);

        const result = readRegisterBC();

        expect(result).toEqual("BBCC");
    })

})