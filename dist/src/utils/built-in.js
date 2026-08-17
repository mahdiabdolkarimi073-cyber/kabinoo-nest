"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Throw = Throw;
exports.entries = entries;
exports.fromEntries = fromEntries;
exports.makeEnum = makeEnum;
function Throw(msg = 'Something missing') {
    if (typeof msg === 'string' && msg.split(' ').length === 1) {
        msg = `${msg} وارد نشده است`;
    }
    throw (msg);
}
function entries(object) {
    return Object.entries(object);
}
function fromEntries(entries) {
    return Object.fromEntries(entries);
}
function makeEnum(value, ...values) {
    for (const v of values) {
        if (value === v)
            return v;
    }
    throw ({
        message: `Invalid Type '${value}'`,
        additional: {
            expected: values,
        },
    });
}
//# sourceMappingURL=built-in.js.map