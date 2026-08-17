import PrismaFullHandler from './prisma.handler';
export default class PrismaLimitHandler extends PrismaFullHandler {
    DELETE(): any;
    POST(): any;
    PUT(): Promise<void>;
    canCreate(): boolean;
    canEdit(): boolean;
}
