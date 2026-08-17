import { getEnumInfo } from '../../prisma/PrismaInfo';

export function handlePrismaErrorAdditionalInfo(msg: string) {
    if (msg.includes('Expected')) {
        const lastLine = msg.split('\n').at(-1);
        const target = lastLine.split('Expected')[1].split(' ')[1].slice(0, -1);

        const _enum = getEnumInfo(target as any);


        return {
            expected: target,
            ..._enum && ({
                [target]: _enum,
            }),
        };
    }

    return {
        originMsg: msg,
    };
}