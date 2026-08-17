"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../../core/prisma.handler");
class ProductHandler extends prisma_handler_1.default {
    getModel() {
        return prisma.portfolioCategory;
    }
    getName() {
        return "دسته بندی نمونه کار";
    }
}
exports.default = ProductHandler;
//# sourceMappingURL=category.js.map