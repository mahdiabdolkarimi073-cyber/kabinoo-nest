import RequestHandler from '@/core/request.handler';
export default class Test extends RequestHandler {
    GET(): Promise<{
        redirect: string;
        payment: {
            id: string;
            token: string | null;
            userId: string;
            created_at: Date;
            price: number;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            redirect: string;
            paid_at: Date | null;
        };
    }>;
    POST(): Promise<{
        ip1: string;
        ip2: string;
    }>;
}
