import PrismaFullHandler from './prisma.handler';

export default class PrismaLimitHandler extends PrismaFullHandler {
    DELETE(): any {
        this.methodDeny();
    }

    POST(): any {
        this.methodDeny();
    }

    async PUT() {
        this.methodDeny();
    }

    canCreate() {
        return false;
    }

    canEdit() {
        return false;
    }
}
