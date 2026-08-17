import RequestHandler from '@/core/request.handler';
export default class IndexApi extends RequestHandler {
    handle(): Promise<{
        print: string[];
        body: any;
        json: Record<string, any>;
        params: Record<string, string>;
        headers: import("http").IncomingHttpHeaders;
        method: string;
    }>;
}
