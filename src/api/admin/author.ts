import PrismaFullHandler from "@/core/prisma.handler";
import { PrismaType } from "@/core/db";

export default class AdminAuthorHandler extends PrismaFullHandler {
    getModel() {
        return prisma.user;
    }

    getName() {
        return "نویسنده";
    }

    enableQueryFilter() {
        return true;
    }

    async GET_findFirst(id: any) {
        const base = await super.GET_findFirst(id);
        if (id) {
            base.where = {
                ...base.where,
                isAuthor: true,
            };
        } else {
            base.where = {
                ...base.where,
                isAuthor: true,
            };
        }
        return base;
    }

    filter(obj: PrismaType<"user">) {
        return {
            id: obj.id,
            name: obj.name,
            email: obj.email,
            nationalCode: obj.nationalCode,
            phone: obj.phone(),
            joined_at: obj.joined_at,
            isAdmin: obj.isAdmin,
            isAuthor: obj.isAuthor,
        };
    }

    async beforeCreate(fields: any) {
        return {
            ...fields,
            isAuthor: true,
        };
    }

    async beforeEdit(fields: any) {
        const filtered = { ...fields };
        delete filtered.password;
        delete filtered.token;
        delete filtered.isAdmin;
        return filtered;
    }
}
