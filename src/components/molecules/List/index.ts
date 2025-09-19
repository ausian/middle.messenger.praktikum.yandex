import Block, { type BlockProps } from '../../../framework/Block.ts';
import { Input } from '../../atoms/Input/index.ts';
import { Button } from '../../atoms/Button/index.ts';
import listTemplate from './List.hbs?raw';
import './List.pcss';

export interface ListItem {
  id: string;
  labelList: string;
  value?: string;
  placeholder?: string;
  buttonName?: string;
  isButton?: boolean;
  isEdit?: boolean;
}

interface ListProps extends BlockProps {
  className?: string;
  items: ListItem[];
}

interface SpanValueProps extends BlockProps {
  text: string;
}

class SpanValueBlock extends Block<SpanValueProps> {
  constructor(text: string) {
    super({ text });
  }

  override render(): string {
    return `<span class="list__item-value">${this.props.text}</span>`;
  }
}

export class List extends Block<ListProps> {
  private _itemBlocksById: Record<string, Block> = {};

  constructor(props: ListProps) {
    const { elementBlocks, childrenBlocks } = List.buildBlocks(props.items);

    super({
      className: props.className ?? '',
      ...childrenBlocks,
    });

    this.setLists({
      listItems: elementBlocks,
    });

    this._itemBlocksById = {};
    elementBlocks.forEach((it, idx) => {
      const block = (it as unknown as { block: Block }).block;
      const id = (props.items[idx] as ListItem).id;
      this._itemBlocksById[id] = block;
    });
  }

  static buildBlocks(items: ListItem[]) {
    const childrenBlocks: Record<string, Block> = {};
    const elementBlocks = items.map((item) => {
      let block: Block;

      if (item.isButton) {
        block = new Button({
          id: `${item.id}-btn`,
          type: 'button',
          class: 'button--primary',
          text: item.buttonName ?? 'Кнопка',
        });
      } else if (item.isEdit) {
        block = new Input({
          class: 'input__control--gray',
          type: 'text',
          id: item.id,
          name: item.id,
          placeholder: item.placeholder ?? '',
          value: item.value ?? '',
          label: item.labelList,
        });
      } else {
        block = new SpanValueBlock(item.value ?? '');
      }

      childrenBlocks[`block_${item.id}`] = block;

      return {
        label: item.labelList,
        block,
      };
    });

    return { elementBlocks, childrenBlocks };
  }

  public updateItems(items: ListItem[]) {
    const { elementBlocks, childrenBlocks } = List.buildBlocks(items);

    Object.entries(childrenBlocks).forEach(([key, block]) => {
      this.children[key] = block;
    });

    this.setLists({ listItems: elementBlocks });

    this._itemBlocksById = {};
    items.forEach((it) => {
      const blockKey = `block_${it.id}`;
      const block = childrenBlocks[blockKey];

      if (!block) return;

      this._itemBlocksById[it.id] = block;
    });
  }

  public getBlockById(id: string): Block | undefined {
    return this._itemBlocksById[id];
  }

  public getInputValues(): Record<string, string> {
    const result: Record<string, string> = {};
    Object.entries(this._itemBlocksById).forEach(([id, block]) => {
      if (block instanceof Input) {
        const el = block.getContent().querySelector('input');
        if (el) result[id] = el.value;
      }
    });
    return result;
  }

  public onButtonClick(id: string, handler: (e: Event) => void) {
    const block = this._itemBlocksById[id];
    if (block instanceof Button) {
      block.setProps({ onClick: handler });
    }
  }

  override render() {
    return listTemplate;
  }
}
