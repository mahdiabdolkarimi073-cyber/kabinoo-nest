import PrismaFullHandler from "@/core/prisma.handler";

export default class DesignRequestHandler extends PrismaFullHandler {
    getModel() {
        return prisma.designRequest;
    }

    getName() {
        return "درخواست طراحی"
    }
}