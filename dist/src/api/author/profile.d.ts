import RequestHandler from "../../core/request.handler";
export default class AuthorProfileHandler extends RequestHandler {
    handle(): Promise<{
        name: string;
        id: string;
        nationalCode: string;
        phone: () => string;
        email: string;
        joined_at: Date;
        isAuthor: boolean;
    }>;
}
