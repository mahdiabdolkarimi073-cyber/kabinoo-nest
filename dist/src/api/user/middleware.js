"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_handler_1 = require("../../core/request.handler");
class UserMiddleware {
    async use(req, res, next) {
        const handler = new request_handler_1.default(req, res);
        const user = await handler.getUser();
        if (!user)
            return handler.response("باید وارد شوید", 401, 'Unauthenticated');
        req.params['userId'] = user.id;
        next();
    }
}
exports.default = UserMiddleware;
//# sourceMappingURL=middleware.js.map