import { Payment } from ".prisma/client";
import { PaymentAction } from "@prisma/client";
declare global {
    var paymentEvents: {
        [key: string]: () => (void | Promise<void>);
    } | undefined;
}
export declare function getPaymentLink(payment: Payment): Promise<string>;
export declare function handlePaymentAction(payment: Payment & {
    actions: PaymentAction[];
}, devDo?: boolean): Promise<void>;
export declare function onPaymentSuccessful(payment: {
    id: Payment['id'];
}, event: () => (void | Promise<void>)): void;
