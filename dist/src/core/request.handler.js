"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const built_in_1 = require("../utils/built-in");
const request_1 = require("../utils/request");
const prisma_error_1 = require("./prisma.error");
const ws_1 = require("ws");
const ws_handler_1 = require("./ws.handler");
const global_1 = require("../global");
const string_1 = require("../utils/string");
class RequestHandler {
    request;
    res;
    params = {};
    json = {};
    disableResponseEnd = false;
    separated = false;
    id = "MainHandler";
    _user;
    _dev_logs = [];
    constructor(req, res) {
        this.request = req;
        this.res = res;
    }
    debug(...args) {
        if (!global_1.VARS.isDev)
            return;
        const txt = `[DEBUG:${this.id}] ${this.request ? this.request.method + " " + this.request.url : ""}`;
        const final = txt + " " + args.map(o => o?.toString?.()).join(" ");
        console.debug(txt, ...args);
        if (this.id !== 'MainHandler')
            this._dev_logs.push(final);
    }
    async incoming(req, res, name) {
        if (!req || !res)
            return;
        this.debug(req.method, req.url, name || "");
        await this.splitInstance(async function () {
            const upgrade = this.request.get('upgrade');
            if (upgrade === 'websocket')
                return this._handleUpgrade();
            return await this.handle(name || this.request.method);
        }, req, res);
    }
    enableWebSocket() {
        return false;
    }
    async _handleUpgrade() {
        const { duplex: _duplex, head } = this.request.headers;
        if (typeof _duplex !== 'object' && typeof head !== 'object')
            throw ('Invalid Upgrade (HEAD|DUPLEX)');
        const duplex = _duplex;
        if (!this.enableWebSocket()) {
            this.debug("WS Upgrade denied");
            const msg = 'HTTP/1.1 403 Upgrade Denied\r\n' +
                'Content-Type: text/plain\r\n' +
                'Connection: close\r\n\r\n' +
                'This endpoint does not support WebSocket connections.';
            duplex.write(msg, () => {
                duplex.destroy();
            });
            return;
        }
        this.debug("Handle WS Upgrade");
        const server = new ws_1.WebSocketServer({
            noServer: true,
            autoPong: true,
            allowSynchronousEvents: false,
        });
        if (!duplex || !head)
            throw ('Invalid Upgrade');
        server.on('error', console.error);
        const ws = await new Promise(r => {
            server.handleUpgrade(this.request, duplex, head, (ws) => {
                r(ws);
            });
        });
        ws.onerror = console.error;
        const safe = (0, ws_handler_1.safeWebsocket)(ws);
        this.onWebSocket(safe);
    }
    onWebSocket(ws) {
        if (!this.enableWebSocket())
            throw ('Invalid');
    }
    async createInstance(req, res) {
        const instance = new this.constructor(req, res);
        instance.id = (0, string_1.generateRandomNumber)(5);
        instance.res = res;
        instance.request = req;
        instance.separated = true;
        instance.res.on('error', console.error);
        try {
            if (!instance.request.originalUrl.startsWith('http'))
                instance.request.originalUrl = `http://localhost${req.url || ''}`;
        }
        catch {
        }
        instance.params = req.params;
        instance.params = {
            ...instance.params,
            ...Object.fromEntries(new URL(req.originalUrl).searchParams.entries()),
        };
        try {
            if (typeof req.body === 'object' && Object.keys(req.body).length !== 0)
                instance.json = req.body;
        }
        catch {
        }
        await instance.handleExecute(async function () {
            await instance.onReady();
            const additional = await instance.additionalPayload();
            if (!!Object.keys(additional).length) {
                instance.json = {
                    ...instance.json,
                    ...additional,
                };
            }
        });
        return instance;
    }
    async splitInstance(func, req, res) {
        const instance = await this.createInstance(req, res);
        return await instance.handleExecute(func.bind(instance));
    }
    async onReady() {
    }
    async handleExecute(func) {
        try {
            let firstLine = func.toString().split('\n')[0].replaceAll(/\s+/g, '');
            if (!firstLine.startsWith('asyncfunction') && !firstLine.startsWith('function')) {
                this.throw(`Arrow Function doesn't allowed in handleExecute`);
            }
            const R = await func.bind(this)();
            if (!!R && !(R instanceof common_1.StreamableFile) && typeof R === 'object') {
                return this.response(R);
            }
            return R;
        }
        catch (err) {
            this.debug(`${func.name} has error`);
            this.debug(err);
            if (this.res.closed || this.res.headersSent || this.res.writableEnded)
                return;
            let status = err?.code || 400;
            let error = err?.message ?? err;
            switch (err.code) {
                case 'P2002':
                    error = `دیتا از قبل موجود است: ${err.meta.target}`;
                    break;
                case 'P2014':
                    error = `نشانه اشتباه است: ${err.meta.target}`;
                    break;
                case 'P2003':
                    error = `اطلاعات ارسال شده صحیح نیست ${err?.meta?.target ?? err?.meta?.constraint}`;
                    break;
                default:
                    const msg = err?.message || undefined;
                    if (!msg || !msg.includes('prisma'))
                        break;
                    const lastLine = msg.split('\n').at(-1);
                    const target = lastLine.split('`').slice(1, 2).join('`');
                    if (!!target.trim() && target.length < 15) {
                        error = `${target} اشتباه است`;
                        err.additional = (0, prisma_error_1.handlePrismaErrorAdditionalInfo)(msg);
                    }
            }
            return this.response({
                additional: {
                    ...err?.additional || {},
                    message: error,
                },
            }, status, status === 400 ? 'Params Error' : 'Error');
        }
    }
    async handle(funcName) {
        const func = this[funcName];
        if (!func)
            this.methodDeny();
        return await func.bind(this)();
    }
    async additionalPayload() {
        return {};
    }
    async response(o, ok = true, msg = 'OK') {
        if (!this.res) {
            console.trace();
            this.throw('Response object not found!');
        }
        if (typeof o === 'string') {
            o = {
                additional: { message: o }
            };
        }
        if (this.res.writableFinished || this.res.closed || this.res.headersSent || this.res.writableEnded)
            return;
        const status = typeof ok === 'boolean' ? ok ? 200 : 400 : +ok || 400;
        try {
            this.res = this.res.writeHead(status, msg, {
                'content-type': 'application/json',
            });
        }
        catch (e) {
            this.debug("Header sent error!", e);
        }
        let final = await this.mergeResponse(o, ok);
        if (global_1.VARS.isDev && this._dev_logs.length) {
            final['debug'] = this._dev_logs;
            this._dev_logs = [];
        }
        try {
            this.res.write(JSON.stringify(final));
        }
        catch { }
        if (!this.disableResponseEnd) {
            this.res = this.res.end();
        }
        else
            this.debug("Response IGNORED", o);
    }
    waitForCallableProps() {
        return false;
    }
    async mergeResponse(o, ok = true) {
        o = this.waitForCallableProps() ? await this.#waitForAsyncFunction(o) : o;
        const status = typeof ok === 'boolean' ? ok ? 200 : 400 : +ok || 400;
        const add = o.additional || {};
        delete o.additional;
        return {
            ...((Object.keys(o).length !== 0 || Array.isArray(o)) && ({
                data: o,
            })),
            ok: status < 400,
            ...add,
        };
    }
    async #waitForAsyncFunction(o) {
        if (o === null || o === undefined || !this.waitForCallableProps())
            return o;
        const handle = async (value) => {
            if (typeof value === 'object') {
                return await this.#waitForAsyncFunction(value);
            }
            else if (typeof value === 'function') {
                if (!value?.callable)
                    return undefined;
                return await value();
            }
            else
                return value;
        };
        if (Array.isArray(o)) {
            for (let key = 0; key < o.length; key++) {
                const value = o[key];
                o[key] = await handle(value);
            }
        }
        else if (typeof o === 'object') {
            for (const [key, value] of Object.entries(o)) {
                o[key] = await handle(value);
            }
        }
        return o;
    }
    msg(message = 'انجام شد') {
        return this.response({
            additional: {
                message,
            },
        });
    }
    methodDeny() {
        throw ({
            code: 405,
            message: 'Method Not Allowed',
        });
    }
    get(key, msg = null) {
        const value = this.params[key] ?? this.json?.[key];
        if (!value && !!msg) {
            this.throw({
                code: 400,
                message: msg + ' وارد نشده است',
                additional: {
                    key,
                },
            });
        }
        return value;
    }
    getTokenFromRequest() {
        const H = this.request?.headers || {};
        const finalCookies = this.request?.cookies || {};
        return (H?.authorization ??
            H?.authentication ??
            H?.token ??
            H?.login ??
            finalCookies['token'] ??
            finalCookies['admin_token']);
    }
    async getUser(req = false) {
        if (this._user && this.separated)
            return this._user;
        const token = this.getTokenFromRequest();
        const user = (await prisma.user.findUnique({ where: { token: token + '' } })) || (req ? this.throw({
            code: 401,
            message: 'باید وارد شوید',
        }) : undefined);
        if (this.separated)
            this._user = user;
        return user;
    }
    async setUser(user, days = 3) {
        this.debug("setUser", `${days} days`, user);
        const ex = new Date();
        ex.setDate(ex.getDate() + days);
        this.res.cookie('token', user.token(), {
            expires: ex,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });
        return this.response({
            token: user.token(),
            additional: {
                message: 'وارد شدید',
            },
        });
    }
    throw(...args) {
        return (0, built_in_1.Throw)(...args);
    }
    need(key, msg = `${key} وارد نشده است`) {
        this.response({
            additional: {
                key,
                message: msg.trim().split(' ').length === 1 ? msg + ' وارد نشده است' : msg,
            },
        }, 400, `${key} Required`).catch(console.error);
        return this.throw(msg);
    }
    $_PARAMS(json, add = undefined) {
        let body = this.request.method === 'GET' ? (Object.fromEntries(new URL(this.request.originalUrl).searchParams.entries())) : this.json ?? {};
        return (0, request_1.force$_POST)(json, body, add);
    }
}
exports.default = RequestHandler;
__decorate([
    (0, common_1.All)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], RequestHandler.prototype, "incoming", null);
//# sourceMappingURL=request.handler.js.map