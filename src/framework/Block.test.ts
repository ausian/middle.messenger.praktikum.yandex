/// <reference types="mocha" />

import { expect } from 'chai';
import Block from './Block.ts';

describe('Block templating', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  class TextBlock extends Block<{ label: string }> {
    override render(): string {
      return `<div class="text-block">{{label}}</div>`;
    }
  }

  it('renders template using provided props', () => {
    const block = new TextBlock({ label: 'Hello' });

    const element = block.getContent();

    expect(element).to.be.instanceOf(window.HTMLElement);
    expect(element.classList.contains('text-block')).to.equal(true);
    expect(element.textContent?.trim()).to.equal('Hello');
  });

  it('injects child block content into template placeholders', () => {
    class ParentBlock extends Block<{ child: Block }> {
      override render(): string {
        return `<section class="parent">{{{child}}}</section>`;
      }
    }

    const child = new TextBlock({ label: 'Child' });
    const parent = new ParentBlock({ child });

    const parentElement = parent.getContent();
    const childElement = parentElement.querySelector('.text-block');

    expect(childElement).to.not.equal(null);
    expect(childElement?.textContent?.trim()).to.equal('Child');
    expect(childElement).to.equal(child.getContent());
  });

  it('re-renders when props change', () => {
    const block = new TextBlock({ label: 'Initial' });

    block.setProps({ label: 'Updated' });

    const element = block.getContent();
    expect(element.textContent?.trim()).to.equal('Updated');
  });
});
