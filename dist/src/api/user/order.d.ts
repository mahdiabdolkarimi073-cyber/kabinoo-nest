import RequestHandler from "@/core/request.handler";
export default class UserOrderHandler extends RequestHandler {
    GET(): Promise<({
        address: {
            id: string;
            phone: string;
            address: string;
            userId: string;
            receiver: string;
            state: string;
            city: string;
            phone2: string | null;
            postal: string | null;
        };
        offCode: {
            id: string;
            userId: string | null;
            percent: number;
            used: number;
            maxUsage: number | null;
        };
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
        products: ({
            product: {
                name: string;
                description: string;
                id: string;
                created_at: Date;
                price: number;
                updated_at: Date;
                x: number;
                y: number;
                z: number;
                offPercent: number;
                colorId: number;
                rating: number | null;
                images: string[];
                others: import("@prisma/client/runtime/library").JsonValue;
                deliveryDays: number;
                materialId: number;
                detailId: number;
                categoryId: string;
                designId: string | null;
                finalPrice: number;
            };
            custom: {
                name: string;
                id: string;
                userId: string;
                created_at: Date;
                slug: string;
                price: number;
                image: string;
                data: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            id: number;
            productId: string | null;
            customDesignId: string | null;
            orderId: string;
        })[];
        checks: {
            id: number;
            created_at: Date;
            image: string;
            amount: number;
            orderId: string;
            start_at: Date;
            expire_at: Date;
            checkId: string;
        }[];
    } & {
        id: string;
        userId: string;
        created_at: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalPrice: number;
        finalPrice: number;
        code: number;
        offCodeId: string | null;
        addressId: string | null;
        paymentId: string | null;
        paymentMethod: import(".prisma/client").$Enums.OrderPaymentMethod;
        statusReason: string | null;
    }) | {
        products: any;
        label: string;
        offCode: {
            id: string;
            percent: number;
        };
        id: string;
        userId: string;
        created_at: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalPrice: number;
        finalPrice: number;
        code: number;
        offCodeId: string | null;
        addressId: string | null;
        paymentId: string | null;
        paymentMethod: import(".prisma/client").$Enums.OrderPaymentMethod;
        statusReason: string | null;
    }[]>;
    payament(req: any, res: any): Promise<any>;
    cancel(req: any, res: any): Promise<any>;
    POST(): Promise<{
        products: {
            id: number;
            productId: string | null;
            customDesignId: string | null;
            orderId: string;
        }[];
    } & {
        id: string;
        userId: string;
        created_at: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalPrice: number;
        finalPrice: number;
        code: number;
        offCodeId: string | null;
        addressId: string | null;
        paymentId: string | null;
        paymentMethod: import(".prisma/client").$Enums.OrderPaymentMethod;
        statusReason: string | null;
    }>;
}
