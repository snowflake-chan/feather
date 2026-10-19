export declare function s(val: any): string;
export declare function maybeS(val: any): string | undefined;
export declare function n(val: any): number;
export declare function maybeN(val: any): number | undefined;
export declare function b(val: any): boolean;
export type AppEnv = 'development' | 'staging' | 'production' | 'preprod' | 'test';
export declare function validateAppEnv(appEnv?: string): AppEnv;
export declare function removeConfigUndefined<T extends {}>(props: T): T;
//# sourceMappingURL=config-check.d.ts.map