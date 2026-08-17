"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbSecureProp = dbSecureProp;
exports.Callable = Callable;
function dbSecureProp(func) {
    func.secure = true;
    return func;
}
function Callable(func) {
    func.callable = true;
    return func;
}
//# sourceMappingURL=db-utils.js.map