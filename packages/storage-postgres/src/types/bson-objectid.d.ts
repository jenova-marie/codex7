/**
 * Type declarations for bson-objectid package
 */

declare module 'bson-objectid' {
  class ObjectID {
    constructor(id?: string | number);
    toHexString(): string;
    toString(): string;
    static isValid(id: string | number): boolean;
  }

  export = ObjectID;
}
