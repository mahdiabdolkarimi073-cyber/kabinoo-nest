import { Response } from 'express';
import RequestHandler from "../../core/request.handler";
export default class UserUpload extends RequestHandler {
    test(body: any, res: Response): Promise<void>;
}
export declare function createFile(file: File, filePath: string): Promise<void>;
export declare const UPLOAD_DIR = "/uploaded";
export declare function updateFile(file: File, previousPath: string, newPath: string): Promise<string>;
export declare function downloadFile(url: string, init?: RequestInit): Promise<string>;
