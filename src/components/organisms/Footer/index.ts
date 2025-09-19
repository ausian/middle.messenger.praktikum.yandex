import Block from '../../../framework/Block.ts';
import footerTemplate from './Footer.hbs?raw';
import './Footer.pcss';

export class Footer extends Block {
  override render() {
    return footerTemplate;
  }
}
