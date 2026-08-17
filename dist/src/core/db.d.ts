import { Prisma, PrismaClient } from '@prisma/client';
import ModelName = Prisma.ModelName;
declare global {
    var __instance: PrismaClient;
    var prisma: typeof _prisma;
}
declare const _prisma: import("@prisma/client/runtime/library").DynamicClientExtensionThis<Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
    result: {
        user: {
            readonly password: () => {
                readonly needs: {
                    readonly password: true;
                };
                readonly compute: (params: import(".prisma/client").User) => () => string;
            };
            readonly token: () => {
                readonly needs: {
                    readonly token: true;
                };
                readonly compute: (params: import(".prisma/client").User) => () => string;
            };
            readonly phone: () => {
                readonly needs: {
                    readonly phone: true;
                };
                readonly compute: (params: import(".prisma/client").User) => () => string;
            };
        };
        product: {
            finalPrice: () => {
                needs: {
                    price: true;
                    offPercent: true;
                };
                compute({ price, offPercent }: {
                    price: number;
                    offPercent: number;
                }): number;
            };
        };
    };
    model: {};
    query: {};
    client: {};
}, {}>, Prisma.TypeMapCb<Prisma.PrismaClientOptions>, {
    result: {
        user: {
            readonly password: () => {
                readonly needs: {
                    readonly password: true;
                };
                readonly compute: (params: import(".prisma/client").User) => () => string;
            };
            readonly token: () => {
                readonly needs: {
                    readonly token: true;
                };
                readonly compute: (params: import(".prisma/client").User) => () => string;
            };
            readonly phone: () => {
                readonly needs: {
                    readonly phone: true;
                };
                readonly compute: (params: import(".prisma/client").User) => () => string;
            };
        };
        product: {
            finalPrice: () => {
                needs: {
                    price: true;
                    offPercent: true;
                };
                compute({ price, offPercent }: {
                    price: number;
                    offPercent: number;
                }): number;
            };
        };
    };
    model: {};
    query: {};
    client: {};
}>;
export default _prisma;
export declare const initDB: () => void;
export type PrismaType<T extends Prisma.TypeMap['meta']['modelProps']> = Awaited<ReturnType<(typeof _prisma)[T]['create']>>;
export declare function watchDB<T extends ModelName, O extends keyof Prisma.TypeMap['model'][T]['operations']>(key: string, model: T, operation: O | O[], func: (args: Partial<Prisma.TypeMap['model'][T]['operations'][O]>) => any, type?: 'before' | 'after'): void;
