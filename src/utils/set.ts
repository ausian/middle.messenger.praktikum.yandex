export type Indexed<T = unknown> = {
  [key: string]: T;
};

function isObject(item: unknown): item is Indexed {
  return typeof item === "object" && item !== null && !Array.isArray(item);
}

function set<T extends Indexed>(object: T, path: string, value: unknown): T;
function set(object: unknown, path: string, value: unknown): unknown;
function set(object: unknown, path: string, value: unknown): unknown {
  if (!isObject(object)) {
    return object;
  }

  const keys = path.split(".");
  let current: Indexed = object;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (!key) {
      continue;
    }

    if (i === keys.length - 1) {
      current[key] = value as Indexed;
    } else {
      if (!isObject(current[key])) {
        current[key] = {};
      }
      current = current[key] as Indexed;
    }
  }

  return object;
}

export default set;
