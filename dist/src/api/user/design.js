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
        return prisma.customDesign;
    }
    getName() {
        return "طراحی";
    }
}
exports.default = DesignHandler;
//# sourceMappingURL=design.js.map