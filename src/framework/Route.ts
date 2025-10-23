import Block from './Block.ts';

export type BlockConstructable<TBlock extends Block = Block> = new (
  ...args: any[]
) => TBlock;

interface RouteProps {
  rootQuery: string;
}

const renderBlock = (rootQuery: string, block: Block): void => {
  const root = document.querySelector(rootQuery);

  if (!root) {
    throw new Error(`Root element not found by selector "${rootQuery}"`);
  }

  root.replaceChildren(block.getContent());
};

export default class Route<TBlock extends Block = Block> {
  private readonly pathname: string;

  private readonly BlockClass: BlockConstructable<TBlock>;

  private block: TBlock | null = null;

  private readonly props: RouteProps;

  constructor(pathname: string, view: BlockConstructable<TBlock>, props: RouteProps) {
    this.pathname = pathname;
    this.BlockClass = view;
    this.props = props;
  }

  public navigate(pathname: string): void {
    if (this.match(pathname)) {
      this.render();
    }
  }

  public leave(): void {
    this.block?.hide();
  }

  public match(pathname: string): boolean {
    return pathname === this.pathname;
  }

  public render(): void {
    if (!this.block) {
      this.block = new this.BlockClass();
      renderBlock(this.props.rootQuery, this.block);
      this.block.dispatchComponentDidMount();
      return;
    }

    renderBlock(this.props.rootQuery, this.block);
    this.block.show();
  }
}
