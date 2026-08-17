"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const request_handler_1 = require("./request.handler");
const common_1 = require("@nestjs/common");
const built_in_1 = require("../utils/built-in");
const PrismaInfo_1 = require("../../prisma/PrismaInfo");
const PrismaInfo_2 = require("../../prisma/PrismaInfo");
const lodash_1 = require("lodash");
const request_1 = require("../utils/request");
class PrismaFullHandler extends request_handler_1.default {
    getModel() {
        throw (`getModel of ${this.constructor.name} not implemented`);
    }
    getName() {
        throw (`getModel of ${this.constructor.name} not implemented`);
    }
    waitForCallableProps() {
        return this.isFullAccess();
    }
    async GET(id = this.getTargetId()) {
        if (id) {
            const find = await this.getPrismaModel()?.findUnique(await this.GET_findFirst(id));
            if (!find) {
                throw {
                    message: this.getName() + ' یافت نشد',
                    code: 404,
                };
            }
            return await this.filter(find);
        }
        else if (new URL(this.request.originalUrl).searchParams.has('id')) {
            throw {
                message: `نشانه ${this.getName()} نامعتبر!`,
                code: 400,
            };
        }
        else {
            let o = await this.GET_findFirst(0);
            delete o.where[this.getTargetKey()];
            const pagination = this.get('_pagination') === 'true' || this.enablePagination();
            let total = 0;
            if (pagination) {
                const take = +this.get('_take') || 10;
                const skip = +this.get('_skip') || 0;
                if (take > 30)
                    throw ('بازه دریافت بیش از حد میباشد!');
                total = await this.getPrismaModel()?.count({
                    where: o.where,
                });
                o.skip = skip;
                o.take = take;
                if (o?.select && o?.include) {
                    delete o.include;
                }
            }
            const all = await this.getPrismaModel()?.findMany(o);
            const result = (await Promise.all((all?.map?.(async (o) => await this.filter(o))))).filter(Boolean);
            const final = this.get('_single') === 'true' ? result[0] || (0, built_in_1.Throw)({
                code: 404,
                message: `${this.getName()} یافت نشد`,
            }) : result;
            return pagination ? {
                additional: {
                    total,
                    data: final,
                },
            } : final;
        }
    }
    getPrismaFields() {
        return this.getPrismaModelInfo()?.fields ?? [];
    }
    getPrismaModelInfo() {
        const modelName = this.getPrismaModel().name;
        return PrismaInfo_1.default.find(m => m.name === modelName);
    }
    enableFullyInclude() {
        const id = this.getTargetId();
        return !!id && this.isFullAccess();
    }
    async GET_findFirst(id) {
        const include = await this.buildIncludeFields();
        const defaultValue = {
            where: {
                [this.getTargetKey()]: id,
            },
            include,
        };
        if (this.enableQueryFilter()) {
            const queryFilter = await this.queryFilter();
            return (0, lodash_1.merge)({}, defaultValue, queryFilter);
        }
        return defaultValue;
    }
    getIdField() {
        return this.getPrismaFields().find(o => o.isId);
    }
    getTargetKey() {
        const idField = this.getIdField();
        return idField?.name ?? this.getUniqueIndex()?.name ?? 'id';
    }
    getUniqueIndex() {
        return this.getPrismaModelInfo().uniqueIndexes[0] || this.getPrismaModelInfo().primaryKey;
    }
    getTargetId(genFrom) {
        genFrom ||= {
            ...this.params || {},
            ...this.json || {},
        };
        const idField = this.getIdField();
        if (idField) {
            const id = genFrom[this.getTargetKey()] || undefined;
            if (idField?.type === 'String' && !!id) {
                return id + '';
            }
            return typeof id === 'undefined' ? undefined : isNaN(+id) ? id : +id;
        }
        else {
            const uniqIndex = this.getUniqueIndex();
            if (!uniqIndex)
                return undefined;
            const R = Object.fromEntries(uniqIndex.fields.map(f => ([
                f,
                genFrom[f],
            ])).filter(o => !!o[1]));
            return Object.keys(R).length !== uniqIndex.fields.length ? undefined : R;
        }
    }
    enableQueryInclude() {
        return this.enableQueryFilter();
    }
    enableQueryFilter() {
        return this.isFullAccess();
    }
    async queryFilter() {
        const modelName = this.getPrismaModel().name;
        const fields = PrismaInfo_1.default.find(m => m.name === modelName)?.fields ?? [];
        const params = new URL(this.request.originalUrl).searchParams;
        let where = {};
        let include = {};
        let orFields = (params.get('_or') + '').split(',').filter(Boolean);
        if (this.request.method !== 'GET')
            return {};
        fields.forEach(field => {
            let { name } = field;
            if (field.kind === 'object') {
                name = field.relationFromFields?.[0] + '';
            }
            let value = this.get(name);
            if (!value || where[name])
                return;
            if (!field.isRequired && value === '_null') {
                value = null;
            }
            if (field.type.includes('Int') || field.type.includes('Float')) {
                where[name] = +value;
            }
            else if (field.type === 'Boolean') {
                where[name] = value === 'true';
            }
            else if (field.type.includes('tring') && params.has('_contains')) {
                where[name] = {
                    contains: value,
                    mode: 'insensitive',
                };
            }
            else if (orFields.includes(name)) {
                const all = params.getAll(name);
                where.OR = [
                    ...where.OR || [],
                    ...all?.map?.(v => ({
                        [name]: v,
                    })) || [],
                ];
            }
            else {
                where[name] = value;
            }
            if (this.enableQueryInclude() && field.kind === 'object') {
                include[field.name] = true;
            }
        });
        const customInclude = this.get('_include');
        if (customInclude && this.enableQueryInclude()) {
            const list = customInclude.split(',');
            list.forEach(item => {
                if (item.includes('.')) {
                    let customPathInclude = true;
                    const paths = item.split('.').reverse();
                    let actualI = 0;
                    for (let i = 0; i < paths.length + paths.length - 1; i++) {
                        let path = i % 2 === 0 ? paths[actualI] : 'include';
                        if (path !== 'include')
                            actualI++;
                        customPathInclude = {
                            [path]: customPathInclude,
                        };
                    }
                    include = (0, lodash_1.merge)(include, customPathInclude);
                }
                else {
                    let findField = fields.find(f => f.name === item);
                    if (findField?.kind !== 'object')
                        return;
                    const ownFilter = this.get(item);
                    if (ownFilter) {
                        const ownFields = PrismaInfo_1.default.find(m => m.name === findField?.type)?.fields ?? [];
                        let finalFields = {};
                        let filters = ownFilter.split(',');
                        filters.forEach(filter => {
                            if (ownFields.find(f => f.name === filter)) {
                                finalFields[filter] = true;
                            }
                        });
                        if (Object.keys(finalFields).length) {
                            include[item] = {
                                select: finalFields,
                            };
                        }
                        else {
                            include[item] = true;
                        }
                    }
                    else {
                        include[item] = this.handleModelInclude(findField?.type);
                    }
                }
            });
        }
        let dotWhere = {};
        for (let [key, value] of Object.entries(this.params)) {
            if (key.includes('.')) {
                let pre = value;
                for (let _k of key.split('.').reverse()) {
                    if (_k === '[]') {
                        let org = { ...pre };
                        pre = [];
                        for (let item of value.split(',')) {
                            pre.push(JSON.parse(JSON.stringify(org).replace(value, item)));
                        }
                    }
                    else {
                        pre = {
                            [_k]: pre,
                        };
                    }
                }
                dotWhere = (0, lodash_1.merge)(dotWhere, pre);
            }
        }
        if (Object.keys(dotWhere).length) {
            where = (0, lodash_1.merge)(where, dotWhere);
        }
        const countFields = ((this.get('_count') || this.get('count')) + '').split(',');
        if (countFields?.length) {
            for (const name of countFields) {
                const field = fields.find(o => o.name === name);
                if (!field || field.kind !== 'object')
                    continue;
                include = {
                    ...include || {},
                    _count: {
                        select: {
                            ...include?._count?.select || {},
                            [name]: true,
                        },
                    },
                };
            }
        }
        const condition = params.get('condition_type');
        if (condition === "or") {
            where = {
                OR: Object.entries(where).map(([key, value]) => ({
                    [key]: value
                }))
            };
        }
        return {
            where,
            include,
        };
    }
    handleModelInclude(modelName, _level = 0) {
        const currentModel = PrismaInfo_1.default.find(m => m.name === modelName);
        if (!currentModel || _level > 2)
            return true;
        const info = (0, PrismaInfo_2.handlePrismaModuleDocumentation)(currentModel?.documentation ?? '');
        const include = (info?.include || []);
        return info?.include ? ({
            include: Object.fromEntries(include?.map?.(s => {
                const model = currentModel.fields.find(k => k.name === s);
                return ([s, model ? this.handleModelInclude(model.type, _level + 1) : true]);
            })),
        }) : true;
    }
    enablePagination() {
        return false;
    }
    isFullAccess() {
        const parentName = Object.getPrototypeOf(Object.getPrototypeOf(this.constructor)).name;
        return parentName === PrismaFullHandler.name;
    }
    async PATCH() {
        if (this.isFullAccess() && this.enableQueryFilter()) {
            return this.getPrismaModel().findMany(this.json || {});
        }
        this.methodDeny();
    }
    async getWhereCondition() {
        const id = this.getTargetId();
        let where = (await this.GET_findFirst(id))?.where ?? { where: { [this.getTargetKey()]: id } };
        if (!this.getIdField()) {
            where[this.getTargetKey()] = id;
        }
        const fields = this.getPrismaFields();
        return Object.fromEntries(Object.entries(where)
            .filter(([key, v]) => typeof v === 'object' || fields.find(f => f.name === key && (f.isUnique || f.isId || f.relationName))));
    }
    async DELETE() {
        const id = this.getTargetId();
        if (id === 'all') {
            await this.getPrismaModel()?.deleteMany();
            return this.msg(`تمام ${this.getName()} ها پاک شده اند`);
        }
        try {
            const where = await this.getWhereCondition();
            await this.getPrismaModel()?.delete({
                where,
            });
        }
        catch (e) {
            if (e?.message?.includes('not exist')) {
                throw ({
                    code: 404,
                    message: this.getName() + ' یافت نشد',
                });
            }
            throw (e);
        }
        return this.msg(this.getName() + ' باموفقیت حذف شد');
    }
    async POST() {
        return (await this?.create?.(this.json)) ?? this.msg('باموفقیت ساخته شد');
    }
    filter(obj) {
        if (obj._count) {
            const count = obj._count;
            delete obj._count;
            obj = {
                ...Object.fromEntries(Object.entries(count).map(([key, value]) => [key + '_count', value])),
                ...obj,
            };
        }
        const keys = this.getOutputKeys();
        if (!keys.length) {
            return obj;
        }
        else {
            return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));
        }
    }
    getOutputKeys() {
        return [];
    }
    async create(body) {
        if (!this.canCreate())
            this.methodDeny();
        let fields = await this.getRequiredFields('create');
        if (!fields) {
            throw {
                message: `امکان ساخت ${this.getName()} امکان پذیر نیست!`,
                code: 405,
            };
        }
        fields = await this.before('create', fields) || fields;
        const idField = this.getIdField();
        let whereCond = !!idField ? await this.getWhereCondition() : {};
        const o = await this.getPrismaModel()?.create({
            data: {
                ...fields,
                ...whereCond,
            },
        });
        const id = this.getTargetId(o);
        this.json[this.getTargetKey()] = id;
        await this.handleRelation(id);
        return this.GET();
    }
    enableRelationHandle() {
        return this.isFullAccess();
    }
    async handleRelation(id = this.getTargetId()) {
        if (!this.enableRelationHandle())
            return;
        const info = this.getPrismaModelInfo();
        const mode = (0, built_in_1.makeEnum)(this.params['relation'] || this.params['array'] || 'SET', 'SET', 'APPEND');
        for (let field of info.fields) {
            if (field.kind !== 'object' || !field.isList)
                continue;
            let relationFieldsData = this.json[field.name];
            if (!relationFieldsData || !Array.isArray(relationFieldsData))
                continue;
            const relationInfo = PrismaInfo_1.default.find(o => o.name === field.type);
            const currentModelRelation = relationInfo.fields.find(o => o.type === this.getPrismaModelName());
            if (!currentModelRelation)
                continue;
            const currentFieldName = currentModelRelation.relationFromFields[0];
            if (!currentFieldName)
                continue;
            const modelKey = relationInfo.name.slice(0, 1).toLowerCase() + relationInfo.name.slice(1);
            const m = prisma[modelKey];
            const records = await m.findMany({
                where: {
                    [currentFieldName]: id,
                },
            });
            const requiredFields = relationInfo.fields.filter(o => o.kind === 'scalar' && o.isRequired && o.name !== currentFieldName && !o.default);
            relationFieldsData = relationFieldsData.map(o => {
                if (requiredFields.length === 1 && typeof o === 'string') {
                    o = {
                        [requiredFields[0].name]: o,
                    };
                }
                return {
                    ...o,
                    [currentFieldName]: id,
                };
            });
            const isIdMode = relationInfo.uniqueFields.length === 0;
            const idField = relationInfo.fields.find(o => o.isId || o.isUnique)?.name;
            const isExists = (item, arr) => arr.find(o => {
                if (!isIdMode) {
                    for (let uniqueIndex of relationInfo.uniqueIndexes) {
                        for (let _f of uniqueIndex.fields) {
                            if (item[_f] !== o[_f])
                                return undefined;
                        }
                    }
                }
                else {
                    if (!idField)
                        return o;
                    if (item[idField] !== o[idField])
                        return undefined;
                }
                return o;
            });
            const getWhere = (record) => {
                const uniq = relationInfo.uniqueIndexes[0] || relationInfo.primaryKey || idField;
                if (!uniq)
                    return undefined;
                const fKey = typeof uniq === 'string' ? uniq : uniq.name;
                const w = typeof uniq === 'string' ? record[uniq] : Object.fromEntries(uniq.fields.map(o => ([
                    o,
                    record[o],
                ])));
                return {
                    [fKey]: w,
                };
            };
            for (let item of relationFieldsData) {
                const exists = isExists(item, records);
                if (exists) {
                    const where = getWhere(item);
                    if (!where)
                        continue;
                    await m.update({
                        where,
                        data: item,
                    });
                    continue;
                }
                for (let reqField of requiredFields) {
                    const v = item[reqField.name];
                    if (v === null || v === undefined) {
                        this.need(`${field.name}.${reqField.name}`, `${reqField?.info?.name || reqField.name} وارد نشده است`);
                    }
                }
                await m.create({
                    data: item,
                });
            }
            if (mode === 'SET')
                for (let record of records) {
                    const exists = isExists(record, relationFieldsData);
                    if (exists)
                        continue;
                    const where = getWhere(record);
                    if (!where)
                        continue;
                    await m.delete({
                        where,
                    });
                }
            const pre = (this.params['_include'] || '').split(',');
            pre.push(field.name);
            this.params['_include'] = pre.join(',');
        }
    }
    async edit(model) {
        let fields = await this.getRequiredFields('edit');
        if (!fields) {
            throw {
                message: `امکان ویرایش ${this.getName()} امکان پذیر نیست! `,
                code: 405,
            };
        }
        if (!Object.keys(fields).length) {
            throw ('محتوایی ارسال نشد');
        }
        fields = await this.before('edit', fields) || fields;
        const whereCond = await this.getWhereCondition();
        const o = await this.getPrismaModel()?.update({
            where: whereCond,
            data: fields,
        });
        const id = this.getTargetId(o);
        this.json[this.getTargetKey()] = id;
        await this.handleRelation(id);
        return this.GET();
    }
    async getRequiredFields(operation) {
        const name = this.getPrismaModelName();
        const json = (0, request_1.generateModulePostJson)(name, operation === 'create');
        return this.enableDefaultFieldsGenerator() ? this.$_PARAMS(json) : undefined;
    }
    enableDefaultFieldsGenerator() {
        return this.isFullAccess();
    }
    async OPTIONS() {
        const user = await this.getUser();
        if (false) {
            this.methodDeny();
        }
        const model = PrismaInfo_1.default.find(m => m.name === this.getPrismaModel()?.$name);
        return model?.fields.filter(f => !f.relationName && f.isRequired && !f.isId).filter(f => !!f.info?.name).map(f => {
            const values = client_1.Prisma.dmmf.datamodel.enums.find(e => e.name === f.type)?.values?.map(v => v.name);
            const labels = client_1.Prisma.dmmf.datamodel.enums.find(e => e.name === f.type)?.values?.map(v => (0, PrismaInfo_2.handlePrismaModuleDocumentation)(v?.documentation + '')?.name).filter(n => !!n);
            return ({
                key: f.name,
                name: f.info?.name,
                defaultValue: f.default,
                type: !values?.length ? 'INPUT' : 'SELECT',
                ...(values?.length && { values }),
                ...(labels?.length && { labels }),
            });
        });
    }
    canEdit() {
        return true;
    }
    canCreate() {
        return true;
    }
    async beforeCreate(fields) {
        return fields;
    }
    async beforeEdit(fields) {
        return fields;
    }
    async before(action, payload) {
        if (action === 'create') {
            if (!this.canCreate()) {
                throw ({
                    code: 403,
                    message: `نمیتوان ${this.getName()} ساخت.`,
                });
            }
            payload = await this.beforeCreate(payload) || payload;
        }
        if (action === 'edit') {
            if (!this.canEdit()) {
                throw ({
                    code: 403,
                    message: `نمیتوان ${this.getName()} را ویرایش کرد.`,
                });
            }
            payload = await this.beforeEdit(payload) || payload;
        }
        return payload;
    }
    async PUT() {
        let whereCond = { ...(await this.getWhereCondition()) };
        const obj = await this.getPrismaModel()?.findUnique({
            where: whereCond,
        });
        if (obj) {
            return (await this?.edit?.(obj)) ?? this.msg('باموفقیت ویرایش شد');
        }
        else {
            throw {
                code: 400,
                message: `${this.getName()} جهت ویرایش یافت نشد!`,
            };
        }
    }
    async handle(funcName) {
        this.debug("handle model");
        const mode = (0, built_in_1.makeEnum)(this.params['mode'] || 'DEFAULT', 'DEFAULT', 'MANY', 'MANY_SET');
        if (mode.startsWith('MANY') && (this.request.method === 'PATCH')) {
            const json = { ...this.json };
            const dataKey = 'data';
            let data = json[dataKey];
            if (!data)
                this.need('data', 'آرایه اطلاعات وارد نشده است');
            if (!Array.isArray(data))
                this.need('data', 'اطلاعات باید آرایه باشد');
            let merge = {};
            for (const [key, value] of Object.entries(json)) {
                if (key === dataKey)
                    continue;
                merge[key] = value;
            }
            this.disableResponseEnd = true;
            let R = [];
            const origin = this.response;
            this.response = async (obj, ok) => {
                const o = await this.mergeResponse(obj, ok);
                R.push(o?.data ?? o);
            };
            const relationInfo = this.getPrismaModelInfo();
            const records = await this.getPrismaModel().findMany(mode === 'MANY_SET' ? { where: merge } : undefined);
            const isIdMode = relationInfo.uniqueFields.length === 0;
            const idField = relationInfo.fields.find(o => o.isId || o.isUnique)?.name;
            const isExists = (item, arr) => arr.find(o => {
                if (!isIdMode) {
                    for (let uniqueIndex of relationInfo.uniqueIndexes) {
                        for (let _f of uniqueIndex.fields) {
                            if (item[_f] !== o[_f])
                                return undefined;
                        }
                    }
                }
                else {
                    if (!idField)
                        return o;
                    if (item[idField] !== o[idField])
                        return undefined;
                }
                return o;
            });
            const getWhere = (record) => {
                const uniq = relationInfo.uniqueIndexes[0] || relationInfo.primaryKey;
                if (!uniq)
                    return undefined;
                const fKey = uniq.name;
                const w = Object.fromEntries(uniq.fields.map(o => ([
                    o,
                    record[o],
                ])));
                return {
                    [fKey]: w,
                };
            };
            if (typeof data?.[0] === 'string') {
                const keys = Object.keys(merge);
                const remaining = relationInfo.fields.filter(o => o.isRequired && !o.isId && !o.isUnique && !keys.includes(o.name));
                if (remaining?.length === 1) {
                    const fKey = remaining[0].name;
                    data = data.map(o => ({
                        [fKey]: o,
                    }));
                }
            }
            const finalData = data.map(o => ({
                ...merge,
                ...o,
            }));
            for (const item of finalData) {
                this.json = item;
                const method = isExists(this.json, records) ? 'PUT' : 'POST';
                this.request.method = method;
                let orgWhere = this.getWhereCondition;
                if (method !== 'POST') {
                    const where = getWhere(this.json);
                    this.getWhereCondition = async () => where;
                }
                const s = super.handle;
                await this.handleExecute(async function () {
                    await s.bind(this)(method);
                });
                this.getWhereCondition = orgWhere;
            }
            if (mode === 'MANY_SET')
                for (const record of records) {
                    const exists = isExists(record, finalData);
                    if (exists)
                        continue;
                    const where = getWhere(record);
                    if (!where)
                        continue;
                    await this.getPrismaModel().delete({
                        where,
                    });
                }
            this.disableResponseEnd = false;
            this.response = origin;
            if (R.find(p => !p.ok)) {
                const messages = R.map(o => o.message || '').filter(Boolean);
                return this.response({
                    additional: {
                        message: messages.join('\n'),
                    },
                    ...R,
                }, false);
            }
            else
                await this.response(await this.getPrismaModel().findMany());
        }
        else {
            return super.handle(funcName);
        }
    }
    getPrismaModel() {
        return this.getModel();
    }
    getPrismaModelName() {
        return this.getPrismaModel().name + '';
    }
    async single(req, res) {
        this.request = req;
        this.res = res;
        return this.incoming(req, res);
    }
    async buildIncludeFields() {
        if (!this.enableFullyInclude())
            return undefined;
        const include = {};
        const fields = this.getPrismaFields();
        const excludes = (0, PrismaInfo_2.handlePrismaModuleDocumentation)(this.getPrismaModelInfo()?.documentation)?.exclude || [];
        fields.filter(f => f.kind === 'object').forEach(f => {
            if (excludes.includes(f.name))
                return;
            const model = PrismaInfo_2.default?.find(m => m.name === f.type);
            const modelDocs = model?.documentation;
            const docs = (0, PrismaInfo_2.handlePrismaModuleDocumentation)(f.documentation || '');
            if (docs?.count) {
                include._count = {
                    select: {
                        ...include?._count?.select || {},
                        [f.name]: true,
                    },
                };
            }
            else {
                include[f.name] = !modelDocs?.includes('@private') ? this.handleModelInclude(f.type) : false;
            }
        });
        return include;
    }
}
exports.default = PrismaFullHandler;
__decorate([
    (0, common_1.All)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PrismaFullHandler.prototype, "single", null);
//# sourceMappingURL=prisma.handler.js.map