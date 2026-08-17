import RequestHandler from '@/core/request.handler';

export default class CalcPriceHandler extends RequestHandler {
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
