"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../core/prisma.handler");
const common_1 = require("@nestjs/common");
class DesignRequestHandler extends prisma_handler_1.default {
    async additionalPayload() {
        return {
            userId: (await this.getUser()).id
        };
    }
    getModel() {
        return prisma.ticket;
    }
    getName() {
        return "تیکت";
    }
    async createMessage(req, res) {
        return this.splitInstance(async function () {
            const user = await this.getUser();
            console.log(this.json);
            return prisma.ticketMessage.create({
                data: this.json
            });
        }, req, res);
    }
}
exports.default = DesignRequestHandler;
__decorate([
    (0, common_1.Post)("/message"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DesignRequestHandler.prototype, "createMessage", null);
//# sourceMappingURL=ticket.js.map