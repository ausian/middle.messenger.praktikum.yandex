import Block from '../../../framework/Block.ts';
import listTemplate from './MessageList.hbs?raw';
import './MessageList.pcss';
import { Message, type MessageProps } from '../../atoms/Message/index.ts';

export type MessageListItem = Message | string;

export interface MessageListProps {
  data?: Array<
    | {
        date: string;
        text?: undefined;
        time?: undefined;
        author?: undefined;
        outgoing?: undefined;
      }
    | (MessageProps & { date?: undefined })
  >;
}

function dateBadge(date: string): string {
  return `<div class="message-list__date-badge">${date}</div>`;
}

export class MessageList extends Block {
  constructor(props: MessageListProps = {}) {
    const items: MessageListItem[] = [];

    const mock: Required<MessageListProps>['data'] = props.data ?? [
      { date: 'Вчера' },
      { text: 'Привет! Как дела?', time: '09:30', author: 'Иван Петров' },
      { text: 'Привет! Всё ок, а ты?', time: '09:31', outgoing: true },
      {
        text: 'Тоже хорошо. Встреча в 17:30 в силе?',
        time: '09:32',
        author: 'Иван Петров',
      },
      { text: 'Да, подтверждаю. До встречи!', time: '09:33', outgoing: true },
      {
        text: 'Кстати, я вчера отправила тебе документы.',
        time: '09:34',
        author: 'Иван Петров',
      },
      { text: 'Видел, спасибо, вечером гляну.', time: '09:40', outgoing: true },
      {
        text: 'Если будут вопросы — спрашивай.',
        time: '09:41',
        author: 'Иван Петров',
      },
      { text: 'Ок, отпишусь после просмотра.', time: '09:42', outgoing: true },
      { text: 'Удачного дня!', time: '09:43', author: 'Иван Петров' },
      { text: 'Спасибо, тебе тоже!', time: '09:44', outgoing: true },
      {
        text: 'Кстати, напомни про презентацию.',
        time: '09:45',
        author: 'Иван Петров',
      },
      {
        text: 'Да, делаю, отправлю черновик к пятнице.',
        time: '09:47',
        outgoing: true,
      },
      { text: 'Ок, если что, пиши.', time: '09:48', author: 'Иван Петров' },
      { text: 'Хорошо, на связи.', time: '09:49', outgoing: true },
      { text: 'Ты успеваешь к вечеру?', time: '15:10', author: 'Иван Петров' },
      { text: 'Да, никаких изменений.', time: '15:11', outgoing: true },
      { date: 'Сегодня' },
      { text: 'Гляну макеты вечером', time: '18:10', outgoing: true },
      { text: 'Добро, жду обратную связь.', time: '18:11', author: 'Иван Петров' },
      {
        text: 'Ты получил последние комментарии от команды?',
        time: '18:15',
        author: 'Иван Петров',
      },
      {
        text: 'Да, сейчас вношу правки, скину финальную версию завтра.',
        time: '18:16',
        outgoing: true,
      },
      { text: 'Отлично, спасибо.', time: '18:17', author: 'Иван Петров' },
      {
        text: 'Если появятся срочные задачи — напишу.',
        time: '18:20',
        author: 'Иван Петров',
      },
      { text: 'Хорошо, на связи.', time: '18:21', outgoing: true },
      {
        text: 'Кстати, после проверки макетов нужно обсудить сроки.',
        time: '18:23',
        author: 'Иван Петров',
      },
      {
        text: 'Давай спишемся по итогам завтра.',
        time: '18:24',
        outgoing: true,
      },
      {
        text: 'Ок, поставлю себе напоминание.',
        time: '18:25',
        author: 'Иван Петров',
      },
      { text: 'Планёрка всё ещё в 11:00?', time: '18:26', outgoing: true },
      {
        text: 'Да, никаких изменений. Подключайся как обычно.',
        time: '18:27',
        author: 'Иван Петров',
      },
      { text: 'Хорошо, до завтра.', time: '18:28', outgoing: true },
    ];

    mock.forEach((entry) => {
      if ('date' in entry && entry.date) {
        items.push(dateBadge(entry.date));
      } else {
        items.push(new Message(entry as MessageProps));
      }
    });

    super({});
    this.setLists({ items });
  }

  override render() {
    return listTemplate;
  }
}
