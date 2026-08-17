import RequestHandler from '@/core/request.handler';

export default class CalcPriceHandler extends RequestHandler {
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
        };

        const settings = await prisma.calcPriceSetting.upsert({
            where: { id: 1 },
            create: { id: 1, ...data },
            update: data,
        });

        return this.msg('قیمت‌ها با موفقیت ذخیره شدند');
    }
}
