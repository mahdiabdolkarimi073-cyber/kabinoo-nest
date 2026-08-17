import PrismaFullHandler from "@/core/prisma.handler";

export default class ProductHandler extends PrismaFullHandler {
    getModel() {
        return prisma.portfolioCategory;
    }

    getName(): string {
        return "دسته بندی نمونه کار";
    }

}