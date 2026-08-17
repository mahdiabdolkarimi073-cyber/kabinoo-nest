import { Request, Response } from 'express';
import { All, Req, Res, StreamableFile } from '@nestjs/common';
import { Throw } from '@/utils/built-in';
import { $_POSTObject, $_POSTType, force$_POST } from '@/utils/request';
import { PrismaType } from '@/core/db';
import { handlePrismaErrorAdditionalInfo } from '@/core/prisma.error';
import { WebSocket, WebSocketServer } from 'ws';
import { Duplex } from 'node:stream';
import { safeWebsocket } from '@/core/ws.handler';
import { VARS } from '@/global';
import { generateRandomNumber, generateRandomString } from '@/utils/string';

export default class RequestHandler {
    request: Request;
    res: Response;
    params: Record<string, string> = {};
    json: Record<string, any> = {};
    disableResponseEnd = false;
    separated = false;
    id: string = "MainHandler" as const;
    _user: PrismaType<'user'>;
    _dev_logs: string[] = []

    constructor(req?: Request, res?: Response) {
        this.request = req;
        this.res = res;
    }

    debug(...args: any[]) {
        if (!VARS.isDev) return;
        const txt = `[DEBUG:${this.id}] ${this.request ? this.request.method+" "+this.request.url:""}`;
        const final = txt +" "+ args.map(o=>o?.toString?.()).join(" ");
        console.debug(txt,...args);
        if (this.id !== 'MainHandler') this._dev_logs.push(final);
    }

    @All()
    async incoming(@Req() req: Request, @Res() res: Response, name?: string) {
        if (!req || !res) return;
        this.debug(req.method,req.url,name || "");
        await this.splitInstance(async function() {
            const upgrade = this.request.get('upgrade');
            if (upgrade === 'websocket') return this._handleUpgrade();
            return await this.handle(name || this.request.method);
        }, req, res);
    }

    enableWebSocket() {
        return false;
    }

    async _handleUpgrade() {
        const { duplex: _duplex, head } = this.request.headers;
        if (typeof _duplex !== 'object' && typeof head !== 'object') throw ('Invalid Upgrade (HEAD|DUPLEX)');

        const duplex = _duplex as unknown as Duplex;
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
        const server = new WebSocketServer({
            noServer: true,
            autoPong: true,
            allowSynchronousEvents: false,
        });

        if (!duplex || !head) throw ('Invalid Upgrade');
        server.on('error', console.error);
        const ws: WebSocket = await new Promise(r => {
            server.handleUpgrade(this.request, duplex as any, head as any, (ws) => {
                r(ws);
            });
        });
        ws.onerror = console.error;
        const safe = safeWebsocket(ws);
        this.onWebSocket(safe);
    }

    onWebSocket(ws: WebSocket) {
        if (!this.enableWebSocket()) throw ('Invalid');
    }

    async createInstance<T extends this>(this: T, req: Request, res: Response) {
        const instance = new (this.constructor as typeof RequestHandler)(req, res);
        instance.id = generateRandomNumber(5);
        instance.res = res;
        instance.request = req;
        instance.separated = true;
        instance.res.on('error', console.error);
        try {
            if (!instance.request.originalUrl.startsWith('http')) instance.request.originalUrl = `http://localhost${req.url || ''}`;
        } catch {
        }
        instance.params = req.params;
        instance.params = {
            ...instance.params,
            ...Object.fromEntries(new URL(req.originalUrl).searchParams.entries()),
        };


        try {
            if (typeof req.body === 'object' && Object.keys(req.body).length !== 0) instance.json = req.body;
        } catch {
        }

        await instance.handleExecute(async function() {
            await instance.onReady();
            const additional = await instance.additionalPayload();
            if (!!Object.keys(additional).length) {
                instance.json = {
                    ...instance.json,
                    ...additional,
                };
            }
        });

        return (instance as T);
    }

    async splitInstance(func: Parameters<typeof this.handleExecute>[0], req: Request, res: Response) {
        const instance = await this.createInstance(req, res);
        return await instance.handleExecute(func.bind(instance));
    }

    async onReady() {

    }

    async handleExecute<T extends this>(func: (this: T) => any) {
        try {
            let firstLine = func.toString().split('\n')[0].replaceAll(/\s+/g, '');
            if (!firstLine.startsWith('asyncfunction') && !firstLine.startsWith('function')) {
                this.throw(`Arrow Function doesn't allowed in handleExecute`);
            }

            const R = await func.bind(this)();

            if (!!R && !(R instanceof StreamableFile) && typeof R === 'object') {
                return this.response(R);
            }
            return R;
        } catch (err: any) {
            this.debug(`${func.name} has error`);
            this.debug(err);
            if (this.res.closed || this.res.headersSent || this.res.writableEnded) return;

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
                    if (!msg || !msg.includes('prisma')) break;
                    const lastLine = msg.split('\n').at(-1);

                    const target = lastLine.split('`').slice(1, 2).join('`');

                    if (!!target.trim() && target.length < 15) {
                        error = `${target} اشتباه است`;
                        err.additional = handlePrismaErrorAdditionalInfo(msg);
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

    async handle(funcName: string) {
        const func = this[funcName];
        if (!func) this.methodDeny();
        return await func.bind(this)();
    }

    async additionalPayload(): Promise<Record<any, any>> {
        return {};
    }

    async response(o: any, ok: boolean | number = true, msg = 'OK') {
        if (!this.res) {
            console.trace();
            this.throw('Response object not found!');
        }
        if (typeof o === 'string') {
            o = {
                additional: {message: o}
            }
        }
        if (this.res.writableFinished || this.res.closed || this.res.headersSent || this.res.writableEnded) return;
        const status = typeof ok === 'boolean' ? ok ? 200 : 400 : +ok || 400;
        try {
            this.res = this.res.writeHead(status, msg, {
                'content-type': 'application/json',
            });
        } catch (e) {
            this.debug("Header sent error!",e);
        }

        let final = await this.mergeResponse(o, ok);
        if (VARS.isDev && this._dev_logs.length) {
            final['debug'] = this._dev_logs;
            this._dev_logs = [];
        }

        try {
            this.res.write(JSON.stringify(final));
        } catch {}

        if (!this.disableResponseEnd) {
            this.res = this.res.end();
        } else this.debug("Response IGNORED", o);
    }

    waitForCallableProps() {
        return false;
    }

    async mergeResponse(o: any, ok: boolean | number = true) {
        o = this.waitForCallableProps() ? await this.#waitForAsyncFunction(o):o;
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

    async #waitForAsyncFunction(o: any) {
        if (o === null || o === undefined || !this.waitForCallableProps()) return o;

        const handle = async (value: any) => {
            if (typeof value === 'object') {
                return await this.#waitForAsyncFunction(value);
            } else if (typeof value === 'function') {
                if (!value?.callable) return undefined;
                return await value();
            } else return value;
        };

        if (Array.isArray(o)) {
            for (let key = 0; key < o.length; key++) {
                const value = o[key];
                o[key] = await handle(value);
            }
        } else if (typeof o === 'object') {
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

    get(key: string, msg: string | null = null) {
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
        return (
            H?.authorization ??
            H?.authentication ??
            H?.token ??
            H?.login ??
            finalCookies['token'] ??
            finalCookies['admin_token']
        );
    }

    async getUser(req = false) {
        if (this._user && this.separated) return this._user;
        const token = this.getTokenFromRequest();
        const user = (await prisma.user.findUnique({ where: { token: token + '' } })) || (req ? this.throw({
            code: 401,
            message: 'باید وارد شوید',
        }) : undefined);
        if (this.separated) this._user = user;
        return user;
    }

    async setUser(user: PrismaType<'user'>,days = 3) {
        this.debug("setUser",`${days} days`, user);
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

    throw(...args: Parameters<typeof Throw>) {
        return Throw(...args);
    }

    need(key: string, msg = `${key} وارد نشده است`): never {
        this.response({
            additional: {
                key,
                message: msg.trim().split(' ').length === 1 ? msg + ' وارد نشده است' : msg,
            },
        }, 400, `${key} Required`).catch(console.error);
        return this.throw(msg);
    }

    $_PARAMS<T>(json: $_POSTType<T, any>, add: Partial<$_POSTObject<any>> | undefined = undefined) {
        let body = this.request.method === 'GET' ? (Object.fromEntries(new URL(this.request.originalUrl).searchParams.entries())) : this.json ?? {};
        return force$_POST<T, typeof body>(json, body, add);
    }


}
