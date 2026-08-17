"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const IRTPayment_1 = require("../../core/payment/IRTPayment");
const Payment_1 = require("../../core/payment/Payment");
const global_1 = require("../../global");
const common_1 = require("@nestjs/common");
const string_1 = require("../../utils/string");
const request_handler_1 = require("../../core/request.handler");
class Handler extends request_handler_1.default {
    async handle(name = this.request.method) {
        this.debug(name);
        if (name !== this.request.method)
            return super.handle(name);
        const id = this.get('id') || this.throw("id required for payment");
        const payment = await prisma.payment.findUnique({
            where: {
                id
            },
            include: {
                actions: true
            }
        }) || this.throw("رسید یافت نشد");
        let url = new URL(global_1.VARS.FRONTEND);
        url.pathname = "/payment";
        url.searchParams.set('id', payment.id);
        this.debug("payment", payment);
        if (global_1.VARS.isDev && id) {
            await (0, Payment_1.handlePaymentAction)(payment);
            this.res.writeHead(303, "SeeOther", {
                "location": url.toString()
            });
            this.res.end();
            return;
        }
        try {
            const json = this.json;
            if (!json.RefNum)
                this.throw("تراکنش نامعتبر");
            const verify = await IRTPayment_1.default.acceptReceipt(json.RefNum);
            if (!verify)
                this.throw("خطا در تایید تراکنش");
            if (!payment)
                this.throw("فیش پرداختی یافت نشد!");
            await (0, Payment_1.handlePaymentAction)(payment);
            const obj = {
                ...json,
                id,
                message: "باموفقیت پرداخت شد",
            };
            url.search = new URLSearchParams(obj).toString();
            if (payment.id.startsWith("OUTSIDE")) {
                try {
                    url = new URL(payment.redirect);
                }
                catch { }
            }
        }
        catch (e) {
            if (typeof e === 'string' || !e) {
                e = {
                    message: e
                };
            }
            for (const [key, value] of Object.entries(e)) {
                url.searchParams.set(key, value + "");
            }
        }
        this.res.writeHead(303, "SeeOther", {
            "location": url.toString()
        });
        this.res.end();
    }
    async _id(req, res) {
        this.incoming(req, res, "single");
    }
    async single() {
        const id = this.get("id", "ایدی رسید پرداخت");
        const payment = id === "custom" ? await prisma.payment.create({
            data: {
                price: +this.get("amount") || +this.get('price') || this.need("price | amount", "value required"),
                userId: this.get('userId', "user id missing"),
                id: `OUTSIDE_${(0, string_1.generateRandomString)(10)}`,
                redirect: this.get('redirect') || "/payment"
            }
        }) : await prisma.payment.findUnique({
            where: {
                id
            }
        }) || this.throw("رسید پرداخت یافت نشد");
        this.debug("payment", payment);
        if (payment.paid_at)
            this.throw("رسید از قبل پرداخت شده است");
        const link = await (0, Payment_1.getPaymentLink)(payment);
        const callback = this.params['callback'];
        if (callback) {
            (0, Payment_1.onPaymentSuccessful)(payment, async () => {
                console.log("SENDING PAYMENT CALLBACK...");
                const R = await fetch(callback, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    }
                });
                console.log(`SENT! ${R.status}`, callback, await R.json().catch(e => ({ fail: e })));
            });
        }
        return {
            link
        };
    }
}
exports.default = Handler;
__decorate([
    (0, common_1.All)(":id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Handler.prototype, "_id", null);
//# sourceMappingURL=payment.js.map