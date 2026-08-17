"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_handler_1 = require("../../core/request.handler");
class CalcPriceHandler extends request_handler_1.default {
    async GET() {
        const settings = await prisma.calcPriceSetting.findUnique({
            where: { id: 1 },
        });
        if (!settings) {
            const created = await prisma.calcPriceSetting.create({
                data: { id: 1 },
            });
            return created;
        }
        return settings;
    }
}
exports.default = CalcPriceHandler;
//# sourceMappingURL=calcPrice.js.map