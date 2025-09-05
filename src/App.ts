import Handlebars from "handlebars";
import * as Pages from "./pages/index.ts";
import * as Components from "./components/index.ts";
import * as Icons from "./assets/icons/index.ts";
import renderHbs from "./helpers/renderHbs.ts";

Handlebars.registerPartial("Input", Components.Input);
Handlebars.registerPartial("Button", Components.Button);
Handlebars.registerPartial("SettingsPanel", Components.SettingsPanel);
Handlebars.registerPartial("MessageArea", Components.MessageArea);
Handlebars.registerPartial("MessageList", Components.MessageList);
Handlebars.registerPartial("MainLayout", Components.MainLayout);
Handlebars.registerPartial("AuthLayout", Components.AuthLayout);
Handlebars.registerPartial("LoginForm", Components.LoginForm);
Handlebars.registerPartial("RegisterForm", Components.RegisterForm);
Handlebars.registerPartial("SettingsArea", Components.SettingsArea);
Handlebars.registerPartial("AvatarProfile", Components.AvatarProfile);
Handlebars.registerPartial("List", Components.List);
Handlebars.registerPartial("Footer", Components.Footer);
Handlebars.registerPartial("ErrorBanner", Components.ErrorBanner);

Handlebars.registerHelper("ifEquals", function (
  this: Record<string, unknown>,
  arg1: string | number,
  arg2: string | number,
  options: Handlebars.HelperOptions
) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper("and", function (a, b) {
  return a && b;
});
Handlebars.registerHelper("or", function () {
  return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
});

type PageSlug = "login" | "register" | "chat" | "settings" | "404" | "500";
type Error = "404" | "500";

interface Page {
  slug: PageSlug;
};
interface ErrorPage {
  code: Error;
  text: string;
};
interface Option {
  labelList: string;
  value?: string;
  placeholder?: string;
  buttonName?: string;
  isButton?: boolean;
  id: string;
  autocomplete?: boolean;
  isEdit?: boolean;
};

interface State {
  currentPage: PageSlug;
  token: string[];
  settingsPage: {
    isEdit: boolean;
    isEditPassword: boolean;
    options: Option[];
    passwordOptions: Option[];
  };
}

interface RenderContext {
  settingsPanel?: {
    state: string;
    icons: Record<string, string>;
  };
  page?: ErrorPage | undefined;
  settingsArea?: {
    avatarSrc: string;
    iconPhoto: string;
    userName: string;
    options: Option[];
    passwordOptions: Option[];
    isEdit: boolean;
    isEditPassword: boolean;
  };
}

const pages: Page[] = [
  { slug: "login" },
  { slug: "register" },
  { slug: "chat" },
  { slug: "settings" },
  { slug: "404" },
  { slug: "500" },
];


const ERROR_PAGES: Record<Error, ErrorPage> = {
  404: {
    code: "404",
    text: "Не туда попали",
  },
  500: {
    code: "500",
    text: "Уже чиним",
  },
};

const COMMON_ICONS: Record<string, string> = {
  chatAdd: Icons.ChatAdd,
  logout: Icons.Logout,
  settings: Icons.Settings,
  arrowBack: Icons.ArrowBack,
};

const PAGES_TEMPLATES: Record<PageSlug, string> = {
  login: Pages.LoginPage,
  register: Pages.RegisterPage,
  chat: Pages.ChatPage,
  settings: Pages.SettingsPage,
  404: Pages.Page404,
  500: Pages.Page404,
};

function getPageFromPath(path: string): PageSlug {
  const slug = path.startsWith("/") ? path.slice(1) : path;
  if (!slug) return "login";
  if (pages.some((p) => p.slug === slug)) return slug as PageSlug;
  return "404";
}

function navigateTo(slug: string): void {
  window.history.pushState({ page: slug }, "", "/" + slug);
}

export default class App {
  state: State;
  appElement: HTMLElement | null;

  constructor() {
    this.state = {
      currentPage: getPageFromPath(window.location.pathname),
      token: [],
      settingsPage: {
        isEdit: false,
        isEditPassword: false,
        options: [
          {
            labelList: "Имя",
            value: "Иван",
            id: "first_name",
            autocomplete: true,
          },
          {
            labelList: "Фамилия",
            value: "Иванов",
            id: "second_name",
          },
          {
            labelList: "Ник",
            value: "user777",
            id: "display_name",
          },
          {
            labelList: "Email",
            value: "user777@yandex.ru ",
            id: "email",
            autocomplete: true,
          },
          {
            labelList: "Телефон",
            value: "8 800 555 3 555",
            id: "phone",
            autocomplete: true,
          },
          {
            labelList: "Логин",
            value: "user777",
            id: "login",
          },
          {
            labelList: "Пароль",
            buttonName: "Сменить",
            isButton: true,
            id: "password-button",
          },
        ],
        passwordOptions: [
          {
            labelList: "Старый пароль",
            placeholder: 'Введите пароль',
            id: "oldPassword",
            isEdit: true,
          },
          {
            labelList: "Новый пароль",
            placeholder: 'Введите новый пароль',
            id: "newPassword",
            isEdit: true,
          },
        ],
      },
    };
    this.appElement = document.getElementById("app");

    window.addEventListener("popstate", (event) => {
      const path = window.location.pathname;
      const page = getPageFromPath(path);
      this.state.currentPage = page;
      this.render();
    });
  }

  render() {
    let html: string = "";
    const ctx: RenderContext = {};

    if (this.state.currentPage === "404" || this.state.currentPage === "500") {
      ctx.settingsPanel = {
        state: "settings",
        icons: COMMON_ICONS,
      };
      ctx.page = ERROR_PAGES[this.state.currentPage];
      const leftPanel = renderHbs(Components.SettingsPanel, ctx.settingsPanel as {});
      const mainArea = renderHbs(Components.ErrorBanner, ctx.page as {});
      html = Handlebars.compile(PAGES_TEMPLATES[this.state.currentPage])({
        leftPanel,
        mainArea,
      });
    } else if (
      this.state.currentPage === "login" ||
      this.state.currentPage === "register"
    ) {
      const component =
        this.state.currentPage === "login"
          ? Components.LoginForm
          : Components.RegisterForm;
      const childrenHTML = renderHbs(component);
      html = Handlebars.compile(PAGES_TEMPLATES[this.state.currentPage])({
        pageClass: this.state.currentPage + "-page",
        children: childrenHTML,
      });
    } else if (
      this.state.currentPage === "chat" ||
      this.state.currentPage === "settings"
    ) {
      ctx.settingsPanel = {
        state: this.state.currentPage,
        icons: COMMON_ICONS,
      };

      let mainArea;
      if (this.state.currentPage === "chat") {
        mainArea =
          renderHbs(Components.MessageList) + renderHbs(Components.MessageArea);
      } else {
        const sPage = this.state.settingsPage;
        ctx.settingsArea = {
          avatarSrc:
            "https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          iconPhoto: Icons.Photo,
          userName: `${
            sPage.options.find((o: Option) => o.id === "first_name")?.value || ""
          } ${
            sPage.options.find((o: Option) => o.id === "second_name")?.value || ""
          }`.trim(),
          options: sPage.options.map((item: Option) => ({
            ...item,
            isEdit: sPage.isEdit,
          })),
          passwordOptions: sPage.passwordOptions,
          isEdit: sPage.isEdit,
          isEditPassword: sPage.isEditPassword,
        };
        mainArea = renderHbs(Components.SettingsArea, ctx.settingsArea as {});
      }

      const leftPanel = renderHbs(Components.SettingsPanel, ctx.settingsPanel as {});
      html = Handlebars.compile(PAGES_TEMPLATES[this.state.currentPage])({
        leftPanel,
        mainArea,
      });
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const nodes = Array.from(doc.body.childNodes);

    if (this.appElement) this.appElement.replaceChildren(...nodes);
    this.attachEventListeners();
  }

  attachEventListeners() {
    const page = this.state.currentPage;
    const setClick = (id: string, cb: (this: HTMLElement, ev: MouseEvent) => any) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", cb);
    };

    if (page === "login") {
      setClick("register-button", () => this.goToPage("register"));
    }
    if (page === "register") {
      setClick("login-button", () => this.goToPage("login"));
    }
    if (page === "chat") {
      setClick("settings-panel__button-settings", () => {
        this.goToPage("settings");
      });
      setClick("settings-panel__button-logout", () => {
        this.goToPage("login");
      });
    }
    if (page === "404" || page === "500") {
      setClick("settings-panel__button-logout", () => {
        this.goToPage("login");
      });
      setClick("settings-panel__button-back", () => {
        this.goToPage("chat");
      });
    }
    if (page === "settings") {
      const sPage = this.state.settingsPage;
      if (sPage.isEdit) {
        setClick("settings__button-save", () => {
          sPage.isEdit = false;
          document
            .querySelectorAll(".list__item .input__control")
            .forEach((selector) => {
              const id = selector.id;
              const option = sPage.options.find((item: Option) => item.id === id);
              if (option) option.value = (selector as HTMLInputElement).value;
            });
          this.render();
        });
      } else {
        setClick("settings__button-edit", () => {
          sPage.isEdit = true;
          this.render();
        });
      }
      setClick("password-button", () => {
        sPage.isEditPassword = true;
        this.render();
      });
      setClick("settings__password-save", () => {
        sPage.isEditPassword = false;
        this.render();
      });
      setClick("settings__button-back", () => {
        sPage.isEdit = false;
        sPage.isEditPassword = false;
        this.render();
      });
      setClick("settings-panel__button-back", () => {
        this.goToPage("chat");
      });
      setClick("settings-panel__button-logout", () => {
        this.goToPage("login");
      });
    }
    pages.forEach((page) =>
      setClick(`${page.slug}-link`, (e) => {
        e.preventDefault();
        this.goToPage(page.slug);
      })
    );
  }

  goToPage( page: string): void {
    const pageSlug = getPageFromPath("/" + page);
    this.state.currentPage = pageSlug;
    navigateTo(pageSlug);
    this.render();
  }
}
