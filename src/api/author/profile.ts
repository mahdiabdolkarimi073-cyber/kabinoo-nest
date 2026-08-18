import RequestHandler from "@/core/request.handler";

export default class AuthorProfileHandler extends RequestHandler {
    async handle() {
        const userId = this.params["userId"];
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                nationalCode: true,
                phone: true,
                joined_at: true,
                isAuthor: true,
            },
        });
        if (!user) this.throw({ code: 404, message: "کاربر یافت نشد" });
        return user;
    }
}
