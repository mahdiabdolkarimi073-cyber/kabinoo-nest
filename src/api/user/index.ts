import RequestHandler from '@/core/request.handler';
import { User } from '@prisma/client';
import { finalizeUserPhone } from '@/api/auth';
import { dbSecureProp } from '@/utils/db-utils';
import { WebSocket } from 'ws';
import { generateRandomString } from '@/utils/string';
import { Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { hashPassword, verifyPassword } from '@/utils/password';
import PrismaFullHandler from '@/core/prisma.handler';
import { watchDB } from '@/core/db';
import { Throw } from '@/utils/built-in';



export default class UserHandler extends PrismaFullHandler {

    static onMount() {
        watchDB("user", "User", ["create", 'update'], ({args}) => {
            const {nationalCode, email} = args.data || {};
            if (nationalCode && (isNaN(+nationalCode) || (nationalCode+"").length !== 10)) Throw("کدملی اشتباه است");
            if (email && !(email+"").includes("@")) Throw("ایمیل اشتباه است")
        }, 'before')
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
        }
    }

    async POST() {
        return this.methodDeny();
    }

    @Post("password")
    async comment(@Req() req: Request, @Res() res: Response) {
        this.splitInstance(async function () {
            const user = await this.getUser();
            
            const verify = await verifyPassword(this.get("current", "پسورد فعلی وارد نشده"), user.password());
            if (!verify) this.throw("رمزعبور فعلی اشتباه است");

            return await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    password: await hashPassword(this.get("new","رمزعبور جدید وارد نشده"))
                }
            })
        },req,res)
    }
}

export const UserDbResult = {
    password: {
        needs: {
            password: true,
        },
        compute: (params: User) => dbSecureProp(() => params.password),
    },
    token: {
        needs: {
            token: true,
        },
        compute: (params: User) => dbSecureProp(() => params.token),
    },
    phone: {
        needs: {
            phone: true
        },
        compute(params: User) {
            return dbSecureProp(()=>finalizeUserPhone(params.phone));
        }
    }
} as const;