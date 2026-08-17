"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVarConfig = getVarConfig;
const request_handler_1 = require("../../core/request.handler");
const PrismaInfo_1 = require("../../../prisma/PrismaInfo");
class DesignHandler extends request_handler_1.default {
    async GET() {
        return await getVarConfig();
    }
}
exports.default = DesignHandler;
async function getVarConfig() {
    const records = await prisma.variable.findMany();
    const defined = Object.fromEntries(records.map(o => ([o.key, o.value])));
    const all = Object.fromEntries((0, PrismaInfo_1.getEnumInfo)("VariableKey").map(o => ([o.key, 0])));
    return {
        ...all,
        ...defined
    };
}
//# sourceMappingURL=config.js.map