import PrismaLimitHandler from "@/core/prisma.limited.handler";
import RequestHandler from "@/core/request.handler"

export default class PublicProducts extends PrismaLimitHandler {
    getModel() {
        return prisma.category;
    }

    enableQueryInclude(): boolean {
        return true;
    }

    enableQueryFilter(): boolean {
        return true;
    }

    getName() {
        return "دسته بندی"
    }
}