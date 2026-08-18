"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_handler_1 = require("../../core/prisma.handler");
class AuthorArticleHandler extends prisma_handler_1.default {
    getModel() {
        return prisma.article;
    }
    getName() {
        return "مقاله";
    }
    isFullAccess() {
        return true;
    }
    async GET_findFirst(id) {
        const base = await super.GET_findFirst(id);
        const userId = this.params["userId"];
        base.where = {
            ...base.where,
            authorId: userId,
        };
        return base;
    }
    async beforeCreate(fields) {
        const userId = this.params["userId"];
        return {
            ...fields,
            authorId: userId,
        };
    }
    async beforeEdit(fields) {
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
exports.default = AuthorArticleHandler;
//# sourceMappingURL=article.js.map