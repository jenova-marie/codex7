var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { version } from '../../models/version';
import { addFunctions } from '../../decorators/function-injection';
import { ok, err } from '../../errors';
import ObjectID from 'bson-objectid';
/**
 * Business logic class for Version domain entity
 * Extends plain model with methods and validation
 */
let Version = (() => {
    let _classDecorators = [addFunctions({})];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = version;
    var Version = _classThis = class extends _classSuper {
        /**
         * Check if version data is stale (not updated in 7 days)
         */
        isStale() {
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
            return Date.now() - this.updated > sevenDaysMs;
        }
        /**
         * Check if version is ready for indexing
         */
        isReadyForIndexing() {
            return !this.isDeprecated && this.indexed === 0;
        }
        /**
         * Normalize version string to semver format
         * Example: "v1.2.3" -> "1.2.3", "1.2" -> "1.2.0"
         */
        normalizeVersionString() {
            let normalized = this.versionString.replace(/^v/, '');
            const parts = normalized.split('.');
            // Ensure at least major.minor.patch
            while (parts.length < 3) {
                parts.push('0');
            }
            return parts.slice(0, 3).join('.');
        }
        /**
         * Validate version has minimum required fields
         */
        validate() {
            if (!this.libraryId) {
                return err({
                    message: 'Version must be associated with a library',
                    code: 'INVALID_VERSION'
                });
            }
            if (!this.versionString) {
                return err({
                    message: 'Version must have a version string',
                    code: 'INVALID_VERSION'
                });
            }
            return ok(true);
        }
        /**
         * Create a new Version instance with defaults
         */
        static create(data) {
            try {
                const ver = new this();
                const objectId = new ObjectID();
                ver.id = objectId.toHexString();
                const now = Date.now();
                ver.indexed = now;
                ver.updated = now;
                // Set required fields
                ver.libraryId = data.libraryId;
                ver.versionString = data.versionString;
                ver.versionNormalized = ver.normalizeVersionString();
                // Set optional fields
                ver.gitCommitSha = data.gitCommitSha || '';
                ver.releaseDate = data.releaseDate || now;
                ver.isLatest = data.isLatest || false;
                // Validate before returning
                const validation = ver.validate();
                if (!validation.ok) {
                    return err(validation.error);
                }
                return ok(ver);
            }
            catch (e) {
                return err({
                    message: 'Failed to create Version instance',
                    code: 'CREATE_FAILED',
                    cause: e
                });
            }
        }
        /**
         * Update version fields and refresh timestamp
         */
        update(data) {
            try {
                Object.assign(this, data);
                this.updated = Date.now();
                // Re-normalize if version string changed
                if (data.versionString) {
                    this.versionNormalized = this.normalizeVersionString();
                }
                // Re-validate after update
                const validation = this.validate();
                if (!validation.ok) {
                    return err(validation.error);
                }
                return ok(this);
            }
            catch (e) {
                return err({
                    message: 'Failed to update Version instance',
                    code: 'UPDATE_FAILED',
                    cause: e
                });
            }
        }
        /**
         * Mark this version as indexed with document count
         */
        markIndexed(documentCount) {
            this.documentCount = documentCount;
            this.indexed = Date.now();
            this.updated = this.indexed;
            return ok(this);
        }
        /**
         * Mark this version as the latest
         */
        markAsLatest() {
            this.isLatest = true;
            this.updated = Date.now();
            return ok(this);
        }
        /**
         * Deprecate this version
         */
        deprecate() {
            this.isDeprecated = true;
            this.updated = Date.now();
            return ok(this);
        }
    };
    __setFunctionName(_classThis, "Version");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Version = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Version = _classThis;
})();
export { Version };
//# sourceMappingURL=Version.js.map