"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_handler_1 = require("../../core/request.handler");
class AuthorProfileHandler extends request_handler_1.default {
    async handle() {
        const userId = this.params["userId"];
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                nationalCode: true,
                phone: true,
                joined_at: true,
                isAuthor: true,
            },
        });
        if (!user)
            this.throw({ code: 404, message: "کاربر یافت نشد" });
        return user;
    }
}
exports.default = AuthorProfileHandler;
//# sourceMappingURL=profile.js.map