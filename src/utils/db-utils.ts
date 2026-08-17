declare global {
    interface Function {
        secure?: boolean;
        callable?: boolean;
    }
}

export function dbSecureProp<T extends Function>(func: T): T {
    func.secure = true;
    return func;
}

export function Callable<T extends Function>(func: T): T {
    func.callable = true;
    return func;
}