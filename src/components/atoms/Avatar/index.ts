import Block, { type BlockProps } from '../../../framework/Block.ts';
import avatarTemplate from './Avatar.hbs?raw';
import './Avatar.pcss';

interface AvatarProps extends BlockProps {
  src?: string | undefined;
  author?: string | undefined;
  initial?: string | undefined;
}

export class Avatar extends Block<AvatarProps> {
  constructor(props: AvatarProps) {
    const raw = (props.author ?? '').trim();
    const initial = raw ? raw.charAt(0).toUpperCase() : undefined;

    super({
      ...props,
      initial,
    });
  }

  override render() {
    return avatarTemplate;
  }
}
