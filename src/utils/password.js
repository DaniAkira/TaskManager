export const PASSWORD_RULES = [
  { id: 'length', label: 'Pelo menos 8 caracteres', test: (p) => p.length >= 8 },
  { id: 'lower', label: 'Uma letra minúscula', test: (p) => /[a-z]/.test(p) },
  { id: 'upper', label: 'Uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { id: 'digit', label: 'Um número', test: (p) => /\d/.test(p) },
];

export const STRENGTH_LEVELS = [
  { label: 'Muito fraca', tone: 'bg-rose-600' },
  { label: 'Fraca', tone: 'bg-orange-500' },
  { label: 'Razoável', tone: 'bg-amber-500' },
  { label: 'Boa', tone: 'bg-lime-600' },
  { label: 'Forte', tone: 'bg-emerald-600' },
];

export function isPasswordValid(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

/** Retorna de 0 a 4. Tamanho e símbolos pesam além das regras mínimas. */
export function passwordScore(password) {
  if (!password) return 0;
  const met = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  if (met < PASSWORD_RULES.length) return met > 1 ? 1 : 0;
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  if (password.length >= 12 && hasSymbol) return 4;
  return password.length >= 12 || hasSymbol ? 3 : 2;
}
