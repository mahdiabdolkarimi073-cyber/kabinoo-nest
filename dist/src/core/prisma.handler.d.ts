import { Prisma } from '@prisma/client';
import RequestHandler from './request.handler';
import PrismaSchema from '../../prisma/PrismaInfo';
type CreateType = any;
type ModelIncludeType = boolean | {
    include: {
        [k: string]: ModelIncludeType;
    };
};
export default class PrismaFullHandler extends RequestHandler {
    getModel(): (typeof prisma)[Prisma.TypeMap['meta']['modelProps']];
    getName(): string;
    waitForCallableProps(): boolean;
    GET(id?: string | number | Record<string, any>): Promise<any>;
    getPrismaFields(): typeof PrismaSchema[0]['fields'];
    getPrismaModelInfo(): {
        info: any;
        fields: {
            info: any;
            kind: "object" | "scalar" | "enum" | "unsupported";
            name: string;
            isRequired: boolean;
            isList: boolean;
            isUnique: boolean;
            isId: boolean;
            isReadOnly: boolean;
            isGenerated?: boolean;
            isUpdatedAt?: boolean;
            type: string;
            nativeType?: readonly [string, readonly string[]];
            dbName?: string | null;
            hasDefaultValue: boolean;
            default?: string | number | boolean | {
                readonly name: string;
                readonly args: readonly (string | number)[];
            } | readonly (string | number | boolean)[];
            relationFromFields?: readonly string[];
            relationToFields?: readonly string[];
            relationOnDelete?: string;
            relationOnUpdate?: string;
            relationName?: string;
            documentation?: string;
        }[];
        name: string;
        dbName: string | null;
        schema: string | null;
        uniqueFields: readonly (readonly string[])[];
        uniqueIndexes: readonly {
            readonly name: string;
            readonly fields: readonly string[];
        }[];
        documentation?: string;
        primaryKey: {
            readonly name: string | null;
            readonly fields: readonly string[];
        };
        isGenerated?: boolean;
    };
    enableFullyInclude(): boolean;
    GET_findFirst(id: any): Promise<any>;
    getIdField(): {
        info: any;
        kind: "object" | "scalar" | "enum" | "unsupported";
        name: string;
        isRequired: boolean;
        isList: boolean;
        isUnique: boolean;
        isId: boolean;
        isReadOnly: boolean;
        isGenerated?: boolean;
        isUpdatedAt?: boolean;
        type: string;
        nativeType?: readonly [string, readonly string[]];
        dbName?: string | null;
        hasDefaultValue: boolean;
        default?: string | number | boolean | {
            readonly name: string;
            readonly args: readonly (string | number)[];
        } | readonly (string | number | boolean)[];
        relationFromFields?: readonly string[];
        relationToFields?: readonly string[];
        relationOnDelete?: string;
        relationOnUpdate?: string;
        relationName?: string;
        documentation?: string;
    };
    getTargetKey(): string;
    getUniqueIndex(): {
        readonly name: string;
        readonly fields: readonly string[];
    };
    getTargetId(genFrom?: Record<string, any>): string | number | typeof genFrom | undefined;
    enableQueryInclude(): boolean;
    enableQueryFilter(): boolean;
    queryFilter(): Promise<{
        where?: undefined;
        include?: undefined;
    } | {
        where: any;
        include: any;
    }>;
    handleModelInclude(modelName: string, _level?: number): ModelIncludeType;
    enablePagination(): boolean;
    isFullAccess(): boolean;
    PATCH(): Promise<any>;
    getWhereCondition(): Promise<{
        [k: string]: unknown;
    }>;
    DELETE(): Promise<any>;
    POST(): Promise<any>;
    filter(obj: any): any;
    getOutputKeys(): Array<keyof CreateType>;
    create(body: any): Promise<any>;
    enableRelationHandle(): boolean;
    handleRelation(id?: string | number | Record<string, any>): Promise<void>;
    edit(model: any): Promise<any>;
    getRequiredFields(operation: 'create' | 'edit'): Promise<any>;
    enableDefaultFieldsGenerator(): boolean;
    OPTIONS(): Promise<any>;
    canEdit(): boolean;
    canCreate(): boolean;
    beforeCreate<T extends any>(fields: T): Promise<T>;
    beforeEdit<T extends any>(fields: T): Promise<T>;
    before<T extends any>(action: 'create' | 'edit', payload: T): Promise<T>;
    PUT(): Promise<any>;
    handle(funcName: string): Promise<void>;
    private getPrismaModel;
    private getPrismaModelName;
    private single;
    private buildIncludeFields;
}
export {};
