import PrismaFullHandler from "@/core/prisma.handler";

export default class ProductMaterialsHandler extends PrismaFullHandler {
    getModel() {
        return prisma.productMaterial;
    }

    getName(): string {
        return "متریال محصول";
    }
}