import { PrismaType } from "@/core/db";
import RequestHandler from "@/core/request.handler";
import { Throw } from "@/utils/built-in";

export default class OffCodeHandler extends RequestHandler {

    async GET() {
        const user = await this.getUser(true);
        const code = this.params['code'] || this.need("code", "کد تخفیف وارد نشده");

        return getValidOffCode(user.id, code);
    }

}

export async function getValidOffCode(userId: string, code: string) {
    const offCode = await prisma.offCode.findUnique({
        where: {
            id: code
        }
    }) || Throw("کد تخفیف یافت نشد")

    if (offCode.userId && offCode.userId !== userId) Throw("کد تخفیف متعلق به شما نیست");

    if (offCode.maxUsage && offCode.used >= offCode.maxUsage) Throw("نمیتوانید از این کد تخفیف استفاده کنید")

    return offCode;
}