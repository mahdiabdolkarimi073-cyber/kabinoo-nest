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
exports.UserDbResult = void 0;
const auth_1 = require("../auth");
const db_utils_1 = require("../../utils/db-utils");
const common_1 = require("@nestjs/common");
const password_1 = require("../../utils/password");
const prisma_handler_1 = require("../../core/prisma.handler");
const db_1 = require("../../core/db");
const built_in_1 = require("../../utils/built-in");
class UserHandler extends prisma_handler_1.default {
    static onMount() {
        (0, db_1.watchDB)("user", "User", ["create", 'update'], ({ args }) => {
            const { nationalCode, email } = args.data || {};
            if (nationalCode && (isNaN(+nationalCode) || (nationalCode + "").length !== 10))
                (0, built_in_1.Throw)("کدملی اشتباه است");
            if (email && !(email + "").includes("@"))
                (0, built_in_1.Throw)("ایمیل اشتباه است");
        }, 'before');
    }
    GET() {
        return this.getUser();
    }
    getModel() {
        return prisma.user;
    }
    async additionalPayload() {
        return {
            id: (await this.getUser()).id,
            token: undefined,
            password: undefined,
            phone: undefined
        };
    }
    async POST() {
        return this.methodDeny();
    }
    async comment(req, res) {
        this.splitInstance(async function () {
            const user = await this.getUser();
            const verify = await (0, password_1.verifyPassword)(this.get("current", "پسورد فعلی وارد نشده"), user.password());
            if (!verify)
                this.throw("رمزعبور فعلی اشتباه است");
            return await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    password: await (0, password_1.hashPassword)(this.get("new", "رمزعبور جدید وارد نشده"))
                }
            });
        }, req, res);
    }
}
exports.default = UserHandler;
__decorate([
    (0, common_1.Post)("password"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserHandler.prototype, "comment", null);
exports.UserDbResult = {
    password: {
        needs: {
            password: true,
        },
        compute: (params) => (0, db_utils_1.dbSecureProp)(() => params.password),
    },
    token: {
        needs: {
            token: true,
        },
        compute: (params) => (0, db_utils_1.dbSecureProp)(() => params.token),
    },
    phone: {
        needs: {
            phone: true
        },
        compute(params) {
            return (0, db_utils_1.dbSecureProp)(() => (0, auth_1.finalizeUserPhone)(params.phone));
        }
    }
};
//# sourceMappingURL=index.js.map