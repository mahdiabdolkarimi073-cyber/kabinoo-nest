import * as process from 'node:process';

declare global {
    interface Date {
        toCustomString(): string;
    }

    interface Number {
        toPersian: () => string;
    }
}

Number.prototype.toPersian = function() {
    const num = +this;
    if (num < 0 || num > 100) return num + ''; // number out of range

    const persianNumbers = [
        '', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه',
        'ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده',
        'هفده', 'هجده', 'نوزده',
    ].map(o => o === 'سه' ? o.substring(0, o.length - 1) + 'وم' : o + 'م');

    const tens = [
        '', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود',
    ];

    if (num === 100) return 'صد';

    if (num < 20) {
        return persianNumbers[num];
    }

    const tenPart = Math.floor(num / 10);
    const unitPart = num % 10;

    return tens[tenPart] + (unitPart ? ' و ' + persianNumbers[unitPart] : '');
};

export function registerGlobal() {

}

export const VARS = {
    isDev: process.env['DEV'] === 'true' || process.env['DEBUG'] === "true",
    BACKEND: process.env['BACKEND'] || 'http://localhost:3080',
    get FRONTEND() {
        return process.env['FRONTEND'] || (this.isDev ? 'http://localhost:3000' : 'https://footpass.ir');
    },
    PAYMENT_MID: process.env['PAYMENT_MID']
} as const;