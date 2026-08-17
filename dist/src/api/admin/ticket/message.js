"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../../core/prisma.handler");
class AdminOffCodesHandler extends prisma_handler_1.default {
    async additionalPayload() {
        return {
            isAdmin: true,
            userId: (await this.getUser()).id
        };
    }
    getModel() {
        return prisma.ticketMessage;
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
//# sourceMappingURL=message.js.map