import {Payment} from ".prisma/client";
import {PaymentAction} from "@prisma/client";
import IRTPayment from "./IRTPayment";

declare global {
	var paymentEvents: {
		[key: string]: () => (void | Promise<void>)
	} | undefined
}

export async function getPaymentLink(payment: Payment) {
	return await IRTPayment.doPayment(payment);
}

export async function handlePaymentAction(payment: Payment & { actions: PaymentAction[] }, devDo = false) {
	const {actions} = payment;

	for (let action of actions) {
		// if (process.env.NODE_ENV === "development" && !devDo) continue;

		const {model: modelName, method, query = {}} = action;
		const model = prisma[modelName as keyof typeof prisma] as typeof prisma.payment;
		if (!model) throw ("مدل عملیات ناشناخته است");

		const func = model[method as keyof typeof model];
		if (!func) throw ("عملیات ناشناخته");

		try {
			// @ts-ignore
			await func(query);
		} catch (e) {
			console.error(e);
			throw ("خطا در انجام عملیات")
		}
	}

	await prisma.paymentAction.deleteMany({
		where: {
			paymentId: payment.id
		}
	})

	await prisma.payment.update({
		where: {
			id: payment.id
		},
		data: {
			paid_at: new Date()
		}
	})
	global.paymentEvents ||= {};
	await global.paymentEvents[payment.id]?.();
	delete global.paymentEvents[payment.id];
}


export function onPaymentSuccessful(payment: { id: Payment['id'] }, event: () => (void | Promise<void>)) {
	global.paymentEvents ||= {};
	global.paymentEvents[payment.id] = event;
}
