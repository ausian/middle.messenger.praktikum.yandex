import Router from './framework/Router.ts';
import {
  LoginPage,
  RegisterPage,
  ChatPage,
  SettingsPage,
  Page404,
  Page500,
} from './pages/index.ts';
import { registerHandlebarsHelpers } from './helpers/handlebarsHelpers.ts';

export const APP_ROUTES = {
  root: '/',
  login: '/',
  register: '/sign-up',
  chat: '/messenger',
  settings: '/settings',
  notFound: '/404',
  serverError: '/500',
} as const;

type RouteKey = keyof typeof APP_ROUTES;
export type AppRoute = typeof APP_ROUTES[RouteKey];

registerHandlebarsHelpers();

export const router = new Router('#app');

let isConfigured = false;
let hasStarted = false;

const configureRouter = (): void => {
  if (isConfigured) return;

  router
    .use(APP_ROUTES.root, LoginPage)
    .use(APP_ROUTES.login, LoginPage)
    .use(APP_ROUTES.register, RegisterPage)
    .use(APP_ROUTES.chat, ChatPage)
    .use(APP_ROUTES.settings, SettingsPage)
    .use(APP_ROUTES.notFound, Page404, { isFallback: true })
    .use(APP_ROUTES.serverError, Page500);

  isConfigured = true;
};

export const startApp = (): void => {
  configureRouter();
  if (hasStarted) return;
  router.start();
  hasStarted = true;
};
