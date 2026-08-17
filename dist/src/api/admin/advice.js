"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../core/prisma.handler");
class PublicProducts extends prisma_handler_1.default {
    getModel() {
        return prisma.userAdvice;
    }
    getName() {
        return "مشاوره";
    }
}
exports.default = PublicProducts;
//# sourceMappingURL=advice.js.map