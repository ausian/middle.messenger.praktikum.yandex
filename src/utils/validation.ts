export type FieldName =
  | 'first_name'
  | 'second_name'
  | 'login'
  | 'email'
  | 'password'
  | 'phone'
  | 'message'
  | 'oldPassword'
  | 'newPassword';

type Validator = {
  optional?: boolean;
  test: (value: string) => boolean;
  message: string;
  emptyMessage?: string;
};

const latinOrCyrillicName = /^[A-ZА-ЯЁ][A-Za-zА-Яа-яЁё-]*$/;

const passwordRule: Validator = {
  test: (value: string) => /^(?=.*[A-Z])(?=.*\d).{8,40}$/.test(value),
  message: 'Пароль: 8-40 символов, минимум одна заглавная буква и одна цифра.',
};

const validators: Record<FieldName, Validator> = {
  first_name: {
    test: (value: string) => latinOrCyrillicName.test(value),
    message:
      'Допустимы только латиница или кириллица, первая буква заглавная. Разрешён дефис.',
  },
  second_name: {
    optional: true,
    test: (value: string) => latinOrCyrillicName.test(value),
    message:
      'Допустимы только латиница или кириллица, первая буква заглавная. Разрешён дефис.',
  },
  login: {
    test: (value: string) => /^(?=.*[A-Za-z])[A-Za-z0-9_-]{3,20}$/.test(value),
    message:
      'Логин: 3-20 символов, латиница, допускаются цифры, дефис и подчёркивание.',
  },
  email: {
    test: (value: string) =>
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/.test(value),
    message:
      'Введите корректный email: латиница, "@" и точка с буквами после неё.',
  },
  password: passwordRule,
  phone: {
    test: (value: string) => /^\+?\d{10,15}$/.test(value),
    message: 'Телефон: от 10 до 15 цифр, может начинаться с +.',
  },
  message: {
    test: (value: string) => value.trim().length > 0,
    message: 'Сообщение не должно быть пустым.',
    emptyMessage: 'Сообщение не должно быть пустым.',
  },
  oldPassword: passwordRule,
  newPassword: passwordRule,
};

export type ValidationResult = {
  name: string;
  error: string | null;
};

export const validateField = (
  name: string,
  value: FormDataEntryValue | null,
): string | null => {
  if (typeof value === 'undefined' || value === null) return null;

  const stringValue = typeof value === 'string' ? value : String(value);
  const validator = validators[name as FieldName];

  if (!validator) return null;

  if (!stringValue.trim()) {
    if (validator.optional) return null;
    return validator.emptyMessage ?? 'Поле не должно быть пустым.';
  }

  return validator.test(stringValue) ? null : validator.message;
};

export const validateFormElement = (
  form: HTMLFormElement,
): ValidationResult[] => {
  const results: ValidationResult[] = [];
  const formData = new FormData(form);

  Object.keys(validators).forEach((name) => {
    const value = formData.get(name);
    const error = validateField(name, value);
    if (error) {
      results.push({ name, error });
    }
  });

  return results;
};
