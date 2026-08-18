import PrismaFullHandler from "@/core/prisma.handler";

export default class AuthorArticleHandler extends PrismaFullHandler {
    getModel() {
        return prisma.article;
    }

    getName() {
        return "مقاله";
    }

    isFullAccess() {
        return true;
    }

    async GET_findFirst(id: any) {
        const base = await super.GET_findFirst(id);
        const userId = this.params["userId"];
        base.where = {
            ...base.where,
            authorId: userId,
        };
        return base;
    }

    async beforeCreate(fields: any) {
        const userId = this.params["userId"];
        return {
            ...fields,
            authorId: userId,
        };
    }

    async beforeEdit(fields: any) {
        const userId = this.params["userId"];
        const articleId = this.getTargetId();
        if (articleId) {
            const article = await prisma.article.findUnique({
                where: { id: articleId + "" },
            });
            if (!article || article.authorId !== userId) {
                this.throw({ code: 403, message: "شما مالک این مقاله نیستید" });
            }
        }
        return fields;
    }
}
