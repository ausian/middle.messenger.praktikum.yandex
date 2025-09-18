import Block from '../../../framework/Block.ts';
import avatarProfileTemplate from './AvatarProfile.hbs?raw';
import './AvatarProfile.pcss';

export interface AvatarProfileProps {
  src?: string;
  icon: string;
  onChange?: (e: Event) => void;
}

export class AvatarProfile extends Block<AvatarProfileProps> {
  constructor(props: AvatarProfileProps) {
    super({
      ...props,
      events: {
        change: (e: Event) => props.onChange?.(e),
      },
    });
  }

  override render() {
    return avatarProfileTemplate;
  }
}
