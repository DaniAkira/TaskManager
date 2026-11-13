import DOMPurify from 'dompurify';

// Tons claros: o texto marcado fica sempre escuro, então funcionam nos dois temas.
export const HIGHLIGHT_COLORS = [
  { value: '#fde047', label: 'Amarelo' },
  { value: '#86efac', label: 'Verde' },
  { value: '#7dd3fc', label: 'Azul' },
  { value: '#f9a8d4', label: 'Rosa' },
  { value: '#fdba74', label: 'Laranja' },
];

// Nomes que o Word e o Outlook usam no marca-texto, levados para a paleta do app.
const NAMED_HIGHLIGHTS = {
  yellow: '#fde047',
  lime: '#86efac',
  green: '#86efac',
  brightgreen: '#86efac',
  aqua: '#7dd3fc',
  cyan: '#7dd3fc',
  turquoise: '#7dd3fc',
  fuchsia: '#f9a8d4',
  magenta: '#f9a8d4',
  pink: '#f9a8d4',
  orange: '#fdba74',
};

const SAFE_COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i;
const NO_HIGHLIGHT = /^(#fff(fff)?|rgba?\(\s*255\s*,\s*255\s*,\s*255\s*(,\s*1\s*)?\)|rgba\(.*,\s*0\s*\))$/i;

/** Cor de marca-texto aceita, ou null para descartar (fundo branco, transparente ou CSS estranho). */
export function normalizeHighlight(value) {
  if (!value) return null;
  const color = value.trim().toLowerCase().replace(/\s*!important$/, '');
  if (NAMED_HIGHLIGHTS[color]) return NAMED_HIGHLIGHTS[color];
  if (!SAFE_COLOR.test(color) || NO_HIGHLIGHT.test(color)) return null;
  return color;
}

/** Texto salvo pelo editor; o que não começa com um bloco HTML é texto puro de antes dele. */
export function isRichText(value) {
  return /^\s*<(p|ul|ol|blockquote)[\s>]/i.test(value ?? '');
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Converte texto puro antigo em parágrafos para o editor abrir sem perder as quebras de linha. */
export function toEditorHtml(value) {
  if (!value) return '';
  if (isRichText(value)) return value;
  return value
    .split('\n')
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');
}

/** Compara dois textos pelo conteúdo final, tratando texto puro antigo como seus parágrafos. */
export function sameRichText(a, b) {
  const normalize = (value) => (value ? sanitizeRichText(toEditorHtml(value)) : '');
  return normalize(a) === normalize(b);
}

const ALLOWED_TAGS =['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'ul', 'ol', 'li', 'a', 'blockquote'];
const ALLOWED_ATTR = ['href', 'target', 'rel', 'data-color', 'style'];

let hooksInstalled = false;

function installHooks() {
  // Do CSS, só o fundo do marca-texto sobrevive; o resto (fontes, cores, url()...) é descartado.
  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    if (data.attrName !== 'style') return;
    const match = /background-color\s*:\s*([^;]+)/i.exec(data.attrValue);
    const color = node.nodeName === 'MARK' && match ? normalizeHighlight(match[1]) : null;
    if (color) data.attrValue = `background-color: ${color}`;
    else data.keepAttr = false;
  });
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.nodeName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
    if (node.hasAttribute('data-color')) {
      const color = node.nodeName === 'MARK' ? normalizeHighlight(node.getAttribute('data-color')) : null;
      if (color) node.setAttribute('data-color', color);
      else node.removeAttribute('data-color');
    }
  });
  hooksInstalled = true;
}

/** Única porta de entrada de HTML no app: roda antes de salvar e antes de exibir. */
export function sanitizeRichText(html) {
  if (!hooksInstalled) installHooks();
  return DOMPurify.sanitize(html ?? '', { ALLOWED_TAGS, ALLOWED_ATTR });
}

// Mesmo respiro entre parágrafos que o app mostra (0,45em em 14px).
const EMAIL_PARAGRAPH = 'margin:0 0 6px 0';
const EMAIL_LIST = 'margin:0 0 6px 0;padding-left:24px';
const EMAIL_LIST_ITEM = 'margin:0 0 2px 0';

/**
 * Prepara o HTML copiado para colar em e-mail. Sem margens explícitas, o Outlook aplica a
 * margem padrão de <p> (uma linha inteira) e o texto parece ter linhas em branco que não
 * dá para apagar. O marca-texto ganha cor de texto escura, como no app.
 */
export function applyEmailSpacing(root) {
  root.querySelectorAll('p').forEach((paragraph) => {
    paragraph.style.cssText = paragraph.closest('li') ? 'margin:0' : EMAIL_PARAGRAPH;
  });
  root.querySelectorAll('ul, ol').forEach((list) => {
    list.style.cssText = EMAIL_LIST;
  });
  root.querySelectorAll('li').forEach((item) => {
    item.style.cssText = EMAIL_LIST_ITEM;
  });
  root.querySelectorAll('mark').forEach((mark) => {
    mark.style.color = '#1c1917';
  });
  return root;
}

/**
 * O Word cola listas como parágrafos "MsoList" com o marcador ("·", "1.") num span
 * mso-list:Ignore. Aqui eles viram <ul>/<ol> de verdade antes de chegar ao editor.
 */
export function transformWordLists(html) {
  if (!/MsoList/i.test(html)) return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let currentList = null;

  doc.querySelectorAll('p').forEach((paragraph) => {
    if (!/MsoList/i.test(paragraph.className)) {
      currentList = null;
      return;
    }
    const markers = [...paragraph.querySelectorAll('span')].filter((span) =>
      /mso-list:\s*ignore/i.test(span.getAttribute('style') ?? ''),
    );
    const ordered = markers.some((span) => /^\s*\d+[.)]/.test(span.textContent));
    markers.forEach((span) => span.remove());

    const tag = ordered ? 'OL' : 'UL';
    const sameList = currentList && currentList.tagName === tag && currentList.nextElementSibling === paragraph;
    if (!sameList) {
      currentList = doc.createElement(tag);
      paragraph.before(currentList);
    }
    const item = doc.createElement('li');
    const content = doc.createElement('p');
    content.innerHTML = paragraph.innerHTML;
    item.append(content);
    currentList.append(item);
    paragraph.remove();
  });

  return doc.body.innerHTML;
}
