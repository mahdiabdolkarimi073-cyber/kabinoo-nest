"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../core/prisma.handler");
class UserCardItem extends prisma_handler_1.default {
    getModel() {
        return prisma.cartItem;
    }
    getName() {
        return "محصول سبد خرید";
    }
    async additionalPayload() {
        return {
            userId: (await this.getUser()).id
        };
    }
}
exports.default = UserCardItem;
//# sourceMappingURL=cart.js.map