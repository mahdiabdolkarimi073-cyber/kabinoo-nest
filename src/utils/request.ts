// noinspection t

import { Prisma } from '@prisma/client';
import { BasicSchemaInformation, SchemaFieldNames } from '../../prisma/Schema';
import { arabicToEnglishNumber } from './string';
import PrismaSchemaGenerated from '../../prisma/PrismaInfo';
import ModelName = Prisma.ModelName;

export type $_POSTObject<B> = {
    name: string,
    keys?: string[],
    required?: boolean,
    errorMsg?: string,
    get?: (body: B) => any
}

export type $_POSTType<T, B> = {
    [key in keyof T]: string | $_POSTObject<B>
}

export async function $_POST<T, B>(json: $_POSTType<T, B>, request: Request) {
    return force$_POST(json, await request.json());
}

export function generateModulePostJson(name: keyof typeof ModelName, required: boolean) {
    const list = BasicSchemaInformation[name]?.required ?? [];

    // @ts-ignore
    const fields = Prisma?.[name + 'ScalarFieldEnum'] ?? {};


    return Object.fromEntries(
        Object.entries(fields).map(([key, value]) => {
            const fieldName = PrismaSchemaGenerated.find(m => m.name.toLowerCase() === name?.toLowerCase())?.fields?.find(f => f.name.toLowerCase() === key + '')?.info?.name;
            return [
                key,
                {
                    required: list.includes(key) && required,
                    name: fieldName ?? SchemaFieldNames[key],
                },
            ];
        }),
    );
}

export function force$_POST<T, B>(json: $_POSTType<T, B>, body: B, add: Partial<$_POSTObject<B>> | undefined = undefined): { [k in keyof T]: k extends keyof B ? B[k] : any } {
    let R: any = {};

    for (let key in json) {
        let jValue = json[key];
        if (!jValue) continue;


        const defaultGet = (body: any) => {
            let ignored = ['name', 'description', 'title', 'content', 'id'];

            for (let k of keys) {
                const v = body[k];
                // if (typeof v !== 'undefined') {
                //     if (!!ignored.find(s => k.toLowerCase().includes(s)) || typeof v === 'boolean' || Array.isArray(v)) {
                //         return v;
                //     }
                //     const n = parseInt(v);
                //     return isNaN(n) || ((v+"").startsWith("0") && (v+"").length !== 1) ? v:n;
                // }
                return v;
            }
        };

        //@ts-ignore
        let obj: $_POSTObject<B> = !jValue || typeof jValue === 'string' ? {
            name: jValue,
        } : jValue;

        if (add) obj = {
            ...add,
            ...obj,
        };

        const { get = defaultGet, name = key, keys = [key], errorMsg = 'وارد نشده است', required = true } = obj;

        let value = get(body);
        if (typeof value === 'undefined' && required) {
            throw ({
                message: name + ' ' + errorMsg,
                code: 400,
                additional: {
                    key: keys.join(' || '),
                },
            });
        }

        R[key] = typeof value === 'string' ? arabicToEnglishNumber(value) : value;
    }
    return R;
}

export async function Try<T extends (...args: any) => any>(func: T, msg: string): Promise<ReturnType<T>> {
    try {
        return await func();
    } catch {
        throw (msg);
    }
}

export async function safeWait<T extends (...args: any) => any>(func: T): Promise<ReturnType<T> | undefined> {
    try {
        return await func();
    } catch {
        return undefined;
    }
}
