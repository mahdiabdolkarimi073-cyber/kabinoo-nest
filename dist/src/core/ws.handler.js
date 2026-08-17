"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeWebsocket = safeWebsocket;
function safeWebsocket(ws) {
    return new Proxy(ws, {
        get(target, p, receiver) {
            const property = target[p];
            if (typeof property === 'function') {
                return function (...args) {
                    try {
                        return property.bind(target)(...args);
                    }
                    catch (e) {
                        console.error(`WEBSOCKET[${p.valueOf().toString()}(...${args.length})]`, e);
                    }
                };
            }
            return property;
        },
    });
}
//# sourceMappingURL=ws.handler.js.map