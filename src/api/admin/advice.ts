import PrismaFullHandler from "@/core/prisma.handler";

export default class PublicProducts extends PrismaFullHandler {
    getModel() {
        return prisma.userAdvice;
    }

    getName() {
        return "مشاوره"
    }
    
}