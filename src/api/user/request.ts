import PrismaFullHandler from "@/core/prisma.handler";

export default class DesignRequestHandler extends PrismaFullHandler {

    async additionalPayload(): Promise<Record<any, any>> {
        return {
            userId: (await this.getUser()).id
        }
    }


    getModel() {
        return prisma.designRequest;
    }

    getName() {
        return "درخواست طراحی"
    }
}