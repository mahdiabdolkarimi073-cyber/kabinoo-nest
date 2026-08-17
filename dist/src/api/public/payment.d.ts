import { Request, Response } from 'express';
import RequestHandler from '@/core/request.handler';
export default class Handler extends RequestHandler {
    handle(name?: string): Promise<any>;
    _id(req: Request, res: Response): Promise<void>;
    single(): Promise<{
        link: string;
    }>;
}
