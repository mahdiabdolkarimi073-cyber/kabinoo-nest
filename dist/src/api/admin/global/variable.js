"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../../core/prisma.handler");
class VariableHandler extends prisma_handler_1.default {
    getModel() {
        return prisma.variable;
    }
    getName() {
        return "متغیر";
    }
}
exports.default = VariableHandler;
//# sourceMappingURL=variable.js.map