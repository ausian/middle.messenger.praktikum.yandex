const getFormDataFromButton = (
  event: Event,
): Record<string, FormDataEntryValue> | void => {
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

  if (!formElement) return;

  const formData = new FormData(formElement);
  const data: Record<string, FormDataEntryValue> = {};

  formData.forEach((value, key) => {
    data[key] = value;
  });

  console.log(data);
  return data;
};

export default getFormDataFromButton;
