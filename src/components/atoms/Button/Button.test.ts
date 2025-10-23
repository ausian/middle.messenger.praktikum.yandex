/// <reference types="mocha" />

import { expect } from 'chai';
import sinon from 'sinon';
import { Button } from './index.ts';

describe('Button component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders text, attributes, and state classes', () => {
    const button = new Button({
      id: 'submit-btn',
      type: 'submit',
      text: 'Send',
      class: 'button--primary',
      active: true,
      disabled: true,
    });

    const element = button.getContent() as HTMLButtonElement;

    expect(element.tagName).to.equal('BUTTON');
    expect(element.id).to.equal('submit-btn');
    expect(element.type).to.equal('submit');
    expect(element.className).to.include('button--primary');
    expect(element.className).to.include('button--active');
    expect(element.disabled).to.equal(true);
    expect(element.textContent?.trim()).to.equal('Send');
  });

  it('renders icon markup when provided', () => {
    const button = new Button({
      id: 'icon-btn',
      type: 'button',
      text: 'Attach',
      icon: '<span class="icon"></span>',
    });

    const element = button.getContent();
    expect(element.querySelector('.icon')).to.not.equal(null);
  });

  it('invokes onClick callback when clicked', () => {
    const onClick = sinon.spy();
    const button = new Button({
      id: 'clickable',
      type: 'button',
      onClick,
    });

    const element = button.getContent();
    element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    expect(onClick.calledOnce).to.equal(true);
  });
});
