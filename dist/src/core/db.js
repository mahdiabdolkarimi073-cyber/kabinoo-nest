"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDB = void 0;
exports.watchDB = watchDB;
const client_1 = require("@prisma/client");
const user_1 = require("../api/user");
const instance = global.__instance ?? new client_1.PrismaClient();
global.__instance ??= instance;
let _EVENTS = {};
const _prisma = instance.$extends({
    result: {
        user: user_1.UserDbResult,
        product: {
            finalPrice: {
                needs: {
                    price: true,
                    offPercent: true
                },
                compute({ price, offPercent }) {
                    return Math.ceil(price - ((price / 100) * offPercent));
                }
            }
        }
    },
    query: {
        async $allOperations({ operation, model, args, query }) {
            const start = performance.now();
            const argsString = JSON.stringify(args);
            const events = Object.values(_EVENTS[model] || {})
                .flat()
                .filter(o => o.operation.includes(operation));
            const beforeEvents = events.filter(o => o.type === 'before');
            await Promise.all(beforeEvents.map(async (event) => {
                try {
                    await event.func({ args });
                }
                catch (e) {
                    throw (new Error(e?.message ?? e, {
                        cause: `[${event.key}]: ${model}.${operation}(${argsString.slice(0, 10)}${argsString.length > 10 ? '...' : ''}) ${e?.message ?? e}`,
                    }));
                }
            }));
            const result = await query(args);
            const afterEvents = events.filter(o => o.type === 'after');
            for (let event of afterEvents) {
                try {
                    event.func({ args, result })?.catch?.(console.error);
                }
                catch (e) {
                    console.error(e);
                }
            }
            const end = performance.now();
            const time = Math.round(end - start);
            const level = time < 30 ? 'log' : time < 60 ? 'warn' : 'error';
            if (level !== 'log')
                console[level](`${model}.${operation}(${argsString.slice(0, 20)}${argsString.length > 10 ? '...' : ''}) ${time}ms`);
            return result;
        },
    },
});
global.prisma = _prisma;
exports.default = _prisma;
const initDB = () => {
    prisma.$connect();
    console.info('Database loaded');
};
exports.initDB = initDB;
function watchDB(key, model, operation, func, type = 'after') {
    let defaultValue = _EVENTS[model] || {};
    defaultValue[key] ||= [];
    defaultValue[key].push({
        operation: Array.isArray(operation) ? operation : [operation],
        func,
        type,
        key,
    });
    _EVENTS[model] = defaultValue;
    console.log(`MIDDLEWARE [${key}] ${model}.${String(operation)}(${type}) registered`);
}
//# sourceMappingURL=db.js.map