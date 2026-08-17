"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../core/db");
const prisma_handler_1 = require("../../core/prisma.handler");
const string_1 = require("../../utils/string");
class Chat extends prisma_handler_1.default {
    static Connections = {};
    static onMount() {
        (0, db_1.watchDB)("chat", "UserChatMessage", "create", async (args) => {
            const list = Object.values(Chat.Connections[args.result.chatId] || {});
            for (let ws of list) {
                try {
                    ws.send(JSON.stringify({
                        type: "message",
                        message: args.result
                    }));
                }
                catch { }
            }
            await prisma.userChat.update({
                where: { id: args.result.chatId },
                data: {
                    answered: args.result.isAdmin,
                    lastMsg: args.result.content.slice(0, 20)
                }
            });
        }, "after");
    }
    getModel() {
        return prisma.userChatMessage;
    }
    getName() {
        return "چت";
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
        this.debug("target user", user.name);
        const chat = await this.getChat(user);
        return {
            userId: _current.id,
            chatId: chat.id,
            isAdmin: !!targetId && _current.isAdmin,
            targetUser: user
        };
    }
    async getChat(_user) {
        const user = _user || this.json?.targetUser || await this.getUser(true);
        this.debug('chat user', user.name);
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
    async onWebSocket(ws) {
        const id = (0, string_1.generateRandomString)();
        const chat = await this.getChat();
        Chat.Connections[chat.id] ||= {};
        Chat.Connections[chat.id][id] = ws;
        ws.send(JSON.stringify({
            type: "connection",
            message: {
                state: "stable",
                chat_id: chat.id
            }
        }));
        ws.onclose = () => {
            try {
                delete Chat.Connections[chat.id][id];
            }
            catch { }
        };
        ws.onerror = ws.onclose;
    }
    enableWebSocket() {
        return true;
    }
}
exports.default = Chat;
//# sourceMappingURL=chat.js.map