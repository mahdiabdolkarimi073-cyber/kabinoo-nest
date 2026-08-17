"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomNumber = generateRandomNumber;
exports.arabicToEnglishNumber = arabicToEnglishNumber;
exports.generateRandomString = generateRandomString;
function generateRandomNumber(length = 6, notZeroFirst = true) {
    if (length <= 0)
        return '';
    let result = '';
    const characters = '0123456789';
    if (notZeroFirst) {
        const firstDigit = Math.floor(Math.random() * 9) + 1;
        result += firstDigit;
    }
    const remainingLength = notZeroFirst ? length - 1 : length;
    for (let i = 0; i < remainingLength; i++) {
        const randomIndex = Math.floor(Math.random() * 10);
        result += randomIndex;
    }
    return result;
}
function arabicToEnglishNumber(str) {
    const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g], arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    for (let i = 0; i < 10; i++) {
        str = str.replaceAll(persianNumbers[i], i + '').replaceAll(arabicNumbers[i], i + '');
    }
    return str;
}
function generateRandomString(length = 10) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        randomString += charset.charAt(randomIndex);
    }
    return randomString;
}
//# sourceMappingURL=string.js.map