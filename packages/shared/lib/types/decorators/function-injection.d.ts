export declare function addFunction(fn: Function, name?: string): <T extends {
    new (...args: any[]): {};
}>(constructor: T) => void;
type Class<T = any> = new (...args: any[]) => T;
export declare function addFunctions(fns: Record<string, (self: any, ...args: any[]) => any>): <T extends Class>(constructor: T) => void;
export {};
