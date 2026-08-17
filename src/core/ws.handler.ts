import { WebSocket } from 'ws';

type WsType = WebSocket;

export function safeWebsocket<T extends WebSocket>(ws: T) {
    return new Proxy(ws, {
        get(target: T, p: string | symbol, receiver: any): any {
            const property = target[p];


            if (typeof property === 'function') {
                return function(...args: any[]) {
                    try {
                        return property.bind(target)(...args);
                    } catch (e: any) {
                        console.error(`WEBSOCKET[${p.valueOf().toString()}(...${args.length})]`, e);
                    }
                };
            }

            return property;
        },
    });
}

