import PrismaFullHandler from "@/core/prisma.handler";
import { Post, Req, Res } from "@nestjs/common";

export default class DesignRequestHandler extends PrismaFullHandler {

    async additionalPayload(): Promise<Record<any, any>> {
        return {
            userId: (await this.getUser()).id
        }
    }


    getModel() {
        return prisma.ticket;
    }

    getName() {
        return "تیکت"
    }

    @Post("/message")
    async createMessage(@Req() req: any, @Res() res: any) {
        return this.splitInstance(async function () {
            const user = await this.getUser();
            console.log(this.json);
            return prisma.ticketMessage.create({
                data: this.json as any
            });
        }, req, res);
    }
}