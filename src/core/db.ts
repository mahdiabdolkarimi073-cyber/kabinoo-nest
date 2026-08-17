import { Prisma, PrismaClient } from '@prisma/client';
import { Operation } from '@prisma/client/runtime/library';
import ModelName = Prisma.ModelName;
import { UserDbResult } from '@/api/user';

declare global {
    var __instance: PrismaClient;
    var prisma: typeof _prisma;
}

const instance = global.__instance ?? new PrismaClient();
global.__instance ??= instance;

let _EVENTS: Partial<{
    [k in ModelName]: {
        [k2: string]: { operation: Operation[], func: Function, type: 'before' | 'after', key: string }[]
    }
}> = {};

const _prisma = instance.$extends({
    result: {
        user: UserDbResult,
        product: {
            finalPrice: {
                needs: {
                    price: true,
                    offPercent: true
                },
                compute({price, offPercent}) {
                    return Math.ceil(price - ((price / 100) * offPercent))
                }
            }
        }
    },
    query: {
        async $allOperations({ operation, model, args, query }) {

            const start = performance.now();
            const argsString = JSON.stringify(args);
            const events = Object.values(_EVENTS[model as ModelName] || {})
                .flat()
                .filter(o => o.operation.includes(operation as Operation));

            const beforeEvents = events.filter(o => o.type === 'before');
            await Promise.all(beforeEvents.map(async (event) => {
                try {
                    await event.func({ args });
                } catch (e: any) {
                    throw (new Error(e?.message ?? e, {
                        cause: `[${event.key}]: ${model}.${operation}(${argsString.slice(0, 10)}${argsString.length > 10 ? '...' : ''}) ${e?.message ?? e}`,
                    }));
                }
            }));
            const result = await query(args);


            const afterEvents = events.filter(o => o.type === 'after');
            for (let event of afterEvents) {
                try {
                    event.func({ args, result })?.catch?.(console.error);
                } catch (e) {
                    console.error(e);
                }
            }
            const end = performance.now();
            const time = Math.round(end - start);
            const level = time < 30 ? 'log' : time < 60 ? 'warn' : 'error';
            if (level !== 'log') console[level](`${model}.${operation}(${argsString.slice(0, 20)}${argsString.length > 10 ? '...' : ''}) ${time}ms`);

            return result;
        },
    },
});
global.prisma = _prisma;
export default _prisma;

// Just for import
export const initDB = () => {
    prisma.$connect();
    console.info('Database loaded');
};


export type PrismaType<T extends Prisma.TypeMap['meta']['modelProps']> =
    Awaited<
        ReturnType<(typeof _prisma)[T]['create']>
    >


export function watchDB<T extends ModelName, O extends keyof Prisma.TypeMap['model'][T]['operations']>(key: string, model: T, operation: O | O[], func: (args: Partial<Prisma.TypeMap['model'][T]['operations'][O]>) => any, type: 'before' | 'after' = 'after') {
    let defaultValue = _EVENTS[model] || ({} as never);

    //@ts-ignore
    defaultValue[key] ||= [];
    defaultValue[key].push({
        operation: Array.isArray(operation) ? operation as Operation[] : [operation as Operation],
        func,
        type,
        key,
    });

    _EVENTS[model] = defaultValue;
    console.log(`MIDDLEWARE [${key}] ${model}.${String(operation)}(${type}) registered`);
}
