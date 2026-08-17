"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_handler_1 = require("../core/request.handler");
class IndexApi extends request_handler_1.default {
    async handle() {
        return {
            print: ["hello", "world"],
            body: this.request.body,
            json: this.json,
            params: this.params,
            headers: this.request.headers,
            method: this.request.method
        };
    }
}
exports.default = IndexApi;
//# sourceMappingURL=index.js.map