import { Payment } from '@prisma/client';
import { VARS } from '@/global';
import { Throw } from '@/utils/built-in';
import { getVarConfig } from '@/api/public/config';

export default class IRTPayment {
	static MID = "";

	static async doPayment(payment: Payment) {
		const token = await IRTPayment.getToken(payment.price * 10,payment.id);
		return IRTPayment.getUrl(token);
	}

	static getTerminalId() {
		return process.env['PAYMENT_TID'] || Throw("Payment TID Not defined");
	}

	static get enabled() {
		return !!IRTPayment.getTerminalId();
	}

	get TID() {
		return IRTPayment.getTerminalId();
	}

	static async getToken(amount: number, paymentId: string) {
		const actualCallback = new URL(VARS.isDev ? "http://localhost:3080":VARS.BACKEND);
		actualCallback.pathname = "/public/payment";
		actualCallback.searchParams.set("id", paymentId);

		const callback = new URL(VARS.FRONTEND || "http://localhost:3000");
		callback.pathname = "/proxy";
		callback.search = new URLSearchParams({
			url: actualCallback.toString()
		}).toString();
		const tid = IRTPayment.getTerminalId();
		const config = await getVarConfig();
		const params = {
			"action": "token",
			"TerminalId": tid,
			"Amount": (amount + ((amount / 100) * config.PAY_FEE)),
			"ResNum": paymentId,
			"RedirectUrl": callback.toString()
		};

		const res = await IRTPayment.fetch('/onlinepg/onlinepg', params) as ({
			"token"?: string,
			status: number
		});
		
		if (!res || res.status !== 1) throw ({
			message: (res as any)?.errorDesc ?? "FAIL TO CREATE PAYMENT TOKEN "+tid,
			res
		})

		return res.token;
	}

	static getUrl(token: string) {
		return `https://sep.shaparak.ir/OnlinePG/SendToken?token=${token}`;
	}

	static async acceptReceipt(RefNum: string) {
		// if (process.env.NODE_ENV === "development") return true;

		const res = await IRTPayment.fetch("/verifyTxnRandomSessionkey/ipg/VerifyTransaction", {
			'TerminalNumber': IRTPayment.getTerminalId(),
			'RefNum': RefNum,
		}) as ({
			TransactionDetail?: {
				RRN: '23178255413',
				RefNum: 'GmshtyjwKSuI1lYn3JEqANXbFBWeaOAfg7EHD+S9dz',
				MaskedPan: '603799****4276',
				HashedPan: '1c3816b1d8e5405eb4ed88ad62e52c932c3e2dad9836e074f88d54d871df5603',
				TerminalNumber: 13203741,
				OrginalAmount: 10000,
				AffectiveAmount: 10000,
				StraceDate: '2024-09-22 08:38:26',
				StraceNo: '92098'
			},
			PurchaseInfo: null,
			ResultCode: number,
			ResultDescription: 'عملیات با موفقیت انجام شد',
			Success: true
		});

		if (
			!res.Success ||
			res.ResultCode !== 0 ||
			!res.TransactionDetail
		) {
			console.error("TRANSACTION ERROR",res);
			throw (res.ResultDescription || "عملیات لغو شد");
		}

		return true;
	}

	static async fetch(path: string, body: { [key: string | symbol]: string | number }) {
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
		if (VARS.isDev) {
			const gen = new URL(VARS.BACKEND);
			gen.pathname = "/public/proxy";
			gen.searchParams.append("url", finalUrl);
			finalUrl = gen.toString();
		}
		console.log("FETCH", finalUrl,requestOptions);
		const res = await fetch(finalUrl, requestOptions);
		const text = await res.text();
		console.log(text);
		return JSON.parse(text);
	}
}
