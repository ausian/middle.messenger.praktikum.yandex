import Handlebars from 'handlebars';
import Block from '../framework/Block.ts';

export function registerHandlebarsHelpers() {
  Handlebars.registerHelper(
    'ifEquals',
    function (
      this: Record<string, unknown>,
      arg1: string | number,
      arg2: string | number,
      options: Handlebars.HelperOptions,
    ) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    },
  );

  Handlebars.registerHelper('and', (a, b) => a && b);

  Handlebars.registerHelper('or', function (...args: unknown[]) {
    return args.slice(0, -1).some(Boolean);
  });

  Handlebars.registerHelper('renderBlock', function (item) {
    if (item instanceof Block) {
      return new Handlebars.SafeString(`<div data-id="${item.getId()}"></div>`);
    }
    return item != null ? String(item) : '';
  });
}
