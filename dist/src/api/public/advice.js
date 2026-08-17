"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../core/prisma.handler");
class PublicProducts extends prisma_handler_1.default {
    getModel() {
        return prisma.userAdvice;
    }
    async additionalPayload() {
        if (this.get('phone') && isNaN(+this.get('phone')))
            return this.throw("شماره تلفن معتبر نیست");
        return {
            userId: (await this.getUser()).id
        };
    }
    getName() {
        return "مشاوره";
    }
    async DELETE() {
        return this.methodDeny();
    }
    async GET() {
        return this.msg("");
    }
    async PUT() {
        return this.methodDeny();
    }
}
exports.default = PublicProducts;
//# sourceMappingURL=advice.js.map