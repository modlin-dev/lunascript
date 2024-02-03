import { bool } from "./types/boolean";
import { int16 } from "./types/number";
import { utf8 } from "./types/string";

type Value<T> = {
  [P in keyof T]: T[P];
};

type Opt<T> = {
  [P in keyof T]?: T;
};

export const LS = {
  TypeCheck: ($: Record<any, any>, to: Record<any, any>) => {
    for (let type of getTypes(to)) {
      if (type.type === "bigint") LS.BigInt(atPath($, type.key));
      if (type.type === "boolean") LS.Boolean(atPath($, type.key));
      if (type.type === "function") LS.Function(atPath($, type.key));
      if (type.type === "number") LS.Number(atPath($, type.key));
      if (type.type === "object") LS.Object(atPath($, type.key));
      if (type.type === "string") LS.String(atPath($, type.key));
      if (type.type === "symbol") LS.Symbol(atPath($, type.key));
      if (type.type === "undefined") LS.Undefined(atPath($, type.key));
    }
  },
  isBigInt: ($: any): $ is bigint => typeof $ === "bigint",
  isBoolean: ($: any): $ is boolean => typeof $ === "boolean",
  isFunction: ($: any): $ is Function => typeof $ === "function",
  isNumber: ($: any): $ is number => typeof $ === "number",
  isObject: ($: any): $ is object => typeof $ === "object",
  isString: ($: any): $ is string => typeof $ === "string",
  isSymbol: ($: any): $ is symbol => typeof $ === "symbol",
  isUndefined: ($: any): $ is undefined => typeof $ === "undefined",

  BigInt: <T extends bigint>($: T) => {
    if (LS.isBigInt($)) {
      return $;
    } else {
      throw new TypeError(
        `LunaScript: Expected bigint, got ${typeof $} value ${$}`
      );
    }
  },
  Boolean: <T extends boolean>($: T) => {
    if (LS.isBoolean($)) {
      return new bool($);
    } else {
      throw new TypeError(
        `LunaScript: Expected boolean, got ${typeof $} value ${$}`
      );
    }
  },
  Function: <T extends (...args: any[]) => any>($: T, types?: any[]) => {
    if (LS.isFunction($)) {
      return (...args: Parameters<T>): ReturnType<T> => {
        if (types) {
          let at = 0;
          for (const arg of args) {
            LS.TypeCheck(arg, types[at]);
            at += 1;
          }
        }
        return $(...args);
      };
    } else {
      throw new TypeError(
        `LunaScript: Expected function, got ${typeof $} value ${$}`
      );
    }
  },
  Number: <T extends number>($: T) => {
    if (LS.isNumber($)) {
      return new int16($);
    } else {
      throw new TypeError(
        `LunaScript: Expected number, got ${typeof $} value ${$}`
      );
    }
  },
  /**
   * @param types Types are Experimental use JSDoc or TypeScript instead
   * @returns
   */
  Object: <T extends object>($: Value<T>, types?: T): T => {
    return $;
  },
  String: <T extends string>($: T) => {
    if (LS.isString($)) {
      return new utf8($);
    } else {
      throw new TypeError(
        `LunaScript: Expected string, got ${typeof $} value ${$}`
      );
    }
  },
  Symbol: <T extends string | number>($: T) => {
    if (LS.isString($) || LS.isNumber($)) {
      return Symbol($);
    } else {
      throw new TypeError(
        `LunaScript: Expected symbol, got ${typeof $} value ${$}`
      );
    }
  },
  Undefined: <T extends undefined>($: T) => {
    if (LS.isUndefined($)) {
      return $;
    } else {
      throw new TypeError(
        `LunaScript: Expected undefined, got ${typeof $} value ${$}`
      );
    }
  },

  toBigInt: ($: string) => BigInt($),
  toBoolean: ($: any) => Boolean($),
  toFunction: (...$: string[]) => Function(...$),
  toNumber: ($: any) => Number($),
  toObject: ($: any) => Object($),
  toString: ($: any) => String($),
  toSymbol: ($: string | number | undefined) => Symbol($),
  toUndefined: ($: undefined) => undefined,
};

function* getTypes(
  $: Record<any, any>,
  parentKey = ""
): Generator<{ key: string; type: string }> {
  for (let key in $) {
    if ($.hasOwnProperty(key)) {
      let newKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof $[key] === "object" && $[key] !== null) {
        yield* getTypes($[key], newKey);
      } else {
        yield { key: newKey, type: typeof $[key] };
      }
    }
  }
}
function atPath(obj: any, path: string) {
  let parts = path.split(".");
  let current = obj;
  for (let part of parts) {
    if (current[part] === undefined) {
      return undefined;
    } else {
      current = current[part];
    }
  }
  return current;
}

interface Employee {
  id: number;
  name: string;
  salary: number;
}

const emp: Partial<Employee> = {};

emp.name = "Bobby Hadz";

emp;
