"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_handler_1 = require("../../core/request.handler");
class CalcPriceHandler extends request_handler_1.default {
    async GET() {
        let settings = await prisma.calcPriceSetting.findUnique({
            where: { id: 1 },
        });
        if (!settings) {
            settings = await prisma.calcPriceSetting.create({
                data: { id: 1 },
            });
        }
        return settings;
    }
    async PUT() {
        const data = {
            mdfPrice: Number(this.json.mdfPrice),
            highglassPrice: Number(this.json.highglassPrice),
            vacuumPrice: Number(this.json.vacuumPrice),
            colorPrice: Number(this.json.colorPrice),
            fridgeCost: Number(this.json.fridgeCost),
            dishwasherCost: Number(this.json.dishwasherCost),
            laundryCost: Number(this.json.laundryCost),
            wallCabinetCost: Number(this.json.wallCabinetCost),
            wallCabinetSteppedCost: Number(this.json.wallCabinetSteppedCost),
            hoodCost: Number(this.json.hoodCost),
            hoodHiddenCost: Number(this.json.hoodHiddenCost),
            ovenCost: Number(this.json.ovenCost),
            ovenBuiltInCost: Number(this.json.ovenBuiltInCost),
        };
        const settings = await prisma.calcPriceSetting.upsert({
            where: { id: 1 },
            create: { id: 1, ...data },
            update: data,
        });
        return this.msg('قیمت‌ها با موفقیت ذخیره شدند');
    }
}
exports.default = CalcPriceHandler;
//# sourceMappingURL=calcPrice.js.map