import { useMemo } from 'react';
import { cn } from '@/utils/cn';
import { isRichText, sanitizeRichText } from '@/utils/richText';

// Dentro do post-it, que já é um botão, links viram texto com cara de link:
// um link ali seria um elemento clicável dentro de outro, e entraria no Tab.
function linksAsText(html) {
  return html.replace(/<a\b[^>]*>/g, '<span class="rich-link">').replace(/<\/a>/g, '</span>');
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
  return <div className={cn('rich-text', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
