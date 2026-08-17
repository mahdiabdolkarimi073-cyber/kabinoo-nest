import PrismaFullHandler from "@/core/prisma.handler";
import PrismaLimitHandler from "@/core/prisma.limited.handler";

export default class DesignHandler extends PrismaLimitHandler {

    async GET() {
        if (!this.params['id']) this.throw("access denied");
        return super.GET();
    }

    getModel() {
        return prisma.customDesign;
    }

    getName() {
        return "طراحی"
    }

}