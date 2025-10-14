const isArray = Array.isArray;

export type PlainObject<T = unknown> = Record<string, T>;

function isPlainObject(value: unknown): value is PlainObject {
  if (value === null || isArray(value) || typeof value !== 'object') return false;

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export default function isEqual(lhs: unknown, rhs: unknown): boolean {
  if (lhs === rhs) return true;

  if (lhs instanceof Date && rhs instanceof Date) {
    return lhs.getTime() === rhs.getTime();
  }

  if (lhs instanceof RegExp && rhs instanceof RegExp) {
    return lhs.toString() === rhs.toString();
  }

  if (isArray(lhs) && isArray(rhs)) {
    if (lhs.length !== rhs.length) return false;

    return lhs.every((value, index) => isEqual(value, rhs[index]));
  }

  if (isPlainObject(lhs) && isPlainObject(rhs)) {
    const lhsKeys = Object.keys(lhs);
    const rhsKeys = Object.keys(rhs);

    if (lhsKeys.length !== rhsKeys.length) return false;

    return lhsKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(rhs, key)
        && isEqual(lhs[key], rhs[key]),
    );
  }

  return false;
}
