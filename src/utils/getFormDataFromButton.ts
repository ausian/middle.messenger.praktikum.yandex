export type FormDataValues = Partial<Record<string, string>>;

const getFormDataFromButton = (event: Event): FormDataValues | null => {
  event.preventDefault();

  const currentTarget = event.currentTarget as
    | HTMLFormElement
    | HTMLButtonElement
    | HTMLInputElement
    | null;

  const formElement =
    currentTarget instanceof HTMLFormElement
      ? currentTarget
      : currentTarget?.form ?? null;

  if (!formElement) return null;

  const formData = new FormData(formElement);
  const data: FormDataValues = {};

  formData.forEach((value, key) => {
    data[key] = typeof value === 'string' ? value : String(value);
  });

  return data;
};

export default getFormDataFromButton;
