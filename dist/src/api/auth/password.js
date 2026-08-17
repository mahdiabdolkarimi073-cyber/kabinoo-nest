"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_handler_1 = require("../../core/request.handler");
const verify_1 = require("./verify");
const index_1 = require("./index");
const password_1 = require("../../utils/password");
class PublicProducts extends request_handler_1.default {
    async POST() {
        const { phone, password } = this.$_PARAMS({
            phone: 'شماره تلفن',
            password: 'رمزعبور',
        });
        if (!verify_1.default.isVerified(phone))
            this.throw('ابتدا شماره تلفن خود را تایید کنید!');
        let user = await prisma.user.findUnique({
            where: {
                phone: (0, index_1.finalizeUserPhone)(phone),
            },
        }) || this.throw('کاربری با این شماره تلفن ثبت نام نکرده است');
        user = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                password: await (0, password_1.hashPassword)(password + ''),
            },
        });
        return this.setUser(user);
    }
}
exports.default = PublicProducts;
//# sourceMappingURL=password.js.map