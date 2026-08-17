import PrismaFullHandler from "@/core/prisma.handler";
import PrismaLimitHandler from "@/core/prisma.limited.handler";
import { Post, Req, Res } from "@nestjs/common";

export default class DesignRequestHandler extends PrismaLimitHandler {

    async additionalPayload(): Promise<Record<any, any>> {
        return {
            userId: (await this.getUser()).id
        }
    }


    getModel() {
        return prisma.payment;
    }

    getName() {
        return "رسید"
    }

}