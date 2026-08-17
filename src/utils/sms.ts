/*
import {KavenegarApi} from "kavenegar";

const kavenegar = KavenegarApi({
	apikey: process.env.KAVENEGAR_API+""
});

export async function sendSMS(data: Parameters<typeof kavenegar.VerifyLookup>[0] & {
	[key: string]: string,
	template: "shop-customer-payment" | "rent-owner" | "shop-payment" | "rent-customer-reserve" | "teacher-skillgym" | "response" | "gym-role-payment" | "gym-request" | "gym-request-reject" | "request" | "gym-request-payment" | "shop" | "rent3" | "rent2" | "rent" | "footpass-verify" | "birthdayCoach" | "bimeh" | "birthday" | "ghest" | "login" | "chek" | "tuition"
}): Promise<Parameters<typeof kavenegar.VerifyLookup>[1] | boolean> {
	if (process.env.NODE_ENV === "development") {
		console.log("send SMS",data);
		return true;
	}
	return new Promise(r => {
		kavenegar.VerifyLookup(data,o => r(o as any))
	})
}
*/
