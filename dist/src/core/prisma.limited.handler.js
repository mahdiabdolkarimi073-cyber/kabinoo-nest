"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("./prisma.handler");
class PrismaLimitHandler extends prisma_handler_1.default {
    DELETE() {
        this.methodDeny();
    }
    POST() {
        this.methodDeny();
    }
    async PUT() {
        this.methodDeny();
    }
    canCreate() {
        return false;
    }
    canEdit() {
        return false;
    }
}
exports.default = PrismaLimitHandler;
//# sourceMappingURL=prisma.limited.handler.js.map