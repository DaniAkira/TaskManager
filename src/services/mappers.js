// 'estimate' evita createdAt nulo enquanto a gravação local aguarda o servidor.
export function mapDoc(snapshot) {
  return { id: snapshot.id, ...snapshot.data({ serverTimestamps: 'estimate' }) };
}

export function byCreatedAt(a, b) {
  return (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0);
}
