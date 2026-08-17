import {config} from "dotenv"
config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { initDB } from '@/core/db';
import { registerGlobal } from '@/global';
import * as process from 'node:process';
import { Server, ServerResponse } from 'node:http';


async function bootstrap() {
    initDB();
    const app = await NestFactory.create(AppModule);
    app.enableShutdownHooks();
    app.enableCors();
    app.use(cookieParser());
    registerGlobal();
    const port = +process.env['PORT'] || 3080;
    const host = process.env['HOSTNAME'] || undefined;
    const server = await app.listen(port, host) as Server;
    
    console.log(`Server Listening ${host}:${port}`);
    server.on('upgrade', (request, duplex, head) => {
        const res = new ServerResponse(request);
        request.headers['duplex'] = duplex as unknown as string;
        request.headers['head'] = head as unknown as string;
        request.on('error', console.error);
        res.on('error', console.error);
        server.emit('request', request, res);
    });
    server.on('error', console.error);
}

bootstrap().catch(console.error);
