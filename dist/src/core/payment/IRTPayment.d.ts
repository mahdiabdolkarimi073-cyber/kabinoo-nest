import { Payment } from '@prisma/client';
export default class IRTPayment {
    static MID: string;
    static doPayment(payment: Payment): Promise<string>;
    static getTerminalId(): string;
    static get enabled(): boolean;
    get TID(): string;
    static getToken(amount: number, paymentId: string): Promise<string>;
    static getUrl(token: string): string;
    static acceptReceipt(RefNum: string): Promise<boolean>;
    static fetch(path: string, body: {
        [key: string | symbol]: string | number;
    }): Promise<any>;
}
