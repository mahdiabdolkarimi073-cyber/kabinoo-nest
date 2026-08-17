import RequestHandler from '@/core/request.handler';
export default class Enum extends RequestHandler {
    GET(): {
        key: string;
        name: any;
    }[];
}
