import RequestHandler from "../../core/request.handler";
export default class DesignHandler extends RequestHandler {
    GET(): Promise<Record<import(".prisma/client").$Enums.VariableKey, number>>;
}
export declare function getVarConfig(): Promise<Record<import(".prisma/client").$Enums.VariableKey, number>>;
