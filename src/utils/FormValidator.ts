import type { Input } from '../components/atoms/Input/index.ts';
import { validateField, type FieldName } from './validation.ts';

type FieldsMap = Partial<Record<FieldName, Input>>;

export default class FormValidator {
  private fields: FieldsMap;

  constructor(fields: FieldsMap) {
    this.fields = fields;
  }

  public handleBlur: EventListener = (event) => {
    const focusEvent = event as FocusEvent;
    const target = focusEvent.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;

    if (!target || !target.name) return;

    this.runValidation(target.name as FieldName, target.value);
  };

  public handleSubmit: EventListener = (event) => {
    const form = event.currentTarget as HTMLFormElement | null;
    if (!form) return;

    let hasErrors = false;

    Object.entries(this.fields).forEach(([name]) => {
      const value = this.getFieldValue(form, name);
      const error = this.runValidation(name as FieldName, value);
      if (error) hasErrors = true;
    });

    if (hasErrors) {
      event.preventDefault();
    }
  };

  public handleClick: EventListener = (event) => {
    const mouseEvent = event as MouseEvent;
    const form = mouseEvent.currentTarget as HTMLFormElement | null;
    if (!form) return;

    const target = mouseEvent.target as HTMLElement | null;
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
      submitControl.form !== form
    ) {
      return;
    }

    let hasErrors = false;

    Object.entries(this.fields).forEach(([name]) => {
      const value = this.getFieldValue(form, name);
      const error = this.runValidation(name as FieldName, value);
      if (error) hasErrors = true;
    });

    if (hasErrors) {
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      mouseEvent.stopImmediatePropagation();
    }
  };

  private getFieldValue(form: HTMLFormElement, name: string): string {
    const element = form.elements.namedItem(name);

    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      return element.value;
    }

    return '';
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
              ? (originalPlaceholder ?? currentPlaceholder)
              : currentPlaceholder,
        hideError: isMessageField
          ? Boolean(error)
          : (currentProps.hideError ?? undefined),
      });
    }

    return error;
  }
}
