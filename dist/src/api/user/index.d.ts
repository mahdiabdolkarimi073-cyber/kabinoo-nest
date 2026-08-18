import { User } from '@prisma/client';
import { Request, Response } from 'express';
import PrismaFullHandler from "../../core/prisma.handler";
export default class UserHandler extends PrismaFullHandler {
    static onMount(): void;
    GET(): Promise<{
        name: string;
        id: string;
        nationalCode: string | null;
        email: string | null;
        joined_at: Date;
        isAdmin: boolean;
        refCode: string;
        refId: string | null;
        isAuthor: boolean;
        token: () => string;
        password: () => string;
        phone: () => string;
    }>;
    getModel(): import("@prisma/client/runtime/library").DynamicModelExtensionThis<import(".prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
        result: {
            user: {
                readonly password: () => {
                    readonly needs: {
                        readonly password: true;
                    };
                    readonly compute: (params: User) => () => string;
                };
                readonly token: () => {
                    readonly needs: {
                        readonly token: true;
                    };
                    readonly compute: (params: User) => () => string;
                };
                readonly phone: () => {
                    readonly needs: {
                        readonly phone: true;
                    };
                    readonly compute: (params: User) => () => string;
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
    }, {}>, "User", {
        result: {
            user: {
                readonly password: () => {
                    readonly needs: {
                        readonly password: true;
                    };
                    readonly compute: (params: User) => () => string;
                };
                readonly token: () => {
                    readonly needs: {
                        readonly token: true;
                    };
                    readonly compute: (params: User) => () => string;
                };
                readonly phone: () => {
                    readonly needs: {
                        readonly phone: true;
                    };
                    readonly compute: (params: User) => () => string;
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
    additionalPayload(): Promise<{
        id: string;
        token: any;
        password: any;
        phone: any;
    }>;
    POST(): Promise<void>;
    comment(req: Request, res: Response): Promise<void>;
}
export declare const UserDbResult: {
    readonly password: {
        readonly needs: {
            readonly password: true;
        };
        readonly compute: (params: User) => () => string;
    };
    readonly token: {
        readonly needs: {
            readonly token: true;
        };
        readonly compute: (params: User) => () => string;
    };
    readonly phone: {
        readonly needs: {
            readonly phone: true;
        };
        readonly compute: (params: User) => () => string;
    };
};
