import PrismaFullHandler from "@/core/prisma.handler";

export default class AdminProductColorsHandler extends PrismaFullHandler {
    getModel() {
        return prisma.productColor;
    }

    getName(): string {
        return "رنگ محصول";
    }
}