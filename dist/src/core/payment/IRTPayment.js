"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_1 = require("../../global");
const built_in_1 = require("../../utils/built-in");
const config_1 = require("../../api/public/config");
class IRTPayment {
    static MID = "";
    static async doPayment(payment) {
        const token = await IRTPayment.getToken(payment.price * 10, payment.id);
        return IRTPayment.getUrl(token);
    }
    static getTerminalId() {
        return process.env['PAYMENT_TID'] || (0, built_in_1.Throw)("Payment TID Not defined");
    }
    static get enabled() {
        return !!IRTPayment.getTerminalId();
    }
    get TID() {
        return IRTPayment.getTerminalId();
    }
    static async getToken(amount, paymentId) {
        const actualCallback = new URL(global_1.VARS.isDev ? "http://localhost:3080" : global_1.VARS.BACKEND);
        actualCallback.pathname = "/public/payment";
        actualCallback.searchParams.set("id", paymentId);
        const callback = new URL(global_1.VARS.FRONTEND || "http://localhost:3000");
        callback.pathname = "/proxy";
        callback.search = new URLSearchParams({
            url: actualCallback.toString()
        }).toString();
        const tid = IRTPayment.getTerminalId();
        const config = await (0, config_1.getVarConfig)();
        const params = {
            "action": "token",
            "TerminalId": tid,
            "Amount": (amount + ((amount / 100) * config.PAY_FEE)),
            "ResNum": paymentId,
            "RedirectUrl": callback.toString()
        };
        const res = await IRTPayment.fetch('/onlinepg/onlinepg', params);
        if (!res || res.status !== 1)
            throw ({
                message: res?.errorDesc ?? "FAIL TO CREATE PAYMENT TOKEN " + tid,
                res
            });
        return res.token;
    }
    static getUrl(token) {
        return `https://sep.shaparak.ir/OnlinePG/SendToken?token=${token}`;
    }
    static async acceptReceipt(RefNum) {
        const res = await IRTPayment.fetch("/verifyTxnRandomSessionkey/ipg/VerifyTransaction", {
            'TerminalNumber': IRTPayment.getTerminalId(),
            'RefNum': RefNum,
        });
        if (!res.Success ||
            res.ResultCode !== 0 ||
            !res.TransactionDetail) {
            console.error("TRANSACTION ERROR", res);
            throw (res.ResultDescription || "عملیات لغو شد");
        }
        return true;
    }
    static async fetch(path, body) {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(body)
        };
        const host = "sep.shaparak.ir";
        const base = `https://${host}`;
        let finalUrl = base + path;
        if (global_1.VARS.isDev) {
            const gen = new URL(global_1.VARS.BACKEND);
            gen.pathname = "/public/proxy";
            gen.searchParams.append("url", finalUrl);
            finalUrl = gen.toString();
        }
        console.log("FETCH", finalUrl, requestOptions);
        const res = await fetch(finalUrl, requestOptions);
        const text = await res.text();
        console.log(text);
        return JSON.parse(text);
    }
}
exports.default = IRTPayment;
//# sourceMappingURL=IRTPayment.js.map