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
const request_handler_1 = require("../../core/request.handler");
const offCode_1 = require("./offCode");
const common_1 = require("@nestjs/common");
const built_in_1 = require("../../utils/built-in");
const Payment_1 = require("../../core/payment/Payment");
class UserOrderHandler extends request_handler_1.default {
    async GET() {
        const id = this.params['id'];
        const user = await this.getUser();
        this.debug("id", id);
        if (id) {
            return await prisma.order.findUnique({
                where: {
                    id,
                    userId: user.id
                },
                include: {
                    products: {
                        include: {
                            product: true,
                            custom: true
                        }
                    },
                    offCode: true,
                    address: true,
                    checks: true,
                    payment: true
                }
            }) || this.throw("سفارش یافت نشد");
        }
        const all = await prisma.order.findMany({
            where: {
                userId: user.id
            },
            include: {
                products: {
                    include: {
                        product: true,
                        custom: true
                    }
                },
                offCode: {
                    select: {
                        percent: true,
                        id: true
                    }
                }
            },
            orderBy: {
                created_at: "desc"
            }
        });
        return all.map(o => ({
            ...o,
            products: undefined,
            label: o.products.map(o => o.product?.name || o?.custom?.name).join(", ")
        }));
    }
    async payament(req, res) {
        return this.splitInstance(async function () {
            const order = await prisma.order.findUnique({
                where: {
                    id: this.get('id') + ""
                }
            }) || this.throw("Order not found");
            const method = (0, built_in_1.makeEnum)(this.get('method'), "DIRECT", "INSTALLMENT");
            const user = await this.getUser(true);
            if (method === "INSTALLMENT") {
                const prepay = +this.get('prepay') || this.throw("مبلغ پیش پرداخت اشتباه است");
                const checks = (this.json['checks'] || []);
                if (!checks.length)
                    this.throw("حداقل یک چک مورد نیاز است!");
                const checkAmount = +this.get('checkAmount') || this.throw("مبلغ هرچک مورد نیاز است");
                const finalPrice = prepay + (checkAmount * checks.length);
                if (finalPrice < order.finalPrice)
                    this.throw("جمع مبالغ با مبلغ نهایی سفارش همخوانی ندارد");
                const payment = await prisma.payment.create({
                    data: {
                        price: prepay,
                        userId: user.id,
                        redirect: "/user/order/" + order.id
                    }
                });
                const link = await (0, Payment_1.getPaymentLink)(payment);
                (0, Payment_1.onPaymentSuccessful)(payment, async () => {
                    await prisma.order.update({
                        where: {
                            id: order.id
                        },
                        data: {
                            status: "PAY_CHECK",
                            paymentId: payment.id,
                            paymentMethod: "INSTALLMENT"
                        }
                    });
                    await prisma.paymentCheck.createMany({
                        data: checks.map((o, i) => ({
                            amount: +o.amount || checkAmount,
                            image: o.file || this.throw(`فایل چک ${i + 1} وارد نشده`),
                            checkId: o.id || this.throw(`شناسه چک ${i + 1} وارد نشده`),
                            expire_at: new Date(o.to),
                            start_at: new Date(o.from),
                            orderId: order.id
                        }))
                    });
                });
                return {
                    link,
                    payment
                };
            }
            else if (method === "DIRECT") {
                const payment = await prisma.payment.create({
                    data: {
                        userId: user.id,
                        price: order.finalPrice,
                        redirect: "/user/order/" + order.id
                    }
                });
                const link = await (0, Payment_1.getPaymentLink)(payment);
                (0, Payment_1.onPaymentSuccessful)(payment, async () => {
                    await prisma.order.update({
                        where: {
                            id: order.id
                        },
                        data: {
                            status: "PENDING",
                            paymentId: payment.id,
                            paymentMethod: "DIRECT"
                        }
                    });
                });
                return {
                    link,
                    payment
                };
            }
            else
                this.throw("Method not supported");
        }, req, res);
    }
    async cancel(req, res) {
        return this.splitInstance(async function () {
            const order = await prisma.order.findUnique({
                where: {
                    id: this.get('id') + ""
                }
            }) || this.throw("Order not found");
            await prisma.order.update({
                where: {
                    id: order.id
                },
                data: {
                    status: "CANCELED"
                }
            });
            return this.msg('لغو شد');
        }, req, res);
    }
    async POST() {
        const user = await this.getUser(true);
        this.debug(user);
        const _offCode = this.get("offCode");
        const offCode = await (0, offCode_1.getValidOffCode)(user.id, _offCode).catch(() => undefined);
        const items = await prisma.cartItem.findMany({
            where: {
                userId: user.id
            },
            include: {
                product: true,
                custom: true
            }
        });
        if (!items.length)
            this.throw("هیچ محصولی در سبد خرید شما نیست!");
        const totalPrice = items.reduce((i, o) => i + (o.product?.finalPrice || o?.custom?.price || 0), 0);
        const finalPrice = totalPrice - (totalPrice / 100 * (offCode?.percent || 0));
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                totalPrice: totalPrice,
                finalPrice: finalPrice,
                offCodeId: offCode?.id,
                products: {
                    createMany: {
                        data: items.map(o => ({
                            customDesignId: o.customDesignId,
                            productId: o.productId
                        }))
                    }
                },
                addressId: this.get("address") || this.get("addressId") || this.throw("آدرس وارد نشده است")
            },
            include: {
                products: true
            }
        });
        if (offCode) {
            await prisma.offCode.update({
                where: {
                    id: offCode.id
                },
                data: {
                    used: {
                        increment: 1
                    }
                }
            });
        }
        await prisma.cartItem.deleteMany({
            where: {
                userId: user.id
            }
        });
        return order;
    }
}
exports.default = UserOrderHandler;
__decorate([
    (0, common_1.Get)(":id"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserOrderHandler.prototype, "GET", null);
__decorate([
    (0, common_1.Post)("payment"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserOrderHandler.prototype, "payament", null);
__decorate([
    (0, common_1.Post)("cancel"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserOrderHandler.prototype, "cancel", null);
//# sourceMappingURL=order.js.map