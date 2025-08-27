import Handlebars from "handlebars";
import * as Pages from "./pages";
import * as Components from "./components";
import * as Icons from "./assets/icons";
import renderHbs from "./helpers/renderHbs";

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
Handlebars.registerPartial("Avatar", Components.Avatar);
Handlebars.registerPartial("List", Components.List);
Handlebars.registerPartial("Footer", Components.Footer);
Handlebars.registerPartial("ErrorBanner", Components.ErrorBanner);

Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper("and", function (a, b) {
  return a && b;
});
Handlebars.registerHelper("or", function () {
  return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
});

const pages = [
  { slug: "login" },
  { slug: "register" },
  { slug: "chat" },
  { slug: "settings" },
  { slug: "404" },
  { slug: "500" },
];

const ERROR_PAGES = {
  404: {
    code: "404",
    text: "Не туда попали",
  },
  500: {
    code: "500",
    text: "Уже чиним",
  },
};
const COMMON_ICONS = {
  chatAdd: Icons.ChatAdd,
  logout: Icons.Logout,
  settings: Icons.Settings,
  arrowBack: Icons.ArrowBack,
};
const PAGES_TEMPLATES = {
  login: Pages.LoginPage,
  register: Pages.RegisterPage,
  chat: Pages.ChatPage,
  settings: Pages.SettingsPage,
  404: Pages.Page404,
  500: Pages.Page404,
};

export default class App {
  constructor() {
    this.state = {
      currentPage: "settings",
      token: [],
      settingsPage: {
        isEdit: false,
        isEditPassword: false,
        options: [
          {
            name: "Имя",
            value: "Иван",
            id: "name",
          },
          {
            name: "Фамилия",
            value: "Иванов",
            id: "surname",
          },
          {
            name: "Ник",
            value: "user777",
            id: "nik",
          },
          {
            name: "Email",
            value: "user777@yandex.ru",
            id: "email",
          },
          {
            name: "Телефон",
            value: "8 800 555 3 555",
            id: "tel",
          },
          {
            name: "Логин",
            value: "user777",
            id: "login",
          },
          {
            name: "Пароль",
            buttonName: "Сменить",
            isButton: true,
            id: "password-button",
          },
        ],
        passwordOptions: [
          {
            name: "Старый пароль",
            id: "password-old",
            isEdit: true
          },
          {
            name: "Новый пароль",
            id: "password-new", 
            isEdit: true
          },
        ],
      },
    };
    this.appElement = document.getElementById("app");
  }

  render() {
    let html = "";
    const ctx = {};

    if (ERROR_PAGES[this.state.currentPage]) {
      ctx.settingsPanel = {
        state: "settings",
        icons: COMMON_ICONS
      };
      ctx.page = ERROR_PAGES[this.state.currentPage];
      const leftPanel = renderHbs(Components.SettingsPanel, ctx.settingsPanel);
      const mainArea = renderHbs(Components.ErrorBanner, ctx.page);
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
          userName: `${
            sPage.options.find((o) => o.id === "name")?.value || ""
          } ${
            sPage.options.find((o) => o.id === "surname")?.value || ""
          }`.trim(),
          options: sPage.options.map((item) => ({
            ...item,
            isEdit: sPage.isEdit,
          })),
          passwordOptions: sPage.passwordOptions,
          isEdit: sPage.isEdit,
          isEditPassword: sPage.isEditPassword,
        };
        mainArea = renderHbs(Components.SettingsArea, ctx.settingsArea);
      }
      const leftPanel = renderHbs(Components.SettingsPanel, ctx.settingsPanel);
      html = Handlebars.compile(PAGES_TEMPLATES[this.state.currentPage])({
        leftPanel,
        mainArea,
      });
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const nodes = Array.from(doc.body.childNodes);
    this.appElement.replaceChildren(...nodes);
    this.attachEventListeners();
  }

  attachEventListeners() {
    const page = this.state.currentPage;

    const setClick = (id, cb) => {
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
              const option = sPage.options.find((item) => item.id === id);
              if (option) option.value = selector.value;
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

  goToPage(page) {
    this.state.currentPage = page;
    this.render();
  }
}
