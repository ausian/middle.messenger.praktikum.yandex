import Handlebars from 'handlebars';

const renderHbs = (tpl: string, ctx?: unknown): string => Handlebars.compile(tpl)(ctx);
export default renderHbs;
