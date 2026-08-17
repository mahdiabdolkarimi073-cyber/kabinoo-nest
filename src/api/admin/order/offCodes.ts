import PrismaFullHandler from "@/core/prisma.handler";

export default class AdminOffCodesHandler extends PrismaFullHandler {

    getModel() {
        return prisma.offCode;
    }

    getName() {
        return "کد تخفیف"
    }

}