import { Prisma } from '@prisma/client';
import ModelName = Prisma.ModelName;
export type $_POSTObject<B> = {
    name: string;
    keys?: string[];
    required?: boolean;
    errorMsg?: string;
    get?: (body: B) => any;
};
export type $_POSTType<T, B> = {
    [key in keyof T]: string | $_POSTObject<B>;
};
export declare function $_POST<T, B>(json: $_POSTType<T, B>, request: Request): Promise<{ [k in keyof T]: k extends string | number | symbol ? any : any; }>;
export declare function generateModulePostJson(name: keyof typeof ModelName, required: boolean): {
    [k: string]: {
        required: boolean;
        name: any;
    };
};
export declare function force$_POST<T, B>(json: $_POSTType<T, B>, body: B, add?: Partial<$_POSTObject<B>> | undefined): {
    [k in keyof T]: k extends keyof B ? B[k] : any;
};
export declare function Try<T extends (...args: any) => any>(func: T, msg: string): Promise<ReturnType<T>>;
export declare function safeWait<T extends (...args: any) => any>(func: T): Promise<ReturnType<T> | undefined>;
