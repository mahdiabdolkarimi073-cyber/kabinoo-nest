export declare const hashPassword: (password: string, saltRounds?: number) => Promise<string>;
export declare const verifyPassword: (password: string, hashed: string) => Promise<boolean>;
export declare function pbkdf2Passes(inputPassword: string, hashedPassword: string): boolean;
