import PrismaFullHandler from "@/core/prisma.handler";

export default class AdminCategoryHandler extends PrismaFullHandler {
    getModel() {
        return prisma.category;
    }

    getName(): string {
        return "دسته بندی";
    }
}