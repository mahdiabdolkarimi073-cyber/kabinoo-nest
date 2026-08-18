"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../core/prisma.handler");
class AdminAuthorHandler extends prisma_handler_1.default {
    getModel() {
        return prisma.user;
    }
    getName() {
        return "نویسنده";
    }
    enableQueryFilter() {
        return true;
    }
    async GET_findFirst(id) {
        const base = await super.GET_findFirst(id);
        if (id) {
            base.where = {
                ...base.where,
                isAuthor: true,
            };
        }
        else {
            base.where = {
                ...base.where,
                isAuthor: true,
            };
        }
        return base;
    }
    filter(obj) {
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
    async beforeCreate(fields) {
        return {
            ...fields,
            isAuthor: true,
        };
    }
    async beforeEdit(fields) {
        const filtered = { ...fields };
        delete filtered.password;
        delete filtered.token;
        delete filtered.isAdmin;
        return filtered;
    }
}
exports.default = AdminAuthorHandler;
//# sourceMappingURL=author.js.map