var __esDecorate =
  (this && this.__esDecorate) ||
  function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
      if (f !== void 0 && typeof f !== 'function') throw new TypeError('Function expected');
      return f;
    }
    var kind = contextIn.kind,
      key = kind === 'getter' ? 'get' : kind === 'setter' ? 'set' : 'value';
    var target = !descriptorIn && ctor ? (contextIn['static'] ? ctor : ctor.prototype) : null;
    var descriptor =
      descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _,
      done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === 'access' ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) {
        if (done) throw new TypeError('Cannot add initializers after decoration has completed');
        extraInitializers.push(accept(f || null));
      };
      var result = (0, decorators[i])(
        kind === 'accessor' ? { get: descriptor.get, set: descriptor.set } : descriptor[key],
        context
      );
      if (kind === 'accessor') {
        if (result === void 0) continue;
        if (result === null || typeof result !== 'object') throw new TypeError('Object expected');
        if ((_ = accept(result.get))) descriptor.get = _;
        if ((_ = accept(result.set))) descriptor.set = _;
        if ((_ = accept(result.init))) initializers.unshift(_);
      } else if ((_ = accept(result))) {
        if (kind === 'field') initializers.unshift(_);
        else descriptor[key] = _;
      }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
  };
var __runInitializers =
  (this && this.__runInitializers) ||
  function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  };
var __setFunctionName =
  (this && this.__setFunctionName) ||
  function (f, name, prefix) {
    if (typeof name === 'symbol') name = name.description ? '['.concat(name.description, ']') : '';
    return Object.defineProperty(f, 'name', {
      configurable: true,
      value: prefix ? ''.concat(prefix, ' ', name) : name,
    });
  };
import { library } from '../../models/library';
import { addFunctions } from '../../decorators/function-injection';
import { ok, err } from '../../errors';
import { randomUUID } from 'node:crypto';
/**
 * Business logic class for Library domain entity
 * Extends plain model with methods and validation
 */
let Library = (() => {
  let _classDecorators = [addFunctions({})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = library;
  var Library = (_classThis = class extends _classSuper {
    /**
     * Check if library data is stale (not updated in 30 days)
     */
    isStale() {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      return Date.now() - this.updated > thirtyDaysMs;
    }
    /**
     * Generate library identifier from org and project name
     * Format: /org/project (e.g., /vercel/next.js)
     */
    generateIdentifier() {
      return `/${this.org}/${this.project}`;
    }
    /**
     * Validate library has minimum required fields
     */
    validate() {
      if (!this.org || !this.project) {
        return err({
          message: 'Library must have org and project name',
          code: 'INVALID_LIBRARY',
        });
      }
      if (!this.name) {
        return err({
          message: 'Library must have a display name',
          code: 'INVALID_LIBRARY',
        });
      }
      return ok(true);
    }
    /**
     * Create a new Library instance with defaults
     */
    static create(data) {
      try {
        const lib = new this();

        lib.id = randomUUID();
        const now = Date.now();
        lib.created = now;
        lib.updated = now;
        // Set required fields
        lib.org = data.org;
        lib.project = data.project;
        lib.name = data.name;
        lib.identifier = `/${data.org}/${data.project}`;
        // Set optional fields
        lib.repositoryUrl = data.repositoryUrl || '';
        lib.homepageUrl = data.homepageUrl || '';
        lib.description = data.description || '';
        // Validate before returning
        const validation = lib.validate();
        if (!validation.ok) {
          return err(validation.error);
        }
        return ok(lib);
      } catch (e) {
        return err({
          message: 'Failed to create Library instance',
          code: 'CREATE_FAILED',
          cause: e,
        });
      }
    }
    /**
     * Update library fields and refresh timestamp
     */
    update(data) {
      try {
        Object.assign(this, data);
        this.updated = Date.now();
        // Re-validate after update
        const validation = this.validate();
        if (!validation.ok) {
          return err(validation.error);
        }
        return ok(this);
      } catch (e) {
        return err({
          message: 'Failed to update Library instance',
          code: 'UPDATE_FAILED',
          cause: e,
        });
      }
    }
  });
  __setFunctionName(_classThis, 'Library');
  (() => {
    const _metadata =
      typeof Symbol === 'function' && Symbol.metadata
        ? Object.create(_classSuper[Symbol.metadata] ?? null)
        : void 0;
    __esDecorate(
      null,
      (_classDescriptor = { value: _classThis }),
      _classDecorators,
      { kind: 'class', name: _classThis.name, metadata: _metadata },
      null,
      _classExtraInitializers
    );
    Library = _classThis = _classDescriptor.value;
    if (_metadata)
      Object.defineProperty(_classThis, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata,
      });
    __runInitializers(_classThis, _classExtraInitializers);
  })();
  return (Library = _classThis);
})();
export { Library };
//# sourceMappingURL=Library.js.map
