import { watchDB } from "@/core/db";
import PrismaFullHandler from "@/core/prisma.handler";
import { generateRandomString } from "@/utils/string";
import { WebSocket } from "ws";

export default class Chat extends PrismaFullHandler {
    static Connections: Record<string, Record<string, WebSocket>> = {};

    static onMount() {
        watchDB("chat", "UserChatMessage", "create", async (args) => {
            const list = Object.values(Chat.Connections[args.result.chatId] || {});
            for (let ws of list) {
                try {
                    ws.send(JSON.stringify({
                        type: "message",
                        message: args.result
                    }));
                } catch { }
            }
            await prisma.userChat.update({
                where: { id: args.result.chatId },
                data: {
                    answered: args.result.isAdmin,
                    lastMsg: args.result.content.slice(0, 20)
                }
            });
        }, "after")
    }

    getModel() {
        return prisma.userChatMessage;
    }

    getName() {
        return "چت"
    }

    async additionalPayload() {
        const _current = await this.getUser(true);
        let user = _current;
        const targetId = this.get('targetId') || this.get('userId');
        if (user.isAdmin && targetId) {
            user = await prisma.user.findUnique({
                where: { id: targetId }
            }) || this.throw("کاربر مورد نظر یافت نشد");
        }
        let id = user.id;
        this.debug("current user", _current.name);
        this.debug("target user", user.name)
        const chat = await this.getChat(user);
        
        return {
            userId: _current.id,
            chatId: chat.id,
            isAdmin: !!targetId && _current.isAdmin,
            targetUser: user
        }
    }

    async getChat(_user?: any) {
        const user = _user || this.json?.targetUser || await this.getUser(true);
        this.debug('chat user', user.name)
        return await prisma.userChat.upsert({
            where: { userId: user.id },
            create: { userId: user.id },
            update: {},
            include: {
                user: true,
                messages: {
                    orderBy: { created_at: 'desc' },
                    take: 30
                }
            }
        });
    }

    async GET() {
        return await this.getChat();
    }

    async PUT() {
        return this.methodDeny();
    }

    async onWebSocket(ws: WebSocket) {
        const id = generateRandomString();
        const chat = await this.getChat();

        Chat.Connections[chat.id] ||= {};
        Chat.Connections[chat.id][id] = ws;
        ws.send(JSON.stringify({
            type: "connection",
            message: {
                state: "stable",
                chat_id: chat.id
            }
        }))
        ws.onclose = () => {
            try {
                delete Chat.Connections[chat.id][id];
            } catch { }
        }
        ws.onerror = ws.onclose as any;
    }

    enableWebSocket(): boolean {
        return true;
    }

}