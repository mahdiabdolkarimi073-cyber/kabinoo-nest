"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$_POST = $_POST;
exports.generateModulePostJson = generateModulePostJson;
exports.force$_POST = force$_POST;
exports.Try = Try;
exports.safeWait = safeWait;
const client_1 = require("@prisma/client");
const Schema_1 = require("../../prisma/Schema");
const string_1 = require("./string");
const PrismaInfo_1 = require("../../prisma/PrismaInfo");
async function $_POST(json, request) {
    return force$_POST(json, await request.json());
}
function generateModulePostJson(name, required) {
    const list = Schema_1.BasicSchemaInformation[name]?.required ?? [];
    const fields = client_1.Prisma?.[name + 'ScalarFieldEnum'] ?? {};
    return Object.fromEntries(Object.entries(fields).map(([key, value]) => {
        const fieldName = PrismaInfo_1.default.find(m => m.name.toLowerCase() === name?.toLowerCase())?.fields?.find(f => f.name.toLowerCase() === key + '')?.info?.name;
        return [
            key,
            {
                required: list.includes(key) && required,
                name: fieldName ?? Schema_1.SchemaFieldNames[key],
            },
        ];
    }));
}
function force$_POST(json, body, add = undefined) {
    let R = {};
    for (let key in json) {
        let jValue = json[key];
        if (!jValue)
            continue;
        const defaultGet = (body) => {
            let ignored = ['name', 'description', 'title', 'content', 'id'];
            for (let k of keys) {
                const v = body[k];
                return v;
            }
        };
        let obj = !jValue || typeof jValue === 'string' ? {
            name: jValue,
        } : jValue;
        if (add)
            obj = {
                ...add,
                ...obj,
            };
        const { get = defaultGet, name = key, keys = [key], errorMsg = 'وارد نشده است', required = true } = obj;
        let value = get(body);
        if (typeof value === 'undefined' && required) {
            throw ({
                message: name + ' ' + errorMsg,
                code: 400,
                additional: {
                    key: keys.join(' || '),
                },
            });
        }
        R[key] = typeof value === 'string' ? (0, string_1.arabicToEnglishNumber)(value) : value;
    }
    return R;
}
async function Try(func, msg) {
    try {
        return await func();
    }
    catch {
        throw (msg);
    }
}
async function safeWait(func) {
    try {
        return await func();
    }
    catch {
        return undefined;
    }
}
//# sourceMappingURL=request.js.map