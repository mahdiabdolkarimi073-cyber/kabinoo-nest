import RequestHandler from '@/core/request.handler';
export default class ProxyHandler extends RequestHandler {
    handle(): Promise<void>;
}
