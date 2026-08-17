"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_limited_handler_1 = require("../../core/prisma.limited.handler");
class DesignRequestHandler extends prisma_limited_handler_1.default {
    async additionalPayload() {
        return {
            userId: (await this.getUser()).id
        };
    }
    getModel() {
        return prisma.payment;
    }
    getName() {
        return "رسید";
    }
}
exports.default = DesignRequestHandler;
//# sourceMappingURL=payment.js.map