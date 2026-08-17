import { getPaymentLink, onPaymentSuccessful } from '@/core/payment/Payment';
import RequestHandler from '@/core/request.handler';
import { VARS } from '@/global';
import { generateRandomString } from '@/utils/string';

export default class Test extends RequestHandler {

    async GET() {
        const user = await this.getUser();
        const payment = await prisma.payment.create({
            data: {
                price: 10000,
                userId: user.id
            }
        });

        return {
            redirect: await getPaymentLink(payment),
            payment
        };
    }

    async POST() {
        const url = "https://checkip.amazonaws.com/";
        const proxy = new URL(VARS.BACKEND);
        proxy.pathname = "/public/proxy";
        proxy.searchParams.set('url', url)

        const ip1 = await fetch(url).then(e=>e.text());
        const ip2 = await fetch(proxy).then(e=>e.text());

        return {ip1,ip2};
    }

}