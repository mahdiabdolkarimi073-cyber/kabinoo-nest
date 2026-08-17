"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
const db_1 = require("./core/db");
const global_1 = require("./global");
const process = require("node:process");
const node_http_1 = require("node:http");
async function bootstrap() {
    (0, db_1.initDB)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableShutdownHooks();
    app.enableCors();
    app.use(cookieParser());
    (0, global_1.registerGlobal)();
    const port = +process.env['PORT'] || 3080;
    const host = process.env['HOSTNAME'] || undefined;
    const server = await app.listen(port, host);
    console.log(`Server Listening ${host}:${port}`);
    server.on('upgrade', (request, duplex, head) => {
        const res = new node_http_1.ServerResponse(request);
        request.headers['duplex'] = duplex;
        request.headers['head'] = head;
        request.on('error', console.error);
        res.on('error', console.error);
        server.emit('request', request, res);
    });
    server.on('error', console.error);
}
bootstrap().catch(console.error);
//# sourceMappingURL=main.js.map