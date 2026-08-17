"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizeUserPhone = finalizeUserPhone;
const request_handler_1 = require("../../core/request.handler");
const password_1 = require("../../utils/password");
const common_1 = require("@nestjs/common");
const string_1 = require("../../utils/string");
const verify_1 = require("./verify");
class LoginHandler extends request_handler_1.default {
    static attempts = {};
    async postSignup(req, res) {
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
            if (!verify_1.default.isVerified(params.phone))
                this.throw(`شماره تلفن ${params.phone} تایید نشده است!`);
            this.debug("User Params", params);
            const finalPhone = finalizeUserPhone(params.phone + "");
            const user = await prisma.user.create({
                data: {
                    name: params.name + "",
                    phone: finalPhone,
                    nationalCode: params.nationalCode || null,
                    email: params?.email || null,
                    password: await (0, password_1.hashPassword)(params.password + ""),
                    refId: params.refId || undefined,
                    refCode: (0, string_1.generateRandomString)(5)
                }
            });
            this.debug("User created", user);
            return this.setUser(user);
        }, req, res);
    }
    async postLogin(req, res) {
        return this.splitInstance(async function login() {
            const { phone = this.need('phone'), password = this.need('password') } = {
                ...this.params,
                ...this.json,
            };
            let { attempt, cleaner } = LoginHandler.attempts[this.request.ip] || {
                attempt: 0,
            };
            if (attempt > 10)
                this.throw({
                    code: 403,
                    message: 'Too many tries',
                });
            const err = () => {
                if (cleaner)
                    clearTimeout(cleaner);
                cleaner = setTimeout(() => {
                    delete LoginHandler.attempts[this.request.ip];
                }, 10 * 60 * 1000);
                LoginHandler.attempts[this.request.ip] = {
                    cleaner,
                    attempt: attempt + 1,
                };
                LoginHandler.attempts = Object.fromEntries(Object.entries(LoginHandler.attempts)
                    .slice(-20));
                return this.throw('شماره تلفن یا رمزعبور اشتباه است');
            };
            this.debug("Phone", phone);
            const finalPhone = finalizeUserPhone(phone);
            const user = await prisma.user.findUnique({
                where: {
                    phone: finalPhone,
                },
            }) || err();
            this.debug("User found");
            const verified = await (0, password_1.verifyPassword)(password, user.password())
                .catch(err.bind(this));
            if (!verified) {
                this.debug("wrong password");
                err();
            }
            delete LoginHandler.attempts[this.request.ip];
            return this.setUser(user);
        }, req, res);
    }
    onWebSocket(ws) {
    }
}
exports.default = LoginHandler;
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LoginHandler.prototype, "postSignup", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LoginHandler.prototype, "postLogin", null);
function finalizeUserPhone(phone) {
    const finalPhone = (phone + "").slice(-10);
    if (!finalPhone.startsWith("9"))
        throw ("فقط شماره تلفن همراه قابل قبول است");
    return finalPhone;
}
//# sourceMappingURL=index.js.map