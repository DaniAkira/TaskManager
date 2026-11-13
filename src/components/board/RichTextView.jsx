import { useMemo } from 'react';
import { cn } from '@/utils/cn';
import { applyEmailSpacing, isRichText, sanitizeRichText } from '@/utils/richText';

// Dentro do post-it, que já é um botão, links viram texto com cara de link:
// um link ali seria um elemento clicável dentro de outro, e entraria no Tab.
function linksAsText(html) {
  return html.replace(/<a\b[^>]*>/g, '<span class="rich-link">').replace(/<\/a>/g, '</span>');
}

// Mesma cópia do editor: margens explícitas para o texto colar certo no Outlook.
function copyForEmail(event) {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) return;
  const container = document.createElement('div');
  container.append(selection.getRangeAt(0).cloneContents());
  applyEmailSpacing(container);
  event.clipboardData.setData('text/html', container.innerHTML);
  event.clipboardData.setData('text/plain', selection.toString() || container.textContent);
  event.preventDefault();
}

/**
 * Exibe o texto formatado sem carregar o editor. O HTML sempre passa pelo sanitizador;
 * texto puro de antes do editor é mostrado como texto, sem passar por innerHTML.
 */
export function RichTextView({ value, placeholder, plainLinks = false, className }) {
  const html = useMemo(() => {
    if (!isRichText(value)) return null;
    const clean = sanitizeRichText(value);
    return plainLinks ? linksAsText(clean) : clean;
  }, [value, plainLinks]);

  if (!value) return placeholder ? <p className={cn('text-ink-faint', className)}>{placeholder}</p> : null;
  if (!html) return <div className={cn('rich-text whitespace-pre-line', className)}>{value}</div>;
  return <div onCopy={copyForEmail} className={cn('rich-text', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
