"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_handler_1 = require("../../core/request.handler");
class AuthorMiddleware {
    async use(req, res, next) {
        const handler = new request_handler_1.default(req, res);
        const user = await handler.getUser();
        if (!user)
            return handler.response("باید وارد شوید", 401, "Unauthenticated");
        if (!user.isAuthor)
            return handler.response("شما دسترسی نویسنده ندارید", 403, "Forbidden");
        req.params["userId"] = user.id;
        next();
    }
}
exports.default = AuthorMiddleware;
//# sourceMappingURL=middleware.js.map