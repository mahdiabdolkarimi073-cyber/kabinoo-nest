import { NestMiddleware } from "@nestjs/common";
import RequestHandler from "@/core/request.handler";
import { Request, Response } from "express";

export default class AuthorMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: (error?: any) => void) {
        const handler = new RequestHandler(req, res);
        const user = await handler.getUser();
        if (!user) return handler.response("باید وارد شوید", 401, "Unauthenticated");
        if (!user.isAuthor) return handler.response("شما دسترسی نویسنده ندارید", 403, "Forbidden");
        req.params["userId"] = user.id;
        next();
    }
}
