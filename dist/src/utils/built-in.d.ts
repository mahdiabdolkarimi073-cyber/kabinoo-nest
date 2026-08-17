export declare function Throw(msg?: any): never;
type Entry<T> = [keyof T, T[keyof T]];
type ReturnType<T> = Entry<T>[];
type OBJ<T> = {
    [k in keyof T]: T[k];
};
export declare function entries<T extends OBJ<T>>(object: T): ReturnType<T>;
export declare function fromEntries<T>(entries: Entry<T>[]): {
    [k in keyof T]: T[k];
};
export declare function makeEnum<T extends string>(value: string, ...values: T[]): T;
export {};
