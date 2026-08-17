"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../../core/prisma.handler");
class ProductMaterialsHandler extends prisma_handler_1.default {
    getModel() {
        return prisma.productMaterial;
    }
    getName() {
        return "متریال محصول";
    }
}
exports.default = ProductMaterialsHandler;
//# sourceMappingURL=materials.js.map