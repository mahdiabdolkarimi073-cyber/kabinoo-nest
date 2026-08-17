import { $Enums, Prisma } from '@prisma/client';
import ModelName = Prisma.ModelName;


export const datamodel = Prisma?.dmmf?.datamodel;


const PrismaSchemaGenerated = datamodel?.models?.map(model => {
    return {
        ...model,
        info: handlePrismaModuleDocumentation(model.documentation),
        fields: model.fields.map(field => {
            let info: any = handlePrismaModuleDocumentation(field?.documentation);

            return {
                ...field,
                info,
            };
        }),
    };
});

export function handlePrismaModuleDocumentation(documentation: string | undefined) {
    let info: any = {};
    const docs = documentation;
    if (docs) {
        const lines: string[] = docs.split('\n').map(s => s.split('\n')).flat().map(s => s.split('\\n')).flat();
        lines.map(str => {
            const args = str.split('@')?.[1]?.split(' ');
            const key = args?.[0];
            if (!key) return;
            let value = args.slice(1).join(' ') || 'true';
            if (key) {
                try {
                    value = JSON.parse(value);
                } catch {
                }
                // @ts-ignore
                info[key] = value;
            }
        });
    }

    return info;
}

export function GetModelFullInfo<N extends ModelName, D extends (o: string) => any = (o: string) => never>(modelName: N, nonExists?: D): Record<keyof Prisma.TypeMap['model'][N]['fields'], string | ReturnType<D>> {
    const schema = PrismaSchemaGenerated;
    if (!schema) throw ('SCHEMA NOT FOUND');

    const model = schema.find(o => o.name === modelName);
    if (!model) throw (`MODEL NOT FOUND ${modelName}`);

    return Object.fromEntries(model.fields.map(field => ([
        field.name,
        field.info?.name || nonExists?.(field.name),
    ]))) as any;
}

export function getEnumInfo(name: keyof typeof $Enums) {
    const e = datamodel?.enums.find(o => o.name === name);
    if (!e) return undefined;


    return e.values.map(o => ({
        key: o.name,
        //@ts-ignore
        name: handlePrismaModuleDocumentation(o.documentation || '')?.name || o?.name,
    }));
}

export default PrismaSchemaGenerated;
