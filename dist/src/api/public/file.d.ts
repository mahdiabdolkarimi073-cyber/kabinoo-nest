import { Request } from 'express';
import RequestHandler from "../../core/request.handler";
export default class UploadedHandler extends RequestHandler {
    file(req: Request): Promise<any>;
}
