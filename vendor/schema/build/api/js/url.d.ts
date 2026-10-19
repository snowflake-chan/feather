export declare class URLSearchParams {
    constructor(args: any);
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    getAll(name: string): string[];
    forEach(callback: (this: URLSearchParams, value: string, key: string, url: URLSearchParams) => any): void;
    has(name: string): boolean;
    set(name: string, value: string): void;
    keys(): ArrayIterator<string>;
    values(): ArrayIterator<string>;
    entries(): ArrayIterator<string[]>;
    sort(): void;
    toString(): string;
    [Symbol.iterator](): ArrayIterator<string[]>;
}
export declare class URL {
    constructor(url: any, base?: any);
    get hash(): string;
    set hash(value: string);
    get host(): string;
    set host(value: string);
    get hostname(): any;
    set hostname(value: any);
    get port(): string;
    set port(value: string);
    get href(): string;
    set href(value: string);
    get origin(): string;
    get username(): string;
    set username(value: string);
    get password(): string;
    set password(value: string);
    get pathname(): string;
    set pathname(value: string);
    get protocol(): string;
    set protocol(value: string);
    get search(): string;
    set search(value: string);
    get searchParams(): URLSearchParams;
    toString(): string;
    toJSON(): string;
}
//# sourceMappingURL=url.d.ts.map