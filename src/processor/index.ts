import { getMemory, read, write } from "../memory"
import { rst1, rst2 } from "./operations/calls"
import { buildOperations } from "./operations/operations"
import { assignToRegister16, incrementPC } from "./operations/register"
import { ConditionBits, Register, RegisterKeys } from "./types"

export const intel8080 = () => {
    
    const conditionBits: ConditionBits = {
        carry: false,
        auxCarry: false,
        sign: false,
        zeroBit: false,
        parBit: false
    }

    const register: Register = {
        [RegisterKeys.ACC]: "00",
        [RegisterKeys.B]: "00",
        [RegisterKeys.C]: "00",
        [RegisterKeys.D]: "00",
        [RegisterKeys.E]: "00",
        [RegisterKeys.H]: "00",
        [RegisterKeys.L]: "00",
        [RegisterKeys.SP1]: "00",
        [RegisterKeys.SP2]: "00",
        [RegisterKeys.PC1]: "00",
        [RegisterKeys.PC2]: "00",
    }

    const debugProcs = {
        "0000": "Reset",
        "0008": "ScanLine96",
        "0010": "ScanLine224",
        "00B1": "InitRack",
        "0100": "DrawAlien",
        "0141": "CursorNextAlien",
        "017A": "GetAlienCoords",
        "01A1": "MoveRefAlien",
        "01C0": "InitAliens",
        "01CD": "ReturnTwo",
        "01CF": "DrawBottomLine",
        "01D9": "AddDelta",
        "01E4": "CopyRAMMirror",
        "01EF": "DrawShieldPl1",
        "01F5": "DrawShieldPl2",
        "0209": "RememberShields1",
        "020E": "RemeberShields2",
        "0213": "RestoreShields2",
        "021A": "ResotreShields1",
        "021E": "CopyShields",
        "0248": "RunGameObjs",
        "028E": "GameObj0",
        "0381": "MovePlayerRight",
        "038E": "MovePlayerLeft",
        "039B": "DrawPlayerDie",
        "03BB": "GameObj1",
        "03FA": "InitPlyShot",
        "040A": "MovePlyShot",
        "0430": "ReadPlyShot",
        "0436": "EndOfBlowup",
        "0476": "GameObj2",
        "04AB": "ResetShot",
        "04B6": "GameObj3",
        "0550": "ToShotStruct",
        "055B": "FromShotStruct",
        "0563": "HandleAlienShot",
        "062F": "FindInColumn",
        "0644": "ShotBlowingUp",
        "0682": "GameObj4",
        "0765": "WaitForStart",
        "0798": "NewGame",
        "0886": "GetAlRefPtr",
        "088D": "PromptPlayer",
        "08D1": "GetShipsPerCred",
        "08D8": "SpeedShots",
        "08F3": "PrintMessage",
        "08FF": "DrawChar",
        "0913": "TimeToSaucer",
        "097C": "AlienScoreValue",
        "0988": "AdjustScore",
        "09AD": "Print4Digits",
        "09B2": "DrawHexByte",
        "09D6": "ClearPlayField",
        "0A5F": "ScoreForAlien",
        "0A80": "Animate",
        "0A93": "PrintMessageDel",
        "0AAB": "SplashSquiggly",
        "0AB1": "OneSecDelay",
        "0AB6": "TwoSecDelay",
        "0ABB": "SplashDemo",
        "0ABF": "ISRRplashTasks",
        "0AD7": "WaitOnDelay",
        "0AE2": "IniSplashAni",
        "0BF7": "TAITOCOP",
        "1400": "DrawShiftedSprite",
        "1424": "EraseSimpleSprite",
        "1439": "DrawSimpSprite",
        "1452": "EraseShifted",
        "1474": "CnvtPixNumber",
        "147C": "RememberShields",
        "1491": "DrawSprCollision",
        "14CB": "ClearSmallSprite",
        "14D8": "PlayerShotHit",
        "1504": "AExplodeTime",
        "1554": "Cnt16s",
        "1562": "FindRow",
        "156F": "FindColumn",
        "1581": "GetAlienStatPtr",
        "1590": "WrapRef",
        "1597": "RackBump",
        "15D3": "DrawSprite",
        "15F3": "CountAliens",
        "1611": "GetPlayerDataPtr",
        "1618": "PlayFireOrDemo",
        "170E": "AShotReloadRate",
        "172C": "ShotSound",
        "1740": "TimeFleetSound",
        "1775": "FleetDelayExShip",
        "17C0": "ReadInputs",
        "17CD": "CheckHandleTilt",
        "1804": "CtrlSaucerSSound",
        "1815": "Draw SCORE ADVANCE TABLE",
        "1856": "ReadPriStruct",
        "1868": "SplashSprite",
        "18D4": "init",
        "18FA": "SonudBits3On",
        "1904": "InitAliensP2",
        "190A": "PlyrShotAndBump",
        "1910": "CurPlyAlive",
        "191A": "DrawScoreHead",
        "1931": "DrawScore",
        "193C": "Print Credit message",
        "194C": "DrawNumCredits",
        "1950": "PrintHighScore",
        "1956": "DrawStatus",
        "199A": "CheckHiddenMessage",
        "19D1": "EnableGameTasks",
        "19D7": "DisableGameTasks",
        "19DC": "SoundBNits3Off",
        "19E6": "DrawNumShips",
        "1A06": "CompYToBeam",
        "1A32": "BlockCopy",
        "1A3B": "ReadDesc",
        "1A47": "ConvToScreen",
        "1A5C": "ClearScreen",
        "1A69": "RestoreShields",
        "1A7F": "RemoveShip"
    }

    const enableInterrupts = { value: false };

    const ops = buildOperations(register, conditionBits, enableInterrupts);

    const a = document.getElementById("isrdelay");

    let rs1 = true;
    let lastVblank = new Date().getTime();

    const instrSet = new Set();

    let odd = "";

    let loglol = false;

    const met = () => {
        try {

            for(let j = 0; j < 32000; j++) {

                const pc = (register[RegisterKeys.PC1] + register[RegisterKeys.PC2]).toString().toUpperCase();
                // if(debugProcs[pc]) {
                //     if(debugProcs[pc] == "ScanLine224") {
                //         // turn off vblank for a bit so we can actually debug..
                //         // lastVblank = 100000000000000000090000;
                //         loglol = true;
                //     };
                //     //console.log(debugProcs[pc]);
                // }

               

                if(loglol) console.log(JSON.stringify(register));

                // if(parseInt(pc, 16) >= 6761 && parseInt(pc, 16) <= 6782) {
                //    // console.log(JSON.stringify(register));
                // } 


              

                const inst = read(register[RegisterKeys.PC1] + register[RegisterKeys.PC2]);
                if(!instrSet.has(inst) && loglol) {
                  //  console.log((inst));
                }
                instrSet.add(inst);
          
            let op = ops[read(register[RegisterKeys.PC1] + register[RegisterKeys.PC2])];

            if((new Date().getTime() - lastVblank) > (1000/70) && enableInterrupts.value) {
                
                if(rs1) {
                    op = ops["cf"];
                 
                }
                else { 
                    op = ops["d7"];
                 
                }
                rs1 = !rs1;
                lastVblank = new Date().getTime();
            }

           
      

            if(!op) throw new Error('shouldnt get here' + JSON.stringify(register));
       
            op.op();

         
            if(!op.handlesPc) {
                incrementPC(register, op.size);
            }
            }

        }
        catch(err) {
            console.log('lol', err);
        }
    }


    return {
        run: () => {

            
            met();
            const start = parseInt("2400",16);

            const end = parseInt(register[RegisterKeys.SP1] + register[RegisterKeys.SP2], 16);

            const mem = getMemory();

            //  console.log(JSON.stringify(mem.slice(end, start)))

            
            
            
        }
    }

}