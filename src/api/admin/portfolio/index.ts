import PrismaFullHandler from "@/core/prisma.handler";

export default class ProductHandler extends PrismaFullHandler {
    getModel() {
        return prisma.portfolio;
    }

    getName(): string {
        return "نمونه کار";
    }
}