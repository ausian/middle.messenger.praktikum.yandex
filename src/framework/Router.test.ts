/// <reference types="mocha" />

import { expect } from 'chai';
import sinon from 'sinon';
import Router from './Router.ts';
import Block from './Block.ts';

class HomePage extends Block {
  override render(): string {
    return '<div id="home">Home</div>';
  }
}

class AboutPage extends Block {
  override render(): string {
    return '<div id="about">About</div>';
  }
}

class NotFoundPage extends Block {
  override render(): string {
    return '<div id="not-found">Not found</div>';
  }
}

describe('Router', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState({}, '', '/home');
    Reflect.set(Router, '__instance', null);
  });

  it('renders current route on start', () => {
    const router = new Router('#app');
    router.use('/home', HomePage);

    router.start();

    const home = document.querySelector('#home');
    expect(home).to.not.equal(null);
    expect(router.getRoute('/home')).to.not.equal(undefined);
  });

  it('navigates to a new route and hides previous block', () => {
    const router = new Router('#app');
    router.use('/home', HomePage);
    router.use('/about', AboutPage);

    const hideSpy = sinon.spy(HomePage.prototype, 'hide');

    router.start();
    router.go('/about');

    const about = document.querySelector('#about');

    expect(about).to.not.equal(null);
    expect(hideSpy.calledOnce).to.equal(true);

    hideSpy.restore();
  });

  it('uses fallback route when target route is missing', () => {
    const router = new Router('#app');
    router.use('/home', HomePage);
    router.use('/404', NotFoundPage, { isFallback: true });

    router.start();
    router.go('/missing');

    const notFound = document.querySelector('#not-found');
    expect(notFound).to.not.equal(null);
  });
});
