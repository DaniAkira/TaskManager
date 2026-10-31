const MESSAGES = {
  'permission-denied': 'Você não tem permissão para fazer isso.',
  unavailable: 'Sem conexão com o servidor. Tente novamente.',
  'not-found': 'Este item não existe mais.',
  'resource-exhausted': 'Limite de uso atingido. Tente mais tarde.',
};

export function friendlyError(error) {
  return MESSAGES[error?.code] ?? 'Algo deu errado. Tente novamente.';
}
