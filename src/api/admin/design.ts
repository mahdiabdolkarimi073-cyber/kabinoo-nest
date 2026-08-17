import PrismaFullHandler from "@/core/prisma.handler";

export default class AdminOffCodesHandler extends PrismaFullHandler {

    getModel() {
        return prisma.customDesign;
    }

    getName() {
        return "دیزاین "
    }
}