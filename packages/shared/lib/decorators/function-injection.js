// decorators/addFunction.ts
export function addFunction(fn, name) {
    return function (constructor) {
        const methodName = name || fn.name;
        constructor.prototype[methodName] = function (...args) {
            return fn(this, ...args);
        };
    };
}
export function addFunctions(fns) {
    return function (constructor) {
        for (const [name, fn] of Object.entries(fns)) {
            constructor.prototype[name] = function (...args) {
                return fn(this, ...args);
            };
        }
    };
}
//# sourceMappingURL=function-injection.js.map