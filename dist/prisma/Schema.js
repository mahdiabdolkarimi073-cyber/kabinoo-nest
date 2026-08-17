"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaFieldNames = exports.BasicSchemaInformation = exports.ModelNames = void 0;
const PrismaInfo_1 = require("./PrismaInfo");
exports.ModelNames = PrismaInfo_1.default?.map(m => m.name);
exports.BasicSchemaInformation = Object.fromEntries(PrismaInfo_1.default
    ?.map(model => ([
    model.name,
    {
        required: model.fields.filter(f => f.isRequired && !f.isId && !f.relationFromFields && !f.hasDefaultValue).map(f => f.name),
    },
])) ?? []);
let names = {};
PrismaInfo_1.default?.forEach(m => {
    m.fields.filter(f => !!f.info?.name).map(f => {
        names[f.name] = f.info.name + '';
    });
});
exports.SchemaFieldNames = names;
//# sourceMappingURL=Schema.js.map