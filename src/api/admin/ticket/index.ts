import PrismaFullHandler from "@/core/prisma.handler";

export default class AdminOffCodesHandler extends PrismaFullHandler {

    getModel() {
        return prisma.ticket;
    }

    getName() {
        return "تیکت"
    }

    filter(obj: any) {
        if (obj?.user?.phone) {
            obj.user.phone = obj.user.phone() as any;
        }
        return obj;
    }

}