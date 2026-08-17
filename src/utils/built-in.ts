export function Throw(msg: any = 'Something missing'): never {
    if (typeof msg === 'string' && msg.split(' ').length === 1) {
        msg = `${msg} وارد نشده است`;
    }
    throw (msg);
}


type Entry<T> = [keyof T, T[keyof T]];
type ReturnType<T> = Entry<T>[];

type OBJ<T> = { [k in keyof T]: T[k] };

export function entries<T extends OBJ<T>>(object: T): ReturnType<T> {
    return Object.entries(object) as ReturnType<T>;
}


export function fromEntries<T>(entries: Entry<T>[]): { [k in keyof T]: T[k] } {
    // @ts-ignore
    return Object.fromEntries(entries) as { [k in keyof T]: T[keyof T] };
}

export function makeEnum<T extends string>(value: string, ...values: T[]) {
    for (const v of values) {
        if (value === v) return v;
    }

    throw ({
        message: `Invalid Type '${value}'`,
        additional: {
            expected: values,
        },
    });
}