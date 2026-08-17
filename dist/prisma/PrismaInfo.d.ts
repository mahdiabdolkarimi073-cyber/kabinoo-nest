import { $Enums, Prisma } from '@prisma/client';
import ModelName = Prisma.ModelName;
export declare const datamodel: Omit<{
    readonly models: readonly {
        readonly name: string;
        readonly dbName: string | null;
        readonly schema: string | null;
        readonly fields: readonly {
            readonly kind: "object" | "scalar" | "enum" | "unsupported";
            readonly name: string;
            readonly isRequired: boolean;
            readonly isList: boolean;
            readonly isUnique: boolean;
            readonly isId: boolean;
            readonly isReadOnly: boolean;
            readonly isGenerated?: boolean;
            readonly isUpdatedAt?: boolean;
            readonly type: string;
            readonly nativeType?: readonly [string, readonly string[]];
            readonly dbName?: string | null;
            readonly hasDefaultValue: boolean;
            readonly default?: string | number | boolean | {
                readonly name: string;
                readonly args: readonly (string | number)[];
            } | readonly (string | number | boolean)[];
            readonly relationFromFields?: readonly string[];
            readonly relationToFields?: readonly string[];
            readonly relationOnDelete?: string;
            readonly relationOnUpdate?: string;
            readonly relationName?: string;
            readonly documentation?: string;
        }[];
        readonly uniqueFields: readonly (readonly string[])[];
        readonly uniqueIndexes: readonly {
            readonly name: string;
            readonly fields: readonly string[];
        }[];
        readonly documentation?: string;
        readonly primaryKey: {
            readonly name: string | null;
            readonly fields: readonly string[];
        };
        readonly isGenerated?: boolean;
    }[];
    readonly enums: readonly {
        readonly name: string;
        readonly values: readonly {
            readonly name: string;
            readonly dbName: string | null;
        }[];
        readonly dbName?: string | null;
        readonly documentation?: string;
    }[];
    readonly types: readonly {
        readonly name: string;
        readonly dbName: string | null;
        readonly schema: string | null;
        readonly fields: readonly {
            readonly kind: "object" | "scalar" | "enum" | "unsupported";
            readonly name: string;
            readonly isRequired: boolean;
            readonly isList: boolean;
            readonly isUnique: boolean;
            readonly isId: boolean;
            readonly isReadOnly: boolean;
            readonly isGenerated?: boolean;
            readonly isUpdatedAt?: boolean;
            readonly type: string;
            readonly nativeType?: readonly [string, readonly string[]];
            readonly dbName?: string | null;
            readonly hasDefaultValue: boolean;
            readonly default?: string | number | boolean | {
                readonly name: string;
                readonly args: readonly (string | number)[];
            } | readonly (string | number | boolean)[];
            readonly relationFromFields?: readonly string[];
            readonly relationToFields?: readonly string[];
            readonly relationOnDelete?: string;
            readonly relationOnUpdate?: string;
            readonly relationName?: string;
            readonly documentation?: string;
        }[];
        readonly uniqueFields: readonly (readonly string[])[];
        readonly uniqueIndexes: readonly {
            readonly name: string;
            readonly fields: readonly string[];
        }[];
        readonly documentation?: string;
        readonly primaryKey: {
            readonly name: string | null;
            readonly fields: readonly string[];
        };
        readonly isGenerated?: boolean;
    }[];
    readonly indexes: readonly {
        readonly model: string;
        readonly type: "id" | "normal" | "unique" | "fulltext";
        readonly isDefinedOnField: boolean;
        readonly name?: string;
        readonly dbName?: string;
        readonly algorithm?: string;
        readonly clustered?: boolean;
        readonly fields: readonly {
            readonly name: string;
            readonly sortOrder?: "asc" | "desc";
            readonly length?: number;
            readonly operatorClass?: string;
        }[];
    }[];
}, "indexes">;
declare const PrismaSchemaGenerated: {
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
}[];
export declare function handlePrismaModuleDocumentation(documentation: string | undefined): any;
export declare function GetModelFullInfo<N extends ModelName, D extends (o: string) => any = (o: string) => never>(modelName: N, nonExists?: D): Record<keyof Prisma.TypeMap['model'][N]['fields'], string | ReturnType<D>>;
export declare function getEnumInfo(name: keyof typeof $Enums): {
    key: string;
    name: any;
}[];
export default PrismaSchemaGenerated;
