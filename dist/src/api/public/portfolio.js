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
const prisma_limited_handler_1 = require("../../core/prisma.limited.handler");
const common_1 = require("@nestjs/common");
class PublicProducts extends prisma_limited_handler_1.default {
    getModel() {
        return prisma.portfolio;
    }
    enableQueryFilter() {
        return true;
    }
    getName() {
        return "نمونه کار";
    }
    async categories(req, res) {
        return this.splitInstance(async function () {
            return await prisma.portfolioCategory.findMany({
                where: {
                    parentId: this.params['parentId'] || null
                },
                include: {
                    children: true
                }
            });
        }, req, res);
    }
}
exports.default = PublicProducts;
__decorate([
    (0, common_1.Get)("categories"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PublicProducts.prototype, "categories", null);
//# sourceMappingURL=portfolio.js.map