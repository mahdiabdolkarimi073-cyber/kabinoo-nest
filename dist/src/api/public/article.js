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
class PublicArticleHandler extends prisma_limited_handler_1.default {
    getModel() {
        return prisma.article;
    }
    enableQueryInclude() {
        return true;
    }
    enableFullyInclude() {
        return true;
    }
    getName() {
        return "مقاله";
    }
    async GET_findFirst(id) {
        const base = await super.GET_findFirst(id);
        if (id) {
            base.include = {
                ...base.include,
                author: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            };
        }
        return base;
    }
    async bySlug(req, res) {
        return this.splitInstance(async function () {
            const slug = this.get("slug", "اسلاگ مقاله");
            const article = await prisma.article.findUnique({
                where: { slug },
                include: {
                    author: {
                        select: { id: true, name: true },
                    },
                },
            }) || this.throw({ code: 404, message: "مقاله یافت نشد" });
            await prisma.article.update({
                where: { id: article.id },
                data: { views: { increment: 1 } },
            });
            return { ...article, views: article.views + 1 };
        }, req, res);
    }
}
exports.default = PublicArticleHandler;
__decorate([
    (0, common_1.Get)("bySlug"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PublicArticleHandler.prototype, "bySlug", null);
//# sourceMappingURL=article.js.map