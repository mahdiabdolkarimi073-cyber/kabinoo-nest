import PrismaFullHandler from "@/core/prisma.handler";

export default class UserCardItem extends PrismaFullHandler {

    getModel() {
        return prisma.cartItem;
    }

    getName() {
        return "محصول سبد خرید"
    }

    async additionalPayload() {
        return {
            userId: (await this.getUser()).id
        }
    }

}