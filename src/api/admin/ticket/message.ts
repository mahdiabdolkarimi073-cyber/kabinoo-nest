import PrismaFullHandler from "@/core/prisma.handler";

export default class AdminOffCodesHandler extends PrismaFullHandler {

    async additionalPayload() {
        return {
            isAdmin: true,
            userId: (await this.getUser()).id
        }
    }

    getModel() {
        return prisma.ticketMessage;
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