import RequestHandler from '@/core/request.handler';
import { hashPassword, verifyPassword } from '@/utils/password';
import { WebSocket } from 'ws';
import { Post, Req, Res } from '@nestjs/common';
import { generateRandomString } from '@/utils/string';
import PhoneVerification from '@api/auth/verify';


export default class LoginHandler extends RequestHandler {
    static attempts: Record<string, {
        cleaner?: ReturnType<typeof setTimeout>,
        attempt: number
    }> = {};

    @Post('signup')
    async postSignup(@Req() req: any, @Res() res: any) {
        return this.splitInstance(async function () {
            const params = this.$_PARAMS({
                phone: "شماره تلفن",
                name: "نام و نام خانوادگی",
                password: "رمزعبور",
                nationalCode: {
                    required: false,
                    name: "کد ملی"
                },
                email: {
                    name: "ایمیل",
                    required: false
                },
                refId: {
                    name: "کدمعرف",
                    required: false
                }
            });
            if (!PhoneVerification.isVerified(params.phone)) this.throw(`شماره تلفن ${params.phone} تایید نشده است!`);

            this.debug("User Params", params);
            const finalPhone = finalizeUserPhone(params.phone + "");
            const user = await prisma.user.create({
                data: {
                    name: params.name + "",
                    phone: finalPhone,
                    nationalCode: params.nationalCode || null,
                    email: params?.email || null,
                    password: await hashPassword(params.password + ""),
                    refId: params.refId || undefined,
                    refCode: generateRandomString(5)
                }
            });
            this.debug("User created", user);
            return this.setUser(user);
        }, req, res);
    }

    @Post('login')
    async postLogin(@Req() req: any, @Res() res: any) {
        return this.splitInstance(async function login() {
            const { phone = this.need('phone'), password = this.need('password') } = {
                ...this.params,
                ...this.json,
            };

            let { attempt, cleaner } = LoginHandler.attempts[this.request.ip] || {
                attempt: 0,
            };

            if (attempt > 10) this.throw({
                code: 403,
                message: 'Too many tries',
            });

            const err = () => {
                if (cleaner) clearTimeout(cleaner);
                cleaner = setTimeout(() => {
                    delete LoginHandler.attempts[this.request.ip];
                }, 10 * 60 * 1000);
                LoginHandler.attempts[this.request.ip] = {
                    cleaner,
                    attempt: attempt + 1,
                };
                LoginHandler.attempts = Object.fromEntries(
                    Object.entries(LoginHandler.attempts)
                        .slice(-20),
                );
                return this.throw('شماره تلفن یا رمزعبور اشتباه است');
            };

            this.debug("Phone", phone)
            const finalPhone = finalizeUserPhone(phone);
            const user = await prisma.user.findUnique({
                where: {
                    phone: finalPhone,
                },
            }) || err();
            this.debug("User found");
            const verified = await verifyPassword(password, user.password())
                .catch(err.bind(this));
            if (!verified) {
                this.debug("wrong password");
                err();
            }
            delete LoginHandler.attempts[this.request.ip];
            return this.setUser(user);
        }, req, res);
    }

    onWebSocket(ws: WebSocket) {

    }
}

export function finalizeUserPhone(phone: string) {
    const finalPhone = (phone + "").slice(-10);
    if (!finalPhone.startsWith("9")) throw ("فقط شماره تلفن همراه قابل قبول است");
    return finalPhone;
}