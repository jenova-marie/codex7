// decorators/addFunction.ts
export function addFunction(fn: Function, name?: string) {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
      const methodName = name || fn.name;
      constructor.prototype[methodName] = function (...args: any[]) {
        return fn(this, ...args);
      };
    };
  }

  // decorators/add-functions.ts
type Class<T = any> = new (...args: any[]) => T;

export function addFunctions(fns: Record<string, (self: any, ...args: any[]) => any>) {
  return function <T extends Class>(constructor: T) {
    for (const [name, fn] of Object.entries(fns)) {
      constructor.prototype[name] = function (...args: any[]) {
        return fn(this, ...args);
      };
    }
  };
}

  