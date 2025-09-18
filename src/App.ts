import Block from './framework/Block.ts';
import {
  LoginPage,
  RegisterPage,
  ChatPage,
  SettingsPage,
  Page404,
  Page500,
} from './pages/index.ts';
import { registerHandlebarsHelpers } from './helpers/handlebarsHelpers.ts';

type PageSlug = 'login' | 'register' | 'chat' | 'settings' | '404' | '500';

const routes: Record<PageSlug, new () => Block> = {
  login: LoginPage,
  register: RegisterPage,
  chat: ChatPage,
  settings: SettingsPage,
  404: Page404,
  500: Page500,
};

function getPageFromPath(path: string): PageSlug {
  const slug = path.startsWith('/') ? path.slice(1) : path;
  if (!slug || !(slug in routes)) return '404';
  return slug as PageSlug;
}

export default class App {
  private root: HTMLElement;

  private currentPage: Block;

  private currentSlug: PageSlug;

  constructor() {
    this.root = document.getElementById('app')!;
    this.currentSlug = getPageFromPath(window.location.pathname);
    this.currentPage = new routes[this.currentSlug]();

    window.addEventListener('popstate', () => {
      this.navigateTo(getPageFromPath(window.location.pathname), false);
    });

    this.attachLinkListeners();
  }

  render() {
    this.root.replaceChildren(this.currentPage.getContent());
    this.currentPage.dispatchComponentDidMount();
  }

  navigateTo(slug: PageSlug, push: boolean = true) {
    if (push) window.history.pushState({}, '', `/${slug}`);
    this.currentSlug = slug;
    this.currentPage = new routes[slug]();
    this.render();
  }

  attachLinkListeners() {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('a[id$="-link"]')) {
        e.preventDefault();
        const slug = target.id.replace('-link', '') as PageSlug;
        this.navigateTo(slug);
      }
    });
  }
}

registerHandlebarsHelpers();
export const app = new App();
