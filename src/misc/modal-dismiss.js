const DISMISS_TEXTS = [
  'no thanks',
  'no thank you',
  'not now',
  'maybe later',
  'skip',
  'cancel',
  'close',
  'done',
  'not interested',
  'nao obrigado',
  'não obrigado',
  'agora nao',
  'agora não',
  'talvez depois',
  'cancelar',
  'fechar'
];

const normalizeText = (value) =>
  String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const getElements = (root, selector) => {
  try {
    return Array.from(root?.querySelectorAll?.(selector) || []);
  } catch {
    return [];
  }
};

const isVisibleControl = (element) =>
  Boolean(element) && !element.disabled && element.offsetParent !== null;

const getControlText = (element) =>
  [
    element?.textContent,
    element?.getAttribute?.('aria-label'),
    element?.getAttribute?.('title'),
    element?.getAttribute?.('data-testid')
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(' ');

const isDismissControl = (element) => {
  const text = getControlText(element);
  if (!text) return false;
  return DISMISS_TEXTS.some((dismissText) => text.includes(dismissText));
};

const findDialogDismissControl = (dialog) => {
  const controls = getElements(dialog, 'button, [role="button"]');
  return controls.find((control) => isVisibleControl(control) && isDismissControl(control)) || null;
};

const clickDialogDismissControl = (dialog) => {
  const dismissControl = findDialogDismissControl(dialog);
  if (!dismissControl) return false;

  dismissControl.click();
  return true;
};

module.exports = {
  clickDialogDismissControl,
  findDialogDismissControl,
  isDismissControl
};
