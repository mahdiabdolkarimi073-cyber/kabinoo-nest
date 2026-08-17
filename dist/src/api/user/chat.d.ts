import PrismaFullHandler from "../../core/prisma.handler";
import { WebSocket } from "ws";
export default class Chat extends PrismaFullHandler {
    static Connections: Record<string, Record<string, WebSocket>>;
    static onMount(): void;
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
    }, {}>, "UserChatMessage", {
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
    additionalPayload(): Promise<{
        userId: string;
        chatId: string;
        isAdmin: boolean;
        targetUser: {
            name: string;
            id: string;
            nationalCode: string | null;
            email: string | null;
            joined_at: Date;
            isAdmin: boolean;
            refCode: string;
            refId: string | null;
            token: () => string;
            password: () => string;
            phone: () => string;
        };
    }>;
    getChat(_user?: any): Promise<{
        user: {
            name: string;
            id: string;
            nationalCode: string | null;
            email: string | null;
            joined_at: Date;
            isAdmin: boolean;
            refCode: string;
            refId: string | null;
            token: () => string;
            password: () => string;
            phone: () => string;
        };
        messages: {
            content: string;
            id: string;
            isAdmin: boolean;
            created_at: Date;
            chatId: string;
        }[];
    } & {
        id: string;
        userId: string;
        created_at: Date;
        updated_at: Date;
        answered: boolean;
        lastMsg: string | null;
    }>;
    GET(): Promise<{
        user: {
            name: string;
            id: string;
            nationalCode: string | null;
            email: string | null;
            joined_at: Date;
            isAdmin: boolean;
            refCode: string;
            refId: string | null;
            token: () => string;
            password: () => string;
            phone: () => string;
        };
        messages: {
            content: string;
            id: string;
            isAdmin: boolean;
            created_at: Date;
            chatId: string;
        }[];
    } & {
        id: string;
        userId: string;
        created_at: Date;
        updated_at: Date;
        answered: boolean;
        lastMsg: string | null;
    }>;
    PUT(): Promise<void>;
    onWebSocket(ws: WebSocket): Promise<void>;
    enableWebSocket(): boolean;
}
