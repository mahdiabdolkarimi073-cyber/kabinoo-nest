declare global {
    interface Date {
        toCustomString(): string;
    }
    interface Number {
        toPersian: () => string;
    }
}
export declare function registerGlobal(): void;
export declare const VARS: {
    readonly isDev: boolean;
    readonly BACKEND: string;
    readonly FRONTEND: string;
    readonly PAYMENT_MID: string;
};
