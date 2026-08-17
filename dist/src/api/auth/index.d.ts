import RequestHandler from '@/core/request.handler';
import { WebSocket } from 'ws';
export default class LoginHandler extends RequestHandler {
    static attempts: Record<string, {
        cleaner?: ReturnType<typeof setTimeout>;
        attempt: number;
    }>;
    postSignup(req: any, res: any): Promise<any>;
    postLogin(req: any, res: any): Promise<any>;
    onWebSocket(ws: WebSocket): void;
}
export declare function finalizeUserPhone(phone: string): string;
