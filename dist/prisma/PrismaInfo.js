"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datamodel = void 0;
exports.handlePrismaModuleDocumentation = handlePrismaModuleDocumentation;
exports.GetModelFullInfo = GetModelFullInfo;
exports.getEnumInfo = getEnumInfo;
const client_1 = require("@prisma/client");
exports.datamodel = client_1.Prisma?.dmmf?.datamodel;
const PrismaSchemaGenerated = exports.datamodel?.models?.map(model => {
    return {
        ...model,
        info: handlePrismaModuleDocumentation(model.documentation),
        fields: model.fields.map(field => {
            let info = handlePrismaModuleDocumentation(field?.documentation);
            return {
                ...field,
                info,
            };
        }),
    };
});
function handlePrismaModuleDocumentation(documentation) {
    let info = {};
    const docs = documentation;
    if (docs) {
        const lines = docs.split('\n').map(s => s.split('\n')).flat().map(s => s.split('\\n')).flat();
        lines.map(str => {
            const args = str.split('@')?.[1]?.split(' ');
            const key = args?.[0];
            if (!key)
                return;
            let value = args.slice(1).join(' ') || 'true';
            if (key) {
                try {
                    value = JSON.parse(value);
                }
                catch {
                }
                info[key] = value;
            }
        });
    }
    return info;
}
function GetModelFullInfo(modelName, nonExists) {
    const schema = PrismaSchemaGenerated;
    if (!schema)
        throw ('SCHEMA NOT FOUND');
    const model = schema.find(o => o.name === modelName);
    if (!model)
        throw (`MODEL NOT FOUND ${modelName}`);
    return Object.fromEntries(model.fields.map(field => ([
        field.name,
        field.info?.name || nonExists?.(field.name),
    ])));
}
function getEnumInfo(name) {
    const e = exports.datamodel?.enums.find(o => o.name === name);
    if (!e)
        return undefined;
    return e.values.map(o => ({
        key: o.name,
        name: handlePrismaModuleDocumentation(o.documentation || '')?.name || o?.name,
    }));
}
exports.default = PrismaSchemaGenerated;
//# sourceMappingURL=PrismaInfo.js.map