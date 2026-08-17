
import PrismaFullHandler from '@/core/prisma.handler';

export default class VariableHandler extends PrismaFullHandler {
    getModel() {
        return prisma.variable;
    }

    getName() {
        return "متغیر"
    }
}