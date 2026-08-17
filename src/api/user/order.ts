import RequestHandler from "@/core/request.handler";
import { CartItem } from "@prisma/client";
import { getValidOffCode } from "./offCode";
import { Get, Post, Req, Res } from "@nestjs/common";
import { makeEnum, Throw } from '@/utils/built-in';
import { getPaymentLink, onPaymentSuccessful } from "@/core/payment/Payment";

export default class UserOrderHandler extends RequestHandler {


    @Get(":id")
    async GET() {
        const id = this.params['id'];
        const user = await this.getUser();
        this.debug("id", id)

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
        }))
    }

    @Post("payment")
    async payament(@Req() req, @Res() res) {
        return this.splitInstance(async function () {
            const order = await prisma.order.findUnique({
                where: {
                    id: this.get('id') + ""
                }
            }) || this.throw("Order not found");
            const method = makeEnum(this.get('method'), "DIRECT", "INSTALLMENT");
            const user = await this.getUser(true);

            if (method === "INSTALLMENT") {
                const prepay = +this.get('prepay') || this.throw("مبلغ پیش پرداخت اشتباه است");
                const checks = (this.json['checks'] || []) as {
                    amount: number
                    from: string
                    to: string
                    id: string
                    file: string
                }[];
                if (!checks.length) this.throw("حداقل یک چک مورد نیاز است!");
                const checkAmount = +this.get('checkAmount') || this.throw("مبلغ هرچک مورد نیاز است");

                const finalPrice = prepay + (checkAmount * checks.length);
                if (finalPrice < order.finalPrice) this.throw("جمع مبالغ با مبلغ نهایی سفارش همخوانی ندارد");

                const payment = await prisma.payment.create({
                    data: {
                        price: prepay,
                        userId: user.id,
                        redirect: "/user/order/" + order.id
                    }
                });

                const link = await getPaymentLink(payment);

                onPaymentSuccessful(payment, async () => {
                    await prisma.order.update({
                        where: {
                            id: order.id
                        },
                        data: {
                            status: "PAY_CHECK",
                            paymentId: payment.id,
                            paymentMethod: "INSTALLMENT"
                        }
                    })
                    await prisma.paymentCheck.createMany({
                        data: checks.map((o, i) => ({
                            amount: +o.amount || checkAmount,
                            image: o.file || this.throw(`فایل چک ${i + 1} وارد نشده`),
                            checkId: o.id || this.throw(`شناسه چک ${i + 1} وارد نشده`),
                            expire_at: new Date(o.to),
                            start_at: new Date(o.from),
                            orderId: order.id
                        }))
                    })
                });


                return {
                    link,
                    payment
                }
            }
            else if (method === "DIRECT") {
                const payment = await prisma.payment.create({
                    data: {
                        userId: user.id,
                        price: order.finalPrice,
                        redirect: "/user/order/" + order.id
                    }
                });
                const link = await getPaymentLink(payment);

                onPaymentSuccessful(payment, async () => {
                    await prisma.order.update({
                        where: {
                            id: order.id
                        },
                        data: {
                            status: "PENDING",
                            paymentId: payment.id,
                            paymentMethod: "DIRECT"
                        }
                    })
                })

                return {
                    link,
                    payment
                }
            } else this.throw("Method not supported");
        }, req, res);
    }

    @Post("cancel")
    async cancel(@Req() req, @Res() res) {
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
            })

            return this.msg('لغو شد');
        }, req, res);
    }

    async POST() {
        const user = await this.getUser(true);
        this.debug(user);
        const _offCode = this.get("offCode");
        const offCode = await getValidOffCode(user.id, _offCode).catch(() => undefined as never);
        const items = await prisma.cartItem.findMany({
            where: {
                userId: user.id
            },
            include: {
                product: true,
                custom: true
            }
        })
        if (!items.length) this.throw("هیچ محصولی در سبد خرید شما نیست!")

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
        })
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
            })
        }
        await prisma.cartItem.deleteMany({
            where: {
                userId: user.id
            }
        })
        return order;
    }

}