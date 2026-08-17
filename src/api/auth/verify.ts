import RequestHandler from '@/core/request.handler';
import { generateRandomNumber } from '@/utils/string';
import * as process from 'node:process';
import { VARS } from '@/global';

interface VerificationRecord {
    date: Date;
    code: string;
    attempts: number;
    thread?: ReturnType<typeof setTimeout>
}

export default class PhoneVerification extends RequestHandler {
    private static readonly MAX_ATTEMPTS = 5;
    private static readonly CODE_EXPIRY_MINUTES = 5;
    private static readonly VERIFIED_EXPIRY_MINUTES = 25;
    private static readonly LOCKOUT_MINUTES = 15;

    private static phones: Map<number, VerificationRecord> = new Map();
    static verified: Set<number> = new Set();

    async handle() {

        console.log('PARAMS:', this.params);
    console.log('JSON:', this.json);

        const { phone, code,check } = { ...this.params, ...this.json };
        const phoneNumber = this.parsePhone(phone);
        const verified = PhoneVerification.verified.has(phoneNumber);

        if (check === "true") {
            if (verified) return this.msg("OK");
            else this.throw("NOK MSG");
        }

        if (verified) {
            return this.msg('شماره تلفن از قبل تایید شده است!');
        }

        if (code) {
            return this.verifyCode(phoneNumber, code);
        }

        return this.requestNewCode(phoneNumber);
    }

    private parsePhone(phone: string): number {
        if (!phone) {
            this.throw('شماره تلفن وارد نشده است');
        }

        let str = String(phone).trim();

        if (str.startsWith('+98')) str = str.substring(3);
        else if (str.startsWith('98')) str = str.substring(2);
        else if (str.startsWith('0')) str = str.substring(1);

        this.debug('normalized phone:', str);

        if (str.length !== 10) {
            this.throw('شماره تلفن باید 11 رقم باشد');
        }

        const phoneNumber = parseInt(str, 10);
        if (isNaN(phoneNumber)) {
            this.throw(`شماره تلفن ${str} نامعتبر است`);
        }

        return phoneNumber;
    }

    private async verifyCode(phoneNumber: number, code: string) {
        const record = PhoneVerification.phones.get(phoneNumber);

        if (!record) {
            this.throw('کد تایید ارسال نشده است');
        }

        if (this.isExpired(record.date, PhoneVerification.CODE_EXPIRY_MINUTES)) {
            PhoneVerification.phones.delete(phoneNumber);
            this.throw('کد تایید منقضی شده است، مجددا تلاش کنید!');
        }

        if (record.attempts >= PhoneVerification.MAX_ATTEMPTS) {
            this.throw(
                `تعداد تلاش‌های مجاز تمام شده است. لطفا ${PhoneVerification.LOCKOUT_MINUTES} دقیقه صبر کنید`,
            );
        }

        if (record.code !== code) {
            record.attempts++;
            const remaining = PhoneVerification.MAX_ATTEMPTS - record.attempts;

            if (remaining <= 0) {
                if (record.thread) clearTimeout(record.thread);
                record.thread = setTimeout(() => {
                    PhoneVerification.phones.delete(phoneNumber);
                }, PhoneVerification.LOCKOUT_MINUTES * 60 * 1000);

                this.throw(
                    `کد تایید اشتباه است. تعداد تلاش‌های مجاز تمام شده است. ${PhoneVerification.LOCKOUT_MINUTES} دقیقه صبر کنید`,
                );
            }

            this.throw(`کد تایید اشتباه است. ${remaining} تلاش باقی مانده`);
        }

        PhoneVerification.verified.add(phoneNumber);
        PhoneVerification.phones.delete(phoneNumber);

        setTimeout(() => {
            PhoneVerification.verified.delete(phoneNumber);
        }, PhoneVerification.VERIFIED_EXPIRY_MINUTES * 60 * 1000);

        return this.msg('تایید شد');
    }

    private async requestNewCode(phoneNumber: number) {
        const record = PhoneVerification.phones.get(phoneNumber);
        if (record && !this.isExpired(record.date, PhoneVerification.CODE_EXPIRY_MINUTES)) {
            return this.msg(`کد تایید از قبل به ${phoneNumber} ارسال شده است`);
        }

        const code = generateRandomNumber();
        await this.sendSms(phoneNumber, code);

        PhoneVerification.phones.set(phoneNumber, {
            date: new Date(),
            code,
            attempts: 0,
        });

        return this.msg('ارسال شد');
    }

    private isExpired(date: Date, minutes: number): boolean {
        const expiryTime = new Date(date);
        expiryTime.setMinutes(expiryTime.getMinutes() + minutes);
        return expiryTime.getTime() < Date.now();
    }

    private async sendSms(phoneNumber: number, code: string) {
        this.debug('Sending code', phoneNumber, code);

        console.log("SMSIR_TOKEN:", process.env.SMSIR_TOKEN);

        const apiKey = process.env['SMSIR_TOKEN'];
        if (!apiKey) {
            this.throw('توکن پنل اس ام اس تنظیم نشده است، لطفا با پشتیبانی تماس بگیرید');
        }

        if (VARS.isDev) {
            this.debug("SMS CODE", phoneNumber,code);
        } else {
            const res = await fetch('https://api.sms.ir/v1/send/verify', {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'X-API-KEY': apiKey,
                },
                body: JSON.stringify({
                    mobile: String(phoneNumber),
                    templateId: process.env['SMSIR_VERIFY_TEMPLATE'] || 335621,
                    parameters: [{ name: 'code', value: code }],
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                this.throw(`خطای ارسال پیامک: ${res.status} ${res.statusText} ${errorText}`);
            }
            this.debug('SMS response:', res.status, await res.json());
        }
    }

    static isVerified(phone: string | number): boolean {
        try {
            const handler = new PhoneVerification();
            const phoneNumber = handler.parsePhone(String(phone));
            return PhoneVerification.verified.has(phoneNumber);
        } catch {
            return false;
        }
    }
}