import RequestHandler from '@/core/request.handler';
export default class PhoneVerification extends RequestHandler {
    private static readonly MAX_ATTEMPTS;
    private static readonly CODE_EXPIRY_MINUTES;
    private static readonly VERIFIED_EXPIRY_MINUTES;
    private static readonly LOCKOUT_MINUTES;
    private static phones;
    static verified: Set<number>;
    handle(): Promise<void>;
    private parsePhone;
    private verifyCode;
    private requestNewCode;
    private isExpired;
    private sendSms;
    static isVerified(phone: string | number): boolean;
}
