import { addWith, handleSignWith, setConditionBitsWith, subtractWith } from "../8080"
import { ConditionBits } from "../types"

describe("operation tests", () => {
    describe("add", () => {
        test("standard addition", () => {

            const conditionBits: ConditionBits = {
                carry: false,
                auxCarry: false,
                sign: false,
                zeroBit: false,
                parBit: false
            }

            const setConditionBits = setConditionBitsWith(conditionBits);

            const handleSign = handleSignWith(conditionBits);

            const add = addWith(setConditionBits, handleSign);

            const res = add(1,4)
            expect(res).toEqual(5);
            expect(conditionBits.carry).toBe(false);
            expect(conditionBits.auxCarry).toBe(false);
            expect(conditionBits.sign).toBe(false);
            expect(conditionBits.zeroBit).toBe(false);
            expect(conditionBits.parBit).toBe(true);
        })

        test("Add with carry", () => {
            const conditionBits: ConditionBits = {
                carry: false,
                auxCarry: false,
                sign: false,
                zeroBit: false,
                parBit: false
            }

            const setConditionBits = setConditionBitsWith(conditionBits);

            const handleSign = handleSignWith(conditionBits);

            const add = addWith(setConditionBits, handleSign);

            const res = add(255,1)
            expect(res).toEqual(0);
            console.log(JSON.stringify(conditionBits));
            expect(conditionBits.carry).toBe(true);
            expect(conditionBits.parBit).toBe(true);
            expect(conditionBits.sign).toBe(false);
        })

        test('Add with aux carry', () => {
            const conditionBits: ConditionBits = {
                carry: false,
                auxCarry: false,
                sign: false,
                zeroBit: false,
                parBit: false
            }

            const setConditionBits = setConditionBitsWith(conditionBits);

            const handleSign = handleSignWith(conditionBits);

            const add = addWith(setConditionBits, handleSign);

            const res = add(6,2)
            expect(res).toEqual(8);
            console.log(JSON.stringify(conditionBits));
            expect(conditionBits.carry).toBe(false);
            expect(conditionBits.parBit).toBe(false);
            expect(conditionBits.sign).toBe(false);
            expect(conditionBits.auxCarry).toBe(true);
        })
    })

    describe("subtract", () => {
        test("Standard subtraction", () => {
            const conditionBits: ConditionBits = {
                carry: false,
                auxCarry: false,
                sign: false,
                zeroBit: false,
                parBit: false
            }

            const setConditionBits = setConditionBitsWith(conditionBits);

            const handleSign = handleSignWith(conditionBits);

            const subtract = subtractWith(setConditionBits, handleSign);

            const res = subtract(10,1)
            expect(res).toEqual(9);
            expect(conditionBits.carry).toBe(false);
            expect(conditionBits.auxCarry).toBe(true);
            expect(conditionBits.sign).toBe(false);
            expect(conditionBits.zeroBit).toBe(false);
            expect(conditionBits.parBit).toBe(true);
        })

        test("Subtraction with carry", () => {
            const conditionBits: ConditionBits = {
                carry: false,
                auxCarry: false,
                sign: false,
                zeroBit: false,
                parBit: false
            }

            const setConditionBits = setConditionBitsWith(conditionBits);

            const handleSign = handleSignWith(conditionBits);

            const subtract = subtractWith(setConditionBits, handleSign);

            const res = subtract(5,7)
            expect(res).toEqual(254);
            expect(conditionBits.carry).toBe(true);
            expect(conditionBits.auxCarry).toBe(true);
            expect(conditionBits.sign).toBe(true);
            expect(conditionBits.zeroBit).toBe(false);
            expect(conditionBits.parBit).toBe(false);
        })
    })
})
