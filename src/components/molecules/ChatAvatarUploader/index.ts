import Block, { type BlockProps } from '../../../framework/Block.ts';
import { Avatar } from '../../atoms/Avatar/index.ts';
import chatAvatarUploaderTemplate from './ChatAvatarUploader.hbs?raw';
import './ChatAvatarUploader.pcss';

export interface ChatAvatarUploaderProps extends BlockProps {
  author?: string | undefined;
  src?: string | undefined;
  hint?: string | undefined;
  disabled?: boolean;
  onSelect?: ((file: File) => void) | undefined;
  icon?: string | undefined;
}

export class ChatAvatarUploader extends Block<ChatAvatarUploaderProps> {
  private avatar: Avatar;

  constructor(props: ChatAvatarUploaderProps) {
    const {
      author,
      src,
      hint,
      disabled,
      onSelect,
      icon,
      events,
      ...rest
    } = props;

    const originalChange = events?.change;

    const handleChange = (event: Event) => {
      if (typeof originalChange === 'function') {
        originalChange(event);
      } else if (
        originalChange
        && typeof originalChange === 'object'
        && 'handleEvent' in originalChange
        && typeof originalChange.handleEvent === 'function'
      ) {
        originalChange.handleEvent(event);
      }

      if (event.defaultPrevented) {
        return;
      }

      this.handleFileChange(event);
    };

    const mergedEvents: Record<string, EventListenerOrEventListenerObject> = {
      ...(events ?? {}),
      change: handleChange,
    };

    const avatar = new Avatar({
      author,
      src,
    });

    super({
      ...rest,
      author,
      src,
      hint: icon ? undefined : (hint ?? 'Изменить'),
      disabled: Boolean(disabled),
      onSelect,
      icon,
      events: mergedEvents,
      Avatar: avatar,
    });

    this.avatar = avatar;
  }

  override componentDidUpdate(
    oldProps: ChatAvatarUploaderProps,
    newProps: ChatAvatarUploaderProps,
  ): boolean {
    if (oldProps.author !== newProps.author || oldProps.src !== newProps.src) {
      this.avatar.setProps({
        author: newProps.author,
        src: newProps.src,
      });
    }

    return true;
  }

  private handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input || input.type !== 'file') {
      return;
    }

    const { disabled, onSelect } = this.props;

    if (disabled) {
      input.value = '';
      return;
    }

    const file = input.files?.[0] ?? null;
    if (!file) {
      return;
    }

    onSelect?.(file);
    input.value = '';
  }

  override render() {
    return chatAvatarUploaderTemplate;
  }
}

export default ChatAvatarUploader;
