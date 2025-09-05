import Handlebars from 'handlebars';
const renderHbs = (tpl: string, ctx?: {}): string => Handlebars.compile(tpl)(ctx);
export default renderHbs;
