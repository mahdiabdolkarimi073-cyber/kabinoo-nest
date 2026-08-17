"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../../core/prisma.handler");
class AdminProductColorsHandler extends prisma_handler_1.default {
    getModel() {
        return prisma.productColor;
    }
    getName() {
        return "رنگ محصول";
    }
}
exports.default = AdminProductColorsHandler;
//# sourceMappingURL=colors.js.map