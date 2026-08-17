"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_limited_handler_1 = require("../../core/prisma.limited.handler");
class DesignHandler extends prisma_limited_handler_1.default {
    async GET() {
        if (!this.params['id'])
            this.throw("access denied");
        return super.GET();
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