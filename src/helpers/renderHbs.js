import Handlebars from 'handlebars';
const renderHbs = (tpl, ctx) => Handlebars.compile(tpl)(ctx);
export default renderHbs;
