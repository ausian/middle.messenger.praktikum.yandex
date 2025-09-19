import './styles/main.pcss';
import { app } from './App.ts';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Root element with id "app" not found');
}

root.replaceChildren(app.getContent());
app.dispatchComponentDidMount();
