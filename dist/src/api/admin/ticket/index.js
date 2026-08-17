"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../../core/prisma.handler");
class AdminOffCodesHandler extends prisma_handler_1.default {
    getModel() {
        return prisma.ticket;
    }
    getName() {
        return "تیکت";
    }
    filter(obj) {
        if (obj?.user?.phone) {
            obj.user.phone = obj.user.phone();
        }
        return obj;
    }
}
exports.default = AdminOffCodesHandler;
//# sourceMappingURL=index.js.map