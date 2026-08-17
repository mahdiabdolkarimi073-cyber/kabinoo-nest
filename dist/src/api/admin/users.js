"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../core/prisma.handler");
class AdminOffCodesHandler extends prisma_handler_1.default {
    getModel() {
        return prisma.user;
    }
    getName() {
        return "کاربر ";
    }
    filter(obj) {
        obj.phone = obj.phone();
        return obj;
    }
}
exports.default = AdminOffCodesHandler;
//# sourceMappingURL=users.js.map