"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_handler_1 = require("../../core/request.handler");
class ProxyHandler extends request_handler_1.default {
    async handle() {
        const url = this.get('url');
        const method = this.get('method') || this.request.method;
        const headers = this.json['headers'] || this.request.headers;
        this.debug(method, url);
        const filteredHeaders = {};
        const headerEntries = headers instanceof Headers
            ? Array.from(headers.entries())
            : Object.entries(headers);
        for (const [key, value] of headerEntries) {
            const lowerKey = key.toLowerCase();
            if (lowerKey.startsWith('x-') ||
                lowerKey === 'host' ||
                lowerKey.includes('upgrade') ||
                lowerKey === 'connection' ||
                lowerKey === 'content-length') {
                continue;
            }
            filteredHeaders[key] = String(value);
        }
        let body;
        if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
            if (typeof this.request.body === 'string') {
                body = this.request.body;
            }
            else if (this.request.body) {
                body = JSON.stringify(this.json);
            }
        }
        this.debug('Headers:', filteredHeaders);
        this.debug('Body:', body);
        try {
            const res = await fetch(url, {
                method,
                headers: filteredHeaders,
                body
            });
            this.debug(res.status, res.statusText);
            this.res.status(res.status);
            res.headers.forEach((value, key) => {
                const lowerKey = key.toLowerCase();
                if (lowerKey === 'content-encoding' ||
                    lowerKey === 'transfer-encoding' ||
                    lowerKey === 'connection') {
                    return;
                }
                this.res.setHeader(key, value);
            });
            const buffer = await res.arrayBuffer();
            this.res.end(Buffer.from(buffer));
            this.debug(`Response size: ${buffer.byteLength} bytes`);
        }
        catch (error) {
            this.debug('Proxy error:', error);
            this.res.status(500);
            this.res.json({
                error: 'Proxy request failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.default = ProxyHandler;
//# sourceMappingURL=proxy.js.map