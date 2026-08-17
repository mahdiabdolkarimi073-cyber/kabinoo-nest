"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePrismaErrorAdditionalInfo = handlePrismaErrorAdditionalInfo;
const PrismaInfo_1 = require("../../prisma/PrismaInfo");
function handlePrismaErrorAdditionalInfo(msg) {
    if (msg.includes('Expected')) {
        const lastLine = msg.split('\n').at(-1);
        const target = lastLine.split('Expected')[1].split(' ')[1].slice(0, -1);
        const _enum = (0, PrismaInfo_1.getEnumInfo)(target);
        return {
            expected: target,
            ..._enum && ({
                [target]: _enum,
            }),
        };
    }
    return {
        originMsg: msg,
    };
}
//# sourceMappingURL=prisma.error.js.map