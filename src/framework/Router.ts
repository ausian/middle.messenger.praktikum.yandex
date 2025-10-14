import Route, { type BlockConstructable } from './Route.ts';

type Nullable<T> = T | null;

export default class Router {
  private static __instance: Router | null = null;

  private readonly routes: Route[] = [];

  private readonly history: History = window.history;

  private currentRoute: Nullable<Route> = null;

  private readonly rootQuery: string;

  private notFoundRoute: Nullable<Route> = null;

  constructor(rootQuery: string) {
    this.rootQuery = rootQuery;

    if (Router.__instance) {
      return Router.__instance;
    }

    Router.__instance = this;
  }

  public use(pathname: string, block: BlockConstructable, options?: {
    isFallback?: boolean;
  }): this {
    const route = new Route(pathname, block, { rootQuery: this.rootQuery });
    this.routes.push(route);

    if (options?.isFallback) {
      this.notFoundRoute = route;
    }

    return this;
  }

  public start(): void {
    window.onpopstate = () => {
      this.onRoute(window.location.pathname);
    };

    this.onRoute(window.location.pathname);
  }

  public go(pathname: string): void {
    if (this.currentRoute?.match(pathname)) {
      return;
    }

    this.history.pushState({}, '', pathname);
    this.onRoute(pathname);
  }

  public back(): void {
    this.history.back();
  }

  public forward(): void {
    this.history.forward();
  }

  public getRoute(pathname: string): Route | undefined {
    return this.routes.find((route) => route.match(pathname));
  }

  private onRoute(pathname: string): void {
    let route = this.getRoute(pathname);

    if (!route) {
      const fallbackRoute = this.notFoundRoute;
      if (!fallbackRoute) {
        console.error('Route not found and fallback route is not configured', pathname);
        return;
      }

      route = fallbackRoute;
    }

    if (this.currentRoute && this.currentRoute !== route) {
      this.currentRoute.leave();
    }

    this.currentRoute = route;
    route.render();
  }
}
