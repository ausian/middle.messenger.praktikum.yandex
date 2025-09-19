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

export default class App extends Block {
  constructor() {
    const initialSlug = getPageFromPath(window.location.pathname);
    const initialPage = new routes[initialSlug]();

    let navigate: (slug: PageSlug, push?: boolean) => void = () => undefined;

    const handlePopState = () => {
      navigate(getPageFromPath(window.location.pathname), false);
    };

    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('a[id$="-link"]');
      if (!link) return;

      event.preventDefault();
      const slug = link.id.replace('-link', '') as PageSlug;
      navigate(slug);
    };

    super({
      attr: { class: 'app-root' },
      events: {
        'window:popstate': handlePopState,
        click: handleClick,
      },
      CurrentPage: initialPage,
    });

    navigate = this.navigateTo.bind(this);
  }

  public navigateTo(slug: PageSlug, push: boolean = true): void {
    if (push) window.history.pushState({}, '', `/${slug}`);

    const nextPage = new routes[slug]();

    this.children.CurrentPage = nextPage;

    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
    nextPage.dispatchComponentDidMount();
  }

  override render(): string {
    return '<div>{{{ CurrentPage }}}</div>';
  }
}

registerHandlebarsHelpers();
export const app = new App();
