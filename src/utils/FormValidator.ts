import type Block from '../framework/Block.ts';
import type { Input } from '../components/atoms/Input/index.ts';
import { validateField, type FieldName } from './validation.ts';

type FieldsMap = Partial<Record<FieldName, Input>>;

export default class FormValidator {
  private form: HTMLFormElement;

  private fields: FieldsMap;

  private blurHandler: (event: FocusEvent) => void;

  private submitHandler: (event: Event) => void;

  private clickHandler: (event: MouseEvent) => void;

  constructor(formBlock: Block, fields: FieldsMap) {
    const formElement = formBlock.element as HTMLFormElement | null;
    if (!formElement) throw new Error('Form element is not available');

    this.form = formElement;
    this.fields = fields;

    this.blurHandler = this.handleBlur.bind(this);
    this.submitHandler = this.handleSubmit.bind(this);
    this.clickHandler = this.handleClick.bind(this);

    this.attach();
  }

  private attach(): void {
    this.form.addEventListener('focusout', this.blurHandler);
    this.form.addEventListener('submit', this.submitHandler, true);
    this.form.addEventListener('click', this.clickHandler, true);
  }

  private handleBlur(event: FocusEvent): void {
    const target = event.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    if (!target || !target.name) return;

    this.runValidation(target.name as FieldName, target.value);
  }

  private handleSubmit(event: Event): void {
    let hasErrors = false;

    Object.entries(this.fields).forEach(([name, input]) => {
      if (!input) return;
      const element = this.form.elements.namedItem(name);
      const value =
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
          ? element.value
          : '';
      const error = this.runValidation(name as FieldName, value);
      if (error) hasErrors = true;
    });

    if (hasErrors) event.preventDefault();
  }

  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const submitControl = target.closest(
      'button[type="submit"], input[type="submit"]',
    );

    if (
      !submitControl ||
      !(
        submitControl instanceof HTMLButtonElement ||
        submitControl instanceof HTMLInputElement
      ) ||
      submitControl.form !== this.form
    ) {
      return;
    }

    let hasErrors = false;

    Object.entries(this.fields).forEach(([name]) => {
      const element = this.form.elements.namedItem(name);
      const value =
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
          ? element.value
          : '';
      const error = this.runValidation(name as FieldName, value);
      if (error) hasErrors = true;
    });

    if (hasErrors) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }

  private runValidation(name: FieldName, value: string): string | null {
    const error = validateField(name, value);
    const input = this.fields[name];

    if (input) {
      const isMessageField = name === 'message';
      const currentProps = input.getProps();
      const originalPlaceholder = currentProps.placeholderPersistent;
      const currentPlaceholder = currentProps.placeholder;

      input.setProps({
        error: error ?? undefined,
        value,
        placeholder:
          isMessageField && error
            ? error
            : isMessageField
              ? originalPlaceholder ?? currentPlaceholder
              : currentPlaceholder,
        hideError: isMessageField
          ? Boolean(error)
          : currentProps.hideError ?? undefined,
      });
    }

    return error;
  }
}
