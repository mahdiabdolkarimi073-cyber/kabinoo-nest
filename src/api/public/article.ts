import PrismaLimitHandler from "@/core/prisma.limited.handler";
import { Get, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";

export default class PublicArticleHandler extends PrismaLimitHandler {
    getModel() {
        return prisma.article;
    }

    enableQueryInclude(): boolean {
        return true;
    }

    enableFullyInclude(): boolean {
        return true;
    }

    getName() {
        return "مقاله";
    }

    async GET_findFirst(id: any) {
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

    @Get("bySlug")
    async bySlug(@Req() req: Request, @Res() res: Response) {
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
