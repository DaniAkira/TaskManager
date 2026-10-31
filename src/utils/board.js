export const ROLE = { OWNER: 'owner', EDITOR: 'editor', VIEWER: 'viewer' };

export const ROLE_LABELS = {
  [ROLE.OWNER]: 'Dono',
  [ROLE.EDITOR]: 'Pode editar',
  [ROLE.VIEWER]: 'Só visualiza',
};

export function roleOf(board, uid) {
  return board?.members?.[uid]?.role ?? null;
}

export function canEditBoard(board, uid) {
  const role = roleOf(board, uid);
  return role === ROLE.OWNER || role === ROLE.EDITOR;
}

export function isBoardOwner(board, uid) {
  return board?.ownerId === uid;
}

export function membersOf(board) {
  return Object.entries(board?.members ?? {})
    .map(([uid, member]) => ({ uid, ...member }))
    .sort((a, b) => (a.role === ROLE.OWNER ? -1 : b.role === ROLE.OWNER ? 1 : a.name.localeCompare(b.name)));
}

export function initials(name = '') {
  const parts = name.trim().split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '')).toUpperCase();
}

/** Inclinação estável de cada post-it, derivada do ID, para o mural não parecer uma planilha. */
export function tiltFor(id) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return `${((Math.abs(hash) % 13) - 6) / 10}deg`;
}
