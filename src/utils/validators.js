// A barra é excluída porque o e-mail compõe o ID do documento de convite.
// Vírgula e ponto e vírgula costumam ser erro de digitação no lugar do ponto.
const EMAIL_PATTERN = /^[^\s@/,;]+@[^\s@/,;]+\.[^\s@/,;]{2,}$/;

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(email.trim());
}

export function isBlank(text) {
  return text.trim().length === 0;
}
