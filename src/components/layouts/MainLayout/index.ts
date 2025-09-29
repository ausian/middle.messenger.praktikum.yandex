import Block, { type BlockProps } from '../../../framework/Block.ts';
import MainLayoutTemplate from './MainLayout.hbs?raw';
import './MainLayout.pcss';
import { Footer } from '../../organisms/Footer/index.ts';

interface MainLayoutProps extends BlockProps {
  pageClass: string;
  leftPanel: Block;
  mainArea: Block[];
  Footer?: Block;
}

export class MainLayout extends Block<Omit<MainLayoutProps, 'mainArea'>> {
  constructor(props: MainLayoutProps) {
    const { pageClass, leftPanel, mainArea } = props;

    super({
      pageClass,
      LeftPanel: leftPanel,
      Footer: props.Footer ?? new Footer(),
    });

    this.setLists({
      mainArea,
    });
  }

  override render() {
    return MainLayoutTemplate;
  }
}
