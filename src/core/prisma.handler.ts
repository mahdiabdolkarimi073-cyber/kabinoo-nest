import { Prisma } from '@prisma/client';
import RequestHandler from './request.handler';
import { All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { makeEnum, Throw } from '../utils/built-in';
import PrismaSchema from '../../prisma/PrismaInfo';
import PrismaSchemaGenerated, { handlePrismaModuleDocumentation } from '../../prisma/PrismaInfo';
import { merge } from 'lodash';
import { generateModulePostJson } from '../utils/request';

type CreateType = any;
type ModelIncludeType = boolean | { include: { [k: string]: ModelIncludeType } }

export default class PrismaFullHandler extends RequestHandler {
    getModel(): (typeof prisma)[Prisma.TypeMap['meta']['modelProps']] {
        throw (`getModel of ${this.constructor.name} not implemented`);
    }

    getName(): string {
        throw (`getModel of ${this.constructor.name} not implemented`);
    }

    waitForCallableProps() {
        return this.isFullAccess();
    }

    async GET(id = this.getTargetId()) {
        if (id) {
            const find = await this.getPrismaModel()?.findUnique(
                await this.GET_findFirst(id),
            );
            if (!find) {
                throw {
                    message: this.getName() + ' یافت نشد',
                    code: 404,
                };
            }
            return await this.filter(find);
        } else if (new URL(this.request.originalUrl).searchParams.has('id')) {
            throw {
                message: `نشانه ${this.getName()} نامعتبر!`,
                code: 400,
            };
        } else {
            let o = await this.GET_findFirst(0);

            delete o.where[this.getTargetKey()];

            const pagination = this.get('_pagination') === 'true' || this.enablePagination();
            let total = 0;

            if (pagination) {
                const take = +this.get('_take') || 10;
                const skip = +this.get('_skip') || 0;
                if (take > 30) throw ('بازه دریافت بیش از حد میباشد!');
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
            const result = (await Promise.all((
                all?.map?.(async (o: CreateType) => await this.filter(o))
            ))).filter(Boolean);
            const final = this.get('_single') === 'true' ? result[0] || Throw({
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

    getPrismaFields(): typeof PrismaSchema[0]['fields'] {
        return this.getPrismaModelInfo()?.fields ?? [];
    }

    getPrismaModelInfo() {
        // @ts-ignore
        const modelName = this.getPrismaModel().name;
        return PrismaSchema.find(m => m.name === modelName);
    }

    enableFullyInclude() {
        const id = this.getTargetId();
        return !!id && this.isFullAccess();
    }

    async GET_findFirst(id: any): Promise<any> {
        const include = await this.buildIncludeFields();
        const defaultValue = {
            where: {
                [this.getTargetKey()]: id,
            },
            include,
        };

        if (this.enableQueryFilter()) {
            const queryFilter = await this.queryFilter();
            return merge({}, defaultValue, queryFilter);
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

    getTargetId(genFrom?: Record<string, any>): string | number | typeof genFrom | undefined {
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
        } else {
            const uniqIndex = this.getUniqueIndex();
            if (!uniqIndex) return undefined;

            const R = Object.fromEntries(
                uniqIndex.fields.map(f => ([
                    f,
                    genFrom[f],
                ])).filter(o => !!o[1]),
            );
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
        // @ts-ignore
        const modelName = this.getPrismaModel().name;
        const fields = PrismaSchema.find(m => m.name === modelName)?.fields ?? [];
        const params = new URL(this.request.originalUrl).searchParams;
        let where: any = {};
        let include: any = {};
        let orFields = (params.get('_or') + '').split(',').filter(Boolean);

        if (this.request.method !== 'GET') return {};

        fields.forEach(field => {
            let { name } = field;
            if (field.kind === 'object') {
                name = field.relationFromFields?.[0] + '';
            }
            let value = this.get(name);
            if (!value || where[name]) return;

            if (!field.isRequired && value === '_null') {
                value = null;
            }

            if (field.type.includes('Int') || field.type.includes('Float')) {
                where[name] = +value;
            } else if (field.type === 'Boolean') {
                where[name] = value === 'true';
            } else if (field.type.includes('tring') && params.has('_contains')) {
                where[name] = {
                    contains: value,
                    mode: 'insensitive',
                };
            } else if (orFields.includes(name)) {
                const all = params.getAll(name);

                where.OR = [
                    ...where.OR || [],
                    ...all?.map?.(v => ({
                        [name]: v,
                    })) || [],
                ];
            } else {
                where[name] = value;
            }

            if (this.enableQueryInclude() && field.kind === 'object') {
                include[field.name] = true;
            }

        });


        const customInclude = this.get('_include') as string;
        if (customInclude && this.enableQueryInclude()) {
            const list = customInclude.split(',');
            list.forEach(item => {
                if (item.includes('.')) {
                    let customPathInclude: any = true;
                    const paths = item.split('.').reverse();
                    let actualI = 0;
                    for (let i = 0; i < paths.length + paths.length - 1; i++) {
                        let path = i % 2 === 0 ? paths[actualI] : 'include';
                        if (path !== 'include') actualI++;
                        customPathInclude = {
                            [path]: customPathInclude,
                        };
                    }
                    include = merge(include, customPathInclude);
                } else {
                    let findField = fields.find(f => f.name === item);
                    if (findField?.kind !== 'object') return;
                    const ownFilter = this.get(item) as string;
                    if (ownFilter) {
                        const ownFields = PrismaSchema.find(m => m.name === findField?.type)?.fields ?? [];
                        let finalFields: any = {};
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
                        } else {
                            include[item] = true;
                        }
                    } else {
                        include[item] = this.handleModelInclude(findField?.type);
                    }
                }
            });
        }

        let dotWhere: any = {};
        for (let [key, value] of Object.entries(this.params)) {
            if (key.includes('.')) {
                let pre: any = value;
                for (let _k of key.split('.').reverse()) {
                    if (_k === '[]') {
                        let org = { ...pre };
                        pre = [];
                        for (let item of value.split(',')) {
                            pre.push(JSON.parse(
                                JSON.stringify(org).replace(value, item),
                            ));
                        }
                    } else {
                        pre = {
                            [_k]: pre,
                        };
                    }
                }
                dotWhere = merge(dotWhere, pre);
            }
        }
        if (Object.keys(dotWhere).length) {
            where = merge(where, dotWhere);
        }

        const countFields = ((this.get('_count') || this.get('count')) + '').split(',');
        if (countFields?.length) {
            for (const name of countFields) {
                const field = fields.find(o => o.name === name);
                if (!field || field.kind !== 'object') continue;

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
                OR: Object.entries(where).map(([key,value]) => ({
                    [key]: value
                }))
            }
        }

        return {
            where,
            include,
        };
    }

    handleModelInclude(modelName: string, _level = 0): ModelIncludeType {
        const currentModel = PrismaSchema.find(m => m.name === modelName);
        if (!currentModel || _level > 2) return true;

        const info = handlePrismaModuleDocumentation(currentModel?.documentation ?? '');
        const include = ((info?.include || []) as unknown as string[]);
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
            .filter(([key, v]) =>
                typeof v === 'object' || fields.find(f => f.name === key && (f.isUnique || f.isId || f.relationName)),
            ),
        );
    }

    /**
     *
     * @constructor
     */
    async DELETE(): Promise<any> {
        const id = this.getTargetId();
        if (id === 'all') {
            //TODO: HANDLE THIS
            await this.getPrismaModel()?.deleteMany();
            return this.msg(`تمام ${this.getName()} ها پاک شده اند`);
        }

        try {
            const where = await this.getWhereCondition();
            await this.getPrismaModel()?.delete({
                where,
            });
        } catch (e) {
            // @ts-ignore
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

    filter(obj: any): any {
        if (obj._count) {
            const count = obj._count;
            delete obj._count;
            obj = {
                ...Object.fromEntries(Object.entries(count).map(([key, value]) => [key + '_count', value])),
                ...obj,
            };
        }
        const keys: any = this.getOutputKeys();
        if (!keys.length) {
            return obj;
        } else {
            // @ts-ignore
            return Object.fromEntries(
                Object.entries(obj).filter(([key]) => keys.includes(key)),
            );
        }
    }

    getOutputKeys(): Array<keyof CreateType> {
        return [];
    }

    async create(body: any): Promise<any> {
        if (!this.canCreate()) this.methodDeny();
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
        if (!this.enableRelationHandle()) return;
        const info = this.getPrismaModelInfo();
        const mode = makeEnum(this.params['relation'] || this.params['array'] || 'SET', 'SET', 'APPEND');
        for (let field of info.fields) {
            if (field.kind !== 'object' || !field.isList) continue;

            let relationFieldsData: any[] = this.json[field.name];
            if (!relationFieldsData || !Array.isArray(relationFieldsData)) continue;

            const relationInfo = PrismaSchema.find(o => o.name === field.type);

            const currentModelRelation = relationInfo.fields.find(o => o.type === this.getPrismaModelName());
            if (!currentModelRelation) continue;
            const currentFieldName = currentModelRelation.relationFromFields[0];
            if (!currentFieldName) continue;
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
            const isExists = (item: any, arr: any[]) => arr.find(o => {
                if (!isIdMode) {
                    for (let uniqueIndex of relationInfo.uniqueIndexes) {
                        for (let _f of uniqueIndex.fields) {
                            if (item[_f] !== o[_f]) return undefined;
                        }
                    }
                } else {
                    if (!idField) return o;
                    if (item[idField] !== o[idField]) return undefined;
                }
                return o;
            });
            const getWhere = (record: any) => {
                const uniq = relationInfo.uniqueIndexes[0] || relationInfo.primaryKey || idField;
                if (!uniq) return undefined;
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
                    if (!where) continue;
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
                    if (exists) continue;
                    const where = getWhere(record);
                    if (!where) continue;
                    await m.delete({
                        where,
                    });
                }

            const pre = (this.params['_include'] || '').split(',');
            pre.push(field.name);
            this.params['_include'] = pre.join(',');
        }
    }

    async edit(model: any): Promise<any> {
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

    async getRequiredFields(operation: 'create' | 'edit'): Promise<any> {
        const name = this.getPrismaModelName();
        const json = generateModulePostJson(name as any, operation === 'create');
        return this.enableDefaultFieldsGenerator() ? this.$_PARAMS(json) : undefined;
    }

    enableDefaultFieldsGenerator() {
        return this.isFullAccess();
    }

    async OPTIONS(): Promise<any> {
        const user = await this.getUser();

        if (/*user?.role === 'DEFAULT' FIXME*/ false) {
            this.methodDeny();
        }

        // @ts-ignore
        const model = PrismaSchema.find(m => m.name === this.getPrismaModel()?.$name);

        return model?.fields.filter(f => !f.relationName && f.isRequired && !f.isId).filter(f => !!f.info?.name).map(f => {
            const values = Prisma.dmmf.datamodel.enums.find(e => e.name === f.type)?.values?.map(v => v.name);
            // @ts-ignore
            const labels = Prisma.dmmf.datamodel.enums.find(e => e.name === f.type)?.values?.map(v => handlePrismaModuleDocumentation(v?.documentation + '')?.name).filter(n => !!n);

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

    async beforeCreate<T extends any>(fields: T) {
        return fields;
    }

    async beforeEdit<T extends any>(fields: T) {
        return fields;
    }

    async before<T extends any>(action: 'create' | 'edit', payload: T) {
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
        const obj: CreateType = await this.getPrismaModel()?.findUnique({
            where: whereCond,
        });
        if (obj) {
            return (await this?.edit?.(obj)) ?? this.msg('باموفقیت ویرایش شد');
        } else {
            throw {
                code: 400,
                message: `${this.getName()} جهت ویرایش یافت نشد!`,
            };
        }
    }

    async handle(funcName: string): Promise<void> {
        this.debug("handle model");
        const mode = makeEnum(this.params['mode'] || 'DEFAULT', 'DEFAULT', 'MANY', 'MANY_SET');
        if (mode.startsWith('MANY') && (this.request.method === 'PATCH')) {
            const json = { ...this.json };

            const dataKey = 'data';
            let data = json[dataKey];
            if (!data) this.need('data', 'آرایه اطلاعات وارد نشده است');
            if (!Array.isArray(data)) this.need('data', 'اطلاعات باید آرایه باشد');

            let merge: any = {};
            for (const [key, value] of Object.entries(json)) {
                if (key === dataKey) continue;
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
            const records = await this.getPrismaModel().findMany(mode === 'MANY_SET' ? { where: merge } : undefined) as any[];
            const isIdMode = relationInfo.uniqueFields.length === 0;
            const idField = relationInfo.fields.find(o => o.isId || o.isUnique)?.name;

            const isExists = (item: any, arr: any[]) => arr.find(o => {
                if (!isIdMode) {
                    for (let uniqueIndex of relationInfo.uniqueIndexes) {
                        for (let _f of uniqueIndex.fields) {
                            if (item[_f] !== o[_f]) return undefined;
                        }
                    }

                } else {
                    if (!idField) return o;
                    if (item[idField] !== o[idField]) return undefined;
                }
                return o;
            });
            const getWhere = (record: any) => {
                const uniq = relationInfo.uniqueIndexes[0] || relationInfo.primaryKey;
                if (!uniq) return undefined;
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

                let orgWhere: any = this.getWhereCondition;
                if (method !== 'POST') {
                    const where = getWhere(this.json);
                    this.getWhereCondition = async () => where;
                }
                const s = super.handle;
                await this.handleExecute(async function() {
                    await s.bind(this)(method);
                });
                this.getWhereCondition = orgWhere;
            }


            if (mode === 'MANY_SET')
                for (const record of records) {
                    const exists = isExists(record, finalData);
                    if (exists) continue;
                    const where = getWhere(record);
                    if (!where) continue;
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
            } else await this.response(await this.getPrismaModel().findMany());
        } else {
            return super.handle(funcName);
        }
    }

    private getPrismaModel() {
        return this.getModel() as any;
    }

    private getPrismaModelName() {
        //@ts-ignore
        return this.getPrismaModel().name + '';
    }

    @All(':id')
    private async single(@Req() req: Request, @Res() res: Response) {
        this.request = req;
        this.res = res;
        return this.incoming(req, res);
    }

    private async buildIncludeFields(): Promise<any> {
        if (!this.enableFullyInclude()) return undefined;


        const include: any = {};
        const fields = this.getPrismaFields();
        const excludes = handlePrismaModuleDocumentation(this.getPrismaModelInfo()?.documentation)?.exclude || [];


        fields.filter(f => f.kind === 'object').forEach(f => {
            if (excludes.includes(f.name)) return;
            const model = PrismaSchemaGenerated?.find(m => m.name === f.type);
            const modelDocs = model?.documentation;
            const docs = handlePrismaModuleDocumentation(f.documentation || '');
            if (docs?.count) {
                include._count = {
                    select: {
                        ...include?._count?.select || {},
                        [f.name]: true,
                    },
                };
            } else {
                include[f.name] = !modelDocs?.includes('@private') ? this.handleModelInclude(f.type) : false;
            }
        });

        return include;
    }
}
