import { PrismaType } from "@/core/db";
import PrismaFullHandler from "@/core/prisma.handler";

export default class AdminOffCodesHandler extends PrismaFullHandler {

    getModel() {
        return prisma.user;
    }

    getName() {
        return "کاربر "
    }

    filter(obj: PrismaType<'user'>) {
        obj.phone = obj.phone() as any;
        return obj;
    }

}