import RequestHandler from '@/core/request.handler';

export default class IndexApi extends RequestHandler {

    async handle() {
        return {
            print: ["hello","world"],
            body: this.request.body,
            json: this.json,
            params: this.params,
            headers: this.request.headers,
            method: this.request.method
        };
    }

}