// Roda antes do primeiro paint para evitar o flash de tema errado.
// Fica em arquivo próprio para a CSP não precisar liberar script inline.
(function () {
  var theme = null;
  try {
    theme = localStorage.getItem('mural:theme');
  } catch {
    // Armazenamento bloqueado: segue a preferência do sistema.
  }
  if (theme !== 'light' && theme !== 'dark') {
    theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.classList.toggle('dark', theme === 'dark');
})();
