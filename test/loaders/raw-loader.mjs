import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.endsWith('?raw')) {
    const withoutQuery = specifier.slice(0, -'?raw'.length);
    const resolution = await defaultResolve(withoutQuery, context, defaultResolve);
    return { ...resolution, url: `${resolution.url}?raw`, shortCircuit: true };
  }

  if (specifier.endsWith('.pcss')) {
    const resolution = await defaultResolve(specifier, context, defaultResolve);
    return { ...resolution, url: `${resolution.url}?pcss`, shortCircuit: true };
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith('?raw')) {
    const withoutQuery = url.slice(0, -'?raw'.length);
    const source = await fs.readFile(fileURLToPath(withoutQuery), 'utf-8');
    return {
      format: 'module',
      source: `export default ${JSON.stringify(source)};`,
      shortCircuit: true,
    };
  }

  if (url.endsWith('?pcss')) {
    return {
      format: 'module',
      source: 'export default {};',
      shortCircuit: true,
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
