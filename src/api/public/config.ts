import PrismaFullHandler from "@/core/prisma.handler";
import PrismaLimitHandler from "@/core/prisma.limited.handler";
import RequestHandler from "@/core/request.handler";
import { VariableKey } from "@prisma/client";
import { getEnumInfo } from "prisma/PrismaInfo";

export default class DesignHandler extends RequestHandler {

    async GET() {
        return await getVarConfig();
    }

}

export async function getVarConfig() {
    const records = await prisma.variable.findMany();
    const defined = Object.fromEntries(records.map(o => ([o.key, o.value])));
    const all = Object.fromEntries(getEnumInfo("VariableKey").map(o => ([o.key, 0])));
    return {
        ...all,
        ...defined
    } as Record<VariableKey, number>;
}