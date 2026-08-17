
import { Get, Header, Req, Res, StreamableFile } from '@nestjs/common';
import { Request, Response } from 'express';
import { createReadStream, existsSync } from 'node:fs';
import * as path from 'node:path';

import * as process from 'node:process';
import * as mime from 'mime-types';
import { UPLOAD_DIR } from '../user/upload';
import RequestHandler from '@/core/request.handler';
import { ServerResponse } from 'node:http';

export default class UploadedHandler extends RequestHandler {

    @Get(":path")
    @Header('Cache-Control', 'max-age=3600')
    async file(@Req() req: Request) {
        return this.splitInstance(function () {
            const _path = path.join(process.cwd(), UPLOAD_DIR, req.params['path']);
            if (!existsSync(_path)) {
                return "404";
            }
            const st = createReadStream(_path);
            return new StreamableFile(st, {
                type: mime.lookup(_path)
            });
        },req, (new ServerResponse(req)) as any);
    }

}