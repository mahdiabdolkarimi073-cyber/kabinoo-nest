import PrismaFullHandler from "@/core/prisma.handler";

export default class AdminOffCodesHandler extends PrismaFullHandler {

    getModel() {
        return prisma.order;
    }

    getName() {
        return "سفارش"
    }

    filter(obj: any) {
        if (obj?.user?.phone) {
            obj.user.phone = obj.user.phone() as any;
        }
        return obj;
    }

}