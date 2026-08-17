"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Payment_1 = require("../core/payment/Payment");
const request_handler_1 = require("../core/request.handler");
const global_1 = require("../global");
class Test extends request_handler_1.default {
    async GET() {
        const user = await this.getUser();
        const payment = await prisma.payment.create({
            data: {
                price: 10000,
                userId: user.id
            }
        });
        return {
            redirect: await (0, Payment_1.getPaymentLink)(payment),
            payment
        };
    }
    async POST() {
        const url = "https://checkip.amazonaws.com/";
        const proxy = new URL(global_1.VARS.BACKEND);
        proxy.pathname = "/public/proxy";
        proxy.searchParams.set('url', url);
        const ip1 = await fetch(url).then(e => e.text());
        const ip2 = await fetch(proxy).then(e => e.text());
        return { ip1, ip2 };
    }
}
exports.default = Test;
//# sourceMappingURL=test.js.map