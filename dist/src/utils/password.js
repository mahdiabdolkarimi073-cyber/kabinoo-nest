"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.hashPassword = void 0;
exports.pbkdf2Passes = pbkdf2Passes;
const bcrypt_1 = require("bcrypt");
const crypto_1 = require("crypto");
const hashPassword = async (password, saltRounds = 10) => {
    if (!isNaN(+password)) {
        throw {
            code: 400,
            message: 'رمزعبور باید شامل حروف و عدد باشد',
        };
    }
    return await (0, bcrypt_1.hash)(password, saltRounds);
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hashed) => {
    if (!password || !hashed)
        return false;
    if (hashed.startsWith('pbkdf2')) {
        return pbkdf2Passes(password, hashed);
    }
    if (hashed.startsWith('$2y$')) {
        hashed = hashed.replace('$2y$', '$2b$');
    }
    return await (0, bcrypt_1.compare)(password, hashed);
};
exports.verifyPassword = verifyPassword;
function pbkdf2Passes(inputPassword, hashedPassword) {
    const [algorithm, iterations, salt, hash] = hashedPassword.split('$');
    const inputHash = crypto_1.default.pbkdf2Sync(inputPassword, salt, parseInt(iterations), 32, 'sha256');
    return hash === inputHash.toString('base64');
}
//# sourceMappingURL=password.js.map