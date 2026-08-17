import { WebSocket } from 'ws';
export declare function safeWebsocket<T extends WebSocket>(ws: T): T;
