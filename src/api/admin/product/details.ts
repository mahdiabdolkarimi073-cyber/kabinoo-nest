import PrismaFullHandler from "@/core/prisma.handler";

export default class ProductDetailsHandler extends PrismaFullHandler {
    getModel() {
        return prisma.productDetail;
    }

    getName(): string {
        return "خصوصیات محصول";
    }
}