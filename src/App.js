import Handlebars from 'handlebars';
import * as Pages from './pages';
import * as Components from './components';


Handlebars.registerPartial('Input', Components.Input);
Handlebars.registerPartial('Button', Components.Button);


export default class App {
  constructor() {
    this.state = {
      currentPage: 'login',
      token: [],
    };
    this.appElement = document.getElementById('app');
  }

  render() {
    let template;
    if (this.state.currentPage === 'login') {
      template = Handlebars.compile(Pages.LoginPage);
      this.appElement.innerHTML = template({
      });
    }
    if (this.state.currentPage === 'register') {
      template = Handlebars.compile(Pages.RegisterPage);
      this.appElement.innerHTML = template({
      });
    }
    this.attachEventListeners();
  }
  attachEventListeners() {
    if (this.state.currentPage === 'login') {
      const registerButton = document.getElementById('register-button');
      registerButton.addEventListener('click', () => this.goToPage('register'));
    }
    if (this.state.currentPage === 'register') {
      const loginButton = document.getElementById('login-button');
      loginButton.addEventListener('click', () => this.goToPage('login'));
    }
  }
  goToPage(page) {
    this.state.currentPage = page;
    this.render();
  }
}
