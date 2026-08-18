import PrismaLimitHandler from "../../core/prisma.limited.handler";
import { Request, Response } from "express";
export default class PublicArticleHandler extends PrismaLimitHandler {
    getModel(): import("@prisma/client/runtime/library").DynamicModelExtensionThis<import(".prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
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
    }, {}>, "Article", {
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
    enableQueryInclude(): boolean;
    enableFullyInclude(): boolean;
    getName(): string;
    GET_findFirst(id: any): Promise<any>;
    bySlug(req: Request, res: Response): Promise<any>;
}
