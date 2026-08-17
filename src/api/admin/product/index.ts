import PrismaFullHandler from "@/core/prisma.handler";

export default class ProductHandler extends PrismaFullHandler {
    getModel() {
        return prisma.product;
    }

    getName(): string {
        return "محصول";
    }
}