import './styles/main.pcss';
import { startApp } from './App.ts';
import authController from './controllers/AuthController.ts';

const init = () => {
  if (!document.getElementById('app')) {
    throw new Error('Root element with id "app" not found');
  }

  void authController.fetchCurrentUser().finally(() => {
    startApp();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
