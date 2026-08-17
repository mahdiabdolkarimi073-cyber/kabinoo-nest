import PrismaFullHandler from "@/core/prisma.handler";

export default class DesignHandler extends PrismaFullHandler {

    async additionalPayload(): Promise<Record<any, any>> {
        return {
            userId: (await this.getUser()).id
        }
    }


    getModel() {
        return prisma.address;
    }

    getName() {
        return "آدرس"
    }

}