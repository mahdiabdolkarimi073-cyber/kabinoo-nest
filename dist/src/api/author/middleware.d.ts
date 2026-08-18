import { NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
export default class AuthorMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: (error?: any) => void): Promise<void>;
}
