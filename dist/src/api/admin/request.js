"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../core/prisma.handler");
class DesignRequestHandler extends prisma_handler_1.default {
    getModel() {
        return prisma.designRequest;
    }
    getName() {
        return "درخواست طراحی";
    }
}
exports.default = DesignRequestHandler;
//# sourceMappingURL=request.js.map