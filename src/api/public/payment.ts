
import IRTPayment from '@/core/payment/IRTPayment';
import { getPaymentLink, handlePaymentAction, onPaymentSuccessful } from '@/core/payment/Payment';
import { VARS } from '@/global';
import { All, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { generateRandomString } from '@/utils/string';
import RequestHandler from '@/core/request.handler';

type json = {
    "MID": "0",
    "TerminalId": "13203741",
    "RefNum": "GmshtyjwKSuI1lYn3JEqANXbFBWeaOAfg7EHD+S9dz",
    "ResNum": "bYYyd5",
    "State": "OK",
    "TraceNo": "92098",
    "Amount": "10000",
    "AffectiveAmount": "10000",
    "Wage": "",
    "Rrn": "23178255413",
    "SecurePan": "603799******4276",
    "Status": "2",
    "Token": "f8197ad5a4334309a3cfeff6b45c0530",
    "HashedCardNumber": "1C3816B1D8E5405EB4ED88AD62E52C932C3E2DAD9836E074F88D54D871DF5603"
}
export default class Handler extends RequestHandler {
    async handle(name = this.request.method) {
        this.debug(name);
        if (name !== this.request.method) return super.handle(name);

        const id = this.get('id') || this.throw("id required for payment");

        const payment = await prisma.payment.findUnique({
            where: {
                id
            },
            include: {
                actions: true
            }
        }) || this.throw("رسید یافت نشد");

        let url = new URL(VARS.FRONTEND);
        url.pathname = "/payment";
        url.searchParams.set('id', payment.id);

        this.debug("payment", payment);

        if (VARS.isDev && id) {
            await handlePaymentAction(payment);
            this.res.writeHead(303, "SeeOther", {
                "location": url.toString()
            });
            this.res.end();
            return;
        }

        try {
            const json = this.json as Partial<json>;
            if (!json.RefNum) this.throw("تراکنش نامعتبر");
            const verify = await IRTPayment.acceptReceipt(json.RefNum);
            if (!verify) this.throw("خطا در تایید تراکنش")

            if (!payment) this.throw("فیش پرداختی یافت نشد!");

            await handlePaymentAction(payment);

            const obj = {
                ...json,
                id,
                message: "باموفقیت پرداخت شد",
            }
            url.search = new URLSearchParams(obj).toString();

            if (payment.id.startsWith("OUTSIDE")) {
                try {
                    url = new URL(payment.redirect);
                } catch { }
            }
        } catch (e) {
            if (typeof e === 'string' || !e) {
                e = {
                    message: e
                }
            }
            for (const [key,value] of Object.entries(e)) {
                url.searchParams.set(key,value+"");
            }
        }

        this.res.writeHead(303, "SeeOther", {
            "location": url.toString()
        });
        this.res.end();
    }

    @All(":id")
    async _id(@Req() req: Request, @Res() res: Response) {
        this.incoming(req, res, "single");
    }

    async single() {
        const id = this.get("id", "ایدی رسید پرداخت");
        const payment = id === "custom" ? await prisma.payment.create({
            data: {
                price: +this.get("amount") || +this.get('price') || this.need("price | amount", "value required"),
                userId: this.get('userId', "user id missing"),
                id: `OUTSIDE_${generateRandomString(10)}`,
                redirect: this.get('redirect') || "/payment"
            }
        }) : await prisma.payment.findUnique({
            where: {
                id
            }
        }) || this.throw("رسید پرداخت یافت نشد");

        this.debug("payment", payment);

        if (payment.paid_at) this.throw("رسید از قبل پرداخت شده است");

        const link = await getPaymentLink(payment);

        const callback = this.params['callback'];
        if (callback) {
            onPaymentSuccessful(payment, async () => {
                console.log("SENDING PAYMENT CALLBACK...");
                const R = await fetch(callback, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    }
                })
                console.log(`SENT! ${R.status}`, callback, await R.json().catch(e => ({ fail: e })));
            })
        }

        return {
            link
        }
    }
}


