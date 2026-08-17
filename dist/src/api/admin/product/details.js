"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../../core/prisma.handler");
class ProductDetailsHandler extends prisma_handler_1.default {
    getModel() {
        return prisma.productDetail;
    }
    getName() {
        return "خصوصیات محصول";
    }
}
exports.default = ProductDetailsHandler;
//# sourceMappingURL=details.js.map