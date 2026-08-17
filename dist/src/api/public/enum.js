"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_handler_1 = require("../../core/request.handler");
const PrismaInfo_1 = require("../../../prisma/PrismaInfo");
const built_in_1 = require("../../utils/built-in");
const client_1 = require("@prisma/client");
class Enum extends request_handler_1.default {
    GET() {
        return (0, PrismaInfo_1.getEnumInfo)((0, built_in_1.makeEnum)(this.params['enum'] || this.params['id'] || this.params['key'] || this.params['id'] || this.throw("key"), ...client_1.Prisma.dmmf.datamodel.enums.map(o => o.name)));
    }
}
exports.default = Enum;
//# sourceMappingURL=enum.js.map