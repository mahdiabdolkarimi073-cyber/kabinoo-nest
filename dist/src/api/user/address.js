"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../core/prisma.handler");
class DesignHandler extends prisma_handler_1.default {
    async additionalPayload() {
        return {
            userId: (await this.getUser()).id
        };
    }
    getModel() {
        return prisma.address;
    }
    getName() {
        return "آدرس";
    }
}
exports.default = DesignHandler;
//# sourceMappingURL=address.js.map