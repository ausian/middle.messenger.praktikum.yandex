process.env.TS_NODE_TRANSPILE_ONLY = 'true';
process.env.TS_NODE_PROJECT = process.env.TS_NODE_PROJECT ?? 'tsconfig.json';

import Module from 'module';
import fs from 'fs';
import { register } from 'node:module';
import { JSDOM } from 'jsdom';

const loaderUrl = new URL('./test/loaders/raw-loader.mjs', import.meta.url).href;
register(loaderUrl, import.meta.url);

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  if (typeof request === 'string' && request.endsWith('.hbs?raw')) {
    const withoutQuery = request.replace('?raw', '');
    return originalResolveFilename.call(this, withoutQuery, parent, isMain, options);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (typeof request === 'string') {
    if (request.endsWith('.pcss')) {
      return {};
    }

    if (request.endsWith('.hbs?raw')) {
      const filename = originalResolveFilename.call(this, request.replace('?raw', ''), parent, isMain);
      return fs.readFileSync(filename, 'utf-8');
    }
  }

  return originalLoad.call(this, request, parent, isMain);
};

Module._extensions['.hbs'] = (module, filename) => {
  module.exports = fs.readFileSync(filename, 'utf-8');
};

Module._extensions['.pcss'] = (module) => {
  module.exports = {};
};

const jsdom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
  url: 'http://localhost/',
});

const setGlobal = (key, value) => {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  });
};

setGlobal('window', jsdom.window);
setGlobal('document', jsdom.window.document);
setGlobal('FormData', jsdom.window.FormData);
setGlobal('Node', jsdom.window.Node);
setGlobal('HTMLElement', jsdom.window.HTMLElement);
setGlobal('XMLHttpRequest', jsdom.window.XMLHttpRequest);
setGlobal('navigator', jsdom.window.navigator);
class JsdomDOMParser {
  parseFromString(markup) {
    const doc = document.implementation.createHTMLDocument('');
    doc.body.innerHTML = markup;
    return doc;
  }
}

setGlobal('DOMParser', JsdomDOMParser);
