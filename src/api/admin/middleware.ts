import RequestHandler from "@/core/request.handler";
import { NestMiddleware } from "@nestjs/common";
import { Response,Request } from 'express';

export default class UserMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: (error?: any) => void) {
        const handler = new RequestHandler(req, res);
        const user = await handler.getUser();
        if (!user) return handler.response("باید وارد شوید", 401, 'Unauthenticated');
        if (!user.isAdmin) return handler.response("شما دسترسی لازم را ندارید", 403, 'Forbidden');
        next();
    }

}