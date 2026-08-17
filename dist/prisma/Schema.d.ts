import { Prisma } from '@prisma/client';
export declare const ModelNames: Prisma.ModelName;
export declare const BasicSchemaInformation: {
    [k: string]: {
        required: string[];
    };
};
export declare const SchemaFieldNames: {
    [key: string]: string;
    [key: number]: string;
    [key: symbol]: string;
};
