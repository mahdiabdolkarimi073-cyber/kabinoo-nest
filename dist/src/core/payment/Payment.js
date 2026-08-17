"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentLink = getPaymentLink;
exports.handlePaymentAction = handlePaymentAction;
exports.onPaymentSuccessful = onPaymentSuccessful;
const IRTPayment_1 = require("./IRTPayment");
async function getPaymentLink(payment) {
    return await IRTPayment_1.default.doPayment(payment);
}
async function handlePaymentAction(payment, devDo = false) {
    const { actions } = payment;
    for (let action of actions) {
        const { model: modelName, method, query = {} } = action;
        const model = prisma[modelName];
        if (!model)
            throw ("مدل عملیات ناشناخته است");
        const func = model[method];
        if (!func)
            throw ("عملیات ناشناخته");
        try {
            await func(query);
        }
        catch (e) {
            console.error(e);
            throw ("خطا در انجام عملیات");
        }
    }
    await prisma.paymentAction.deleteMany({
        where: {
            paymentId: payment.id
        }
    });
    await prisma.payment.update({
        where: {
            id: payment.id
        },
        data: {
            paid_at: new Date()
        }
    });
    global.paymentEvents ||= {};
    await global.paymentEvents[payment.id]?.();
    delete global.paymentEvents[payment.id];
}
function onPaymentSuccessful(payment, event) {
    global.paymentEvents ||= {};
    global.paymentEvents[payment.id] = event;
}
//# sourceMappingURL=Payment.js.map