declare global {
    interface Function {
        secure?: boolean;
        callable?: boolean;
    }
}
export declare function dbSecureProp<T extends Function>(func: T): T;
export declare function Callable<T extends Function>(func: T): T;
