import PrismaLimitHandler from "@/core/prisma.limited.handler";
import RequestHandler from "@/core/request.handler"
import { Get, Post, Req, Res } from "@nestjs/common";
import { Product } from "@prisma/client";
import { Request, Response } from "express"

export default class PublicProducts extends PrismaLimitHandler {
    getModel() {
        return prisma.product;
    }

    enableQueryInclude(): boolean {
        return true;
    }

    enableFullyInclude(): boolean {
        return true;
    }

    getName() {
        return "محصول"
    }

    @Get("comments")
    async comments(@Req() req: Request, @Res() res: Response) {
        this.splitInstance(async function () {
            return await prisma.productComment.findMany({
                take: 10,
                orderBy: {
                    created_at: "desc"
                }
            })
        },req,res)
    }

    @Post("comment")
    async comment(@Req() req: Request, @Res() res: Response) {
        this.splitInstance(async function () {
            const params = await this.$_PARAMS({
                product: "نشانه محصول",
                content: "محتوای نظر",
                rating: "امتیاز",
                author: "نام کاربر"
            })

            if (isNaN(+params.rating) || +params.rating < 0 || +params.rating > 5) this.throw("Invalid Rating");

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
            })
            await prisma.product.update({
                where: {
                    id: product.id
                },
                data: {
                    rating: product.rating !== null ? (product.rating + (+params.rating)) / 2 : +params.rating
                }
            })
            return this.msg("باموفقیت نظر شما ثبت شد")
        }, req, res);
    }

    @Get("items")
    async items(@Req() req: Request, @Res() res: Response) {
        this.splitInstance(async function () {
            const item = this.params['id'];
            const model = prisma[`product${item.slice(0,1).toUpperCase()}${item.slice(1).toLowerCase()}`];
            if (!model) this.throw("Invalid Request");

            const items = await model.findMany();
            return items;
        }, req, res);
    }

    @Get("filter")
    async _filter(@Req() req: Request, @Res() res: Response) {
        this.splitInstance(async function () {
            const pR = this.params['priceRange']?.split(",").map(Number);
            const wR = this.params['widthRange']?.split(",").map(Number);
            const {category, detail, material, color} = this.params;

            const v = (k: keyof Product, v: any) =>{
                return !!v ? {
                    [k]: +v || v
                }:{}
            }

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
                    }:{}),
                    ...(!!wR ? {
                        x: {
                            gte: wR[0],
                            lte: wR[1]
                        }
                    }:{})
                },
                include: {
                    material: true,
                    detail: true,
                    category: true,
                    color: true
                }
            })
        }, req, res);
    }


}