
import { Post, Req, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as process from 'process';
import { generateRandomString } from '@/utils/string';
import { safeWait } from '@/utils/request';
import { Response } from 'express';
import * as path from 'node:path';
import RequestHandler from '@/core/request.handler';


export default class UserUpload extends RequestHandler {
    
    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'file', maxCount: 1 }
    ]))
    async test(@UploadedFiles() body: any,@Res() res: Response) {
        this.res = res;
        const _file = body?.['file']?.[0] || this.throw("Invalid file");
        const name = _file.originalname;
        const buffer = _file.buffer as Buffer;
        const file = new File([buffer as any], name);
        const fileName = `${generateRandomString(10)}.$EX`;
        const path = await updateFile(file, "unknown", fileName)
        
        return this.response({
            path
        })
    }
    
}


export async function createFile(file: File, filePath: string) {
    const arr = await file.arrayBuffer();
    const uint8View = new Uint8Array(arr);
    return fs.writeFileSync(filePath, uint8View)
}

export const UPLOAD_DIR = "/uploaded";
export async function updateFile(file: File, previousPath: string, newPath: string): Promise<string> {
    const apiPath = "/public/file"
    
    previousPath = previousPath.replace(apiPath, UPLOAD_DIR);
    const uploadPath = path.join(process.cwd(),UPLOAD_DIR);
    
    const checkDelete = previousPath.includes(UPLOAD_DIR);
    let targetLocation = newPath.replace(UPLOAD_DIR,"");
    
    
    // Create Target Location's folder
    const paths = targetLocation.split("/");
    const recursivePath = paths.slice(0,-1).join("/");
    const finalRPath = path.join(uploadPath,recursivePath);
    if (!fs.existsSync(finalRPath)) {
        fs.mkdirSync(finalRPath, {recursive: true});
    }
    
    //Parse $EX in Target Location
    if (targetLocation.includes("$EX")) {
        const nameAr = file.name.split(".");
        const ex = nameAr[nameAr.length - 1];
        targetLocation = targetLocation.replace("$EX", ex);
    }
    
    // Delete Previous File
    const absolutePrePath = path.join(process.cwd(),previousPath);
    if (checkDelete && fs.existsSync(absolutePrePath)) {
        fs.unlinkSync(absolutePrePath);
    }
    
    const finalNewPath = path.join(uploadPath,targetLocation);
    await createFile(file, finalNewPath);
    
    let final = path.join(UPLOAD_DIR,targetLocation).replaceAll("\\","/");
    final  = final.replace(UPLOAD_DIR, apiPath);
    return final;
}

export async function downloadFile(url: string, init: RequestInit = {}) {
    const args = url.split('/');
    const name = args?.pop?.() || `${generateRandomString()}.${url?.split?.(".")?.shift?.() || ".buffer"}`;
    const folder = 'download';
    
    const relativePath = `/${folder}/${name}`;
    const path = process.cwd()+`/public/backend/uploaded${relativePath}`;
    if (fs.existsSync(path)) {
        return relativePath;
    }
    const response = await safeWait(()=>fetch(url, init));
    if (!response) return undefined;
    const buffer = await response.arrayBuffer();
    
    const file = new File([buffer], name);
    return updateFile(file, relativePath, relativePath);
}
