import PrismaLimitHandler from "@/core/prisma.limited.handler";
import RequestHandler from "@/core/request.handler"
import { Get, Post, Req, Res } from "@nestjs/common";
import { Product } from "@prisma/client";
import { Request, Response } from "express"

export default class PublicProducts extends PrismaLimitHandler {
    getModel() {
        return prisma.portfolio;
    }

    enableQueryFilter(): boolean {
        return true;
    }

    getName() {
        return "نمونه کار"
    }

    @Get("categories")
    async categories(@Req() req: Request, @Res() res: Response) {
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