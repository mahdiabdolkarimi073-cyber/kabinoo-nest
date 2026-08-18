import PrismaFullHandler from "../../core/prisma.handler";
import { PrismaType } from "../../core/db";
export default class AdminAuthorHandler extends PrismaFullHandler {
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
    }, {}>, "User", {
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
    getName(): string;
    enableQueryFilter(): boolean;
    GET_findFirst(id: any): Promise<any>;
    filter(obj: PrismaType<"user">): {
        id: string;
        name: string;
        email: string;
        nationalCode: string;
        phone: string;
        joined_at: Date;
        isAdmin: boolean;
        isAuthor: boolean;
    };
    beforeCreate(fields: any): Promise<any>;
    beforeEdit(fields: any): Promise<any>;
}
