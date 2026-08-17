"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../core/prisma.handler");
class AdminOffCodesHandler extends prisma_handler_1.default {
    getModel() {
        return prisma.customDesign;
    }
    getName() {
        return "دیزاین ";
    }
}
exports.default = AdminOffCodesHandler;
//# sourceMappingURL=design.js.map