import PrismaFullHandler from "@/core/prisma.handler";
import PrismaLimitHandler from "@/core/prisma.limited.handler";
import RequestHandler from "@/core/request.handler"
import { Get, Post, Req, Res } from "@nestjs/common";
import { Product } from "@prisma/client";
import { Request, Response } from "express"

export default class PublicProducts extends PrismaFullHandler {
    getModel() {
        return prisma.userAdvice;
    }

    async additionalPayload() {
        if (this.get('phone') && isNaN(+this.get('phone'))) return this.throw("شماره تلفن معتبر نیست");
        return {
            userId: (await this.getUser()).id
        }
    }

    getName() {
        return "مشاوره"
    }

    async DELETE() {
        return this.methodDeny();
    }

    async GET() {
        return this.msg("");
    }

    async PUT() {
        return this.methodDeny();
    }
}