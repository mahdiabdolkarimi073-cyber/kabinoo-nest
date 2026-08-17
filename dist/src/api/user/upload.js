"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOAD_DIR = void 0;
exports.createFile = createFile;
exports.updateFile = updateFile;
exports.downloadFile = downloadFile;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const fs = require("fs");
const process = require("process");
const string_1 = require("../../utils/string");
const request_1 = require("../../utils/request");
const path = require("node:path");
const request_handler_1 = require("../../core/request.handler");
class UserUpload extends request_handler_1.default {
    async test(body, res) {
        this.res = res;
        const _file = body?.['file']?.[0] || this.throw("Invalid file");
        const name = _file.originalname;
        const buffer = _file.buffer;
        const file = new File([buffer], name);
        const fileName = `${(0, string_1.generateRandomString)(10)}.$EX`;
        const path = await updateFile(file, "unknown", fileName);
        return this.response({
            path
        });
    }
}
exports.default = UserUpload;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'file', maxCount: 1 }
    ])),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserUpload.prototype, "test", null);
async function createFile(file, filePath) {
    const arr = await file.arrayBuffer();
    const uint8View = new Uint8Array(arr);
    return fs.writeFileSync(filePath, uint8View);
}
exports.UPLOAD_DIR = "/uploaded";
async function updateFile(file, previousPath, newPath) {
    const apiPath = "/public/file";
    previousPath = previousPath.replace(apiPath, exports.UPLOAD_DIR);
    const uploadPath = path.join(process.cwd(), exports.UPLOAD_DIR);
    const checkDelete = previousPath.includes(exports.UPLOAD_DIR);
    let targetLocation = newPath.replace(exports.UPLOAD_DIR, "");
    const paths = targetLocation.split("/");
    const recursivePath = paths.slice(0, -1).join("/");
    const finalRPath = path.join(uploadPath, recursivePath);
    if (!fs.existsSync(finalRPath)) {
        fs.mkdirSync(finalRPath, { recursive: true });
    }
    if (targetLocation.includes("$EX")) {
        const nameAr = file.name.split(".");
        const ex = nameAr[nameAr.length - 1];
        targetLocation = targetLocation.replace("$EX", ex);
    }
    const absolutePrePath = path.join(process.cwd(), previousPath);
    if (checkDelete && fs.existsSync(absolutePrePath)) {
        fs.unlinkSync(absolutePrePath);
    }
    const finalNewPath = path.join(uploadPath, targetLocation);
    await createFile(file, finalNewPath);
    let final = path.join(exports.UPLOAD_DIR, targetLocation).replaceAll("\\", "/");
    final = final.replace(exports.UPLOAD_DIR, apiPath);
    return final;
}
async function downloadFile(url, init = {}) {
    const args = url.split('/');
    const name = args?.pop?.() || `${(0, string_1.generateRandomString)()}.${url?.split?.(".")?.shift?.() || ".buffer"}`;
    const folder = 'download';
    const relativePath = `/${folder}/${name}`;
    const path = process.cwd() + `/public/backend/uploaded${relativePath}`;
    if (fs.existsSync(path)) {
        return relativePath;
    }
    const response = await (0, request_1.safeWait)(() => fetch(url, init));
    if (!response)
        return undefined;
    const buffer = await response.arrayBuffer();
    const file = new File([buffer], name);
    return updateFile(file, relativePath, relativePath);
}
//# sourceMappingURL=upload.js.map