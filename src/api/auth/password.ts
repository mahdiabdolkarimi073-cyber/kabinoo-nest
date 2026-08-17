import RequestHandler from '@/core/request.handler';
import PhoneVerification from '@api/auth/verify';
import { finalizeUserPhone } from '@api/auth/index';
import { hashPassword } from '@/utils/password';

export default class PublicProducts extends RequestHandler {
    async POST() {
        const { phone, password } = this.$_PARAMS({
            phone: 'شماره تلفن',
            password: 'رمزعبور',
        });
        if (!PhoneVerification.isVerified(phone)) this.throw('ابتدا شماره تلفن خود را تایید کنید!');
        let user = await prisma.user.findUnique({
            where: {
                phone: finalizeUserPhone(phone),
            },
        }) || this.throw('کاربری با این شماره تلفن ثبت نام نکرده است');

        user = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                password: await hashPassword(password + ''),
            },
        });
        return this.setUser(user);
    }
}