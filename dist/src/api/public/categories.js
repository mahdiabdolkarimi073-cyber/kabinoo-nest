"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_limited_handler_1 = require("../../core/prisma.limited.handler");
class PublicProducts extends prisma_limited_handler_1.default {
    getModel() {
        return prisma.category;
    }
    enableQueryInclude() {
        return true;
    }
    enableQueryFilter() {
        return true;
    }
    getName() {
        return "دسته بندی";
    }
}
exports.default = PublicProducts;
//# sourceMappingURL=categories.js.map