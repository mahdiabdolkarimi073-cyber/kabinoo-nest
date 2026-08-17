
import { Get, Header, Req, Res, StreamableFile } from '@nestjs/common';
import { Request, Response } from 'express';
import { createReadStream, existsSync } from 'node:fs';
import * as path from 'node:path';

import * as process from 'node:process';
import * as mime from 'mime-types';
import { UPLOAD_DIR } from '../user/upload';
import RequestHandler from '@/core/request.handler';
import { ServerResponse } from 'node:http';
import PrismaSchemaGenerated, { getEnumInfo } from 'prisma/PrismaInfo';
import { makeEnum } from '@/utils/built-in';
import { Prisma } from '@prisma/client';

export default class Enum extends RequestHandler {
    GET() {
        return getEnumInfo(makeEnum(this.params['enum'] || this.params['id'] || this.params['key'] || this.params['id'] || this.throw("key"), ...Prisma.dmmf.datamodel.enums.map(o => o.name) as any))
    }
}