import RequestHandler from "../../core/request.handler";
export default class OffCodeHandler extends RequestHandler {
    GET(): Promise<{
        id: string;
        userId: string | null;
        percent: number;
        used: number;
        maxUsage: number | null;
    }>;
}
export declare function getValidOffCode(userId: string, code: string): Promise<{
    id: string;
    userId: string | null;
    percent: number;
    used: number;
    maxUsage: number | null;
}>;
