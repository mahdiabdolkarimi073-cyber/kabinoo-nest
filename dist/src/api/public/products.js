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
        return prisma.product;
    }
    enableQueryInclude() {
        return true;
    }
    enableFullyInclude() {
        return true;
    }
    getName() {
        return "محصول";
    }
    async comments(req, res) {
        this.splitInstance(async function () {
            return await prisma.productComment.findMany({
                take: 10,
                orderBy: {
                    created_at: "desc"
                }
            });
        }, req, res);
    }
    async comment(req, res) {
        this.splitInstance(async function () {
            const params = await this.$_PARAMS({
                product: "نشانه محصول",
                content: "محتوای نظر",
                rating: "امتیاز",
                author: "نام کاربر"
            });
            if (isNaN(+params.rating) || +params.rating < 0 || +params.rating > 5)
                this.throw("Invalid Rating");
            const product = await prisma.product.findUnique({
                where: {
                    id: params.product
                }
            }) || this.throw('محصول یافت نشد');
            await prisma.productComment.create({
                data: {
                    productId: params.product + "",
                    author: params.author + "",
                    content: params.content + "",
                    rate: +params.rating,
                    userId: (await this.getUser())?.id
                }
            });
            await prisma.product.update({
                where: {
                    id: product.id
                },
                data: {
                    rating: product.rating !== null ? (product.rating + (+params.rating)) / 2 : +params.rating
                }
            });
            return this.msg("باموفقیت نظر شما ثبت شد");
        }, req, res);
    }
    async items(req, res) {
        this.splitInstance(async function () {
            const item = this.params['id'];
            const model = prisma[`product${item.slice(0, 1).toUpperCase()}${item.slice(1).toLowerCase()}`];
            if (!model)
                this.throw("Invalid Request");
            const items = await model.findMany();
            return items;
        }, req, res);
    }
    async _filter(req, res) {
        this.splitInstance(async function () {
            const pR = this.params['priceRange']?.split(",").map(Number);
            const wR = this.params['widthRange']?.split(",").map(Number);
            const { category, detail, material, color } = this.params;
            const v = (k, v) => {
                return !!v ? {
                    [k]: +v || v
                } : {};
            };
            return await prisma.product.findMany({
                where: {
                    ...v("colorId", color),
                    ...v("categoryId", category),
                    ...v("materialId", material),
                    ...v("detailId", detail),
                    ...(!!pR ? {
                        price: {
                            gte: pR[0],
                            lte: pR[1]
                        }
                    } : {}),
                    ...(!!wR ? {
                        x: {
                            gte: wR[0],
                            lte: wR[1]
                        }
                    } : {})
                },
                include: {
                    material: true,
                    detail: true,
                    category: true,
                    color: true
                }
            });
        }, req, res);
    }
}
exports.default = PublicProducts;
__decorate([
    (0, common_1.Get)("comments"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PublicProducts.prototype, "comments", null);
__decorate([
    (0, common_1.Post)("comment"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PublicProducts.prototype, "comment", null);
__decorate([
    (0, common_1.Get)("items"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PublicProducts.prototype, "items", null);
__decorate([
    (0, common_1.Get)("filter"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PublicProducts.prototype, "_filter", null);
//# sourceMappingURL=products.js.map