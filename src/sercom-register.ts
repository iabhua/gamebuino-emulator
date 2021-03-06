import { Atsamd21 } from "./atsamd21";

const SERCOM0_ADDR: number = 0x42000800;
const INTFLAG_OFFSET: number = 0x18;
const DATA_OFFSET: number = 0x28;

export class SercomRegister {
    private _dataListeners: ((data: number)=>void)[] = [];
    data: number = 0x80;

    constructor(index: number, processor: Atsamd21) {
        var baseAddr: number = SERCOM0_ADDR + index * 0x400;

        processor.registerPeripheralReadHandler(baseAddr + INTFLAG_OFFSET, (address: number) => {
            // console.log(`In read SERCOM${index} INTFLAG`);
            return 0b00000111; // RXC, TXC, DRE 
        });

        processor.registerPeripheralWriteHandler(baseAddr + DATA_OFFSET, (address, value) => {
            value = value & 0xff;
            // console.log(`SENDING DATA 0x${value.toString(16)} ${String.fromCharCode(value)}`);
            this.data = 0x80;
            this._dataListeners.forEach(listener => {
                listener(value);
            });
        });

        processor.registerPeripheralReadHandler(baseAddr + DATA_OFFSET, (address: number) => {
            return this.data;
        });
    }

    registerDataListener(listener: (data: number)=>void) {
        this._dataListeners.push(listener);
    }
}