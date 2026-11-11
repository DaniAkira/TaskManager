import { useEffect, useRef, useState } from 'react';
import Highlight from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  RemoveFormatting,
  Strikethrough,
  Underline,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  HIGHLIGHT_COLORS,
  normalizeHighlight,
  sanitizeRichText,
  toEditorHtml,
  transformWordLists,
} from '@/utils/richText';

// Word e Outlook marcam texto com <span style="background: yellow">, e não com <mark>.
const Marker = Highlight.extend({
  parseHTML() {
    return [
      ...(this.parent?.() ?? []),
      {
        tag: 'span',
        getAttrs: (element) => {
          const color = normalizeHighlight(element.style.backgroundColor);
          return color ? { color } : false;
        },
      },
    ];
  },
});

function buildExtensions(placeholder) {
  return [
    StarterKit.configure({
      heading: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      link: { openOnClick: false, autolink: true, linkOnPaste: true, defaultProtocol: 'https' },
    }),
    Marker.configure({ multicolor: true }),
    Placeholder.configure({ placeholder }),
  ];
}

/** O que vai para o banco: sempre sanitizado, e vazio de verdade quando não há texto. */
function serialize(editor) {
  return editor.isEmpty ? '' : sanitizeRichText(editor.getHTML());
}

const MARKS = [
  { name: 'bold', label: 'Negrito (Ctrl+B)', icon: Bold, run: (chain) => chain.toggleBold() },
  { name: 'italic', label: 'Itálico (Ctrl+I)', icon: Italic, run: (chain) => chain.toggleItalic() },
  { name: 'underline', label: 'Sublinhado (Ctrl+U)', icon: Underline, run: (chain) => chain.toggleUnderline() },
  { name: 'strike', label: 'Riscado', icon: Strikethrough, run: (chain) => chain.toggleStrike() },
];

const LISTS = [
  { name: 'bulletList', label: 'Lista com marcadores', icon: List, run: (chain) => chain.toggleBulletList() },
  { name: 'orderedList', label: 'Lista numerada', icon: ListOrdered, run: (chain) => chain.toggleOrderedList() },
];

// Clicar na barra não pode tirar o foco do texto, senão a seleção se perde.
const keepFocus = (event) => event.preventDefault();

function ToolButton({ label, pressed, onClick, children, className }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      onMouseDown={keepFocus}
      onClick={onClick}
      className={cn(
        'flex size-7 items-center justify-center rounded-md text-ink-soft transition hover:bg-sunken hover:text-ink',
        pressed && 'bg-sunken text-ink',
        className,
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      ...Object.fromEntries([...MARKS, ...LISTS].map(({ name }) => [name, current.isActive(name)])),
      highlight: current.isActive('highlight') ? current.getAttributes('highlight').color : null,
    }),
  });

  const run = (command) => command(editor.chain().focus()).run();

  return (
    <div
      role="toolbar"
      aria-label="Formatação do texto"
      className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-line bg-surface px-1.5 py-1"
    >
      {MARKS.map(({ name, label, icon: Icon, run: command }) => (
        <ToolButton key={name} label={label} pressed={state[name]} onClick={() => run(command)}>
          <Icon aria-hidden className="size-4" />
        </ToolButton>
      ))}
      <span aria-hidden className="mx-1 h-5 w-px bg-line" />
      <span className="mr-0.5 text-[11px] font-semibold text-ink-faint">Marca-texto</span>
      {HIGHLIGHT_COLORS.map((color) => (
        <ToolButton
          key={color.value}
          label={`Marca-texto ${color.label.toLowerCase()} (Ctrl+Shift+H)`}
          pressed={state.highlight === color.value}
          onClick={() => run((chain) => chain.toggleHighlight({ color: color.value }))}
          className="size-6"
        >
          <span
            aria-hidden
            style={{ backgroundColor: color.value }}
            className={cn(
              'size-4 rounded-full ring-1 ring-black/15',
              state.highlight === color.value && 'ring-2 ring-ink',
            )}
          />
        </ToolButton>
      ))}
      <span aria-hidden className="mx-1 h-5 w-px bg-line" />
      {LISTS.map(({ name, label, icon: Icon, run: command }) => (
        <ToolButton key={name} label={label} pressed={state[name]} onClick={() => run(command)}>
          <Icon aria-hidden className="size-4" />
        </ToolButton>
      ))}
      <ToolButton
        label="Limpar formatação"
        onClick={() => run((chain) => chain.unsetAllMarks().clearNodes())}
      >
        <RemoveFormatting aria-hidden className="size-4" />
      </ToolButton>
    </div>
  );
}

/**
 * Editor de texto com formatação, que mantém negrito, marca-texto e listas ao colar do
 * Word ou de um e-mail. `toolbar="focus"` mostra a barra só durante a edição (detalhe);
 * `toolbar="always"`, o tempo todo (formulário). Carregado sob demanda: o board não paga
 * pelo ProseMirror até alguém abrir uma tarefa.
 */
export default function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  labelledBy,
  label,
  toolbar = 'always',
  minHeight = 'min-h-24',
  invalid = false,
}) {
  const handlers = useRef({ onChange, onBlur });
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    handlers.current = { onChange, onBlur };
  }, [onChange, onBlur]);

  const editor = useEditor(
    {
      extensions: buildExtensions(placeholder),
      content: toEditorHtml(value),
      editorProps: {
        attributes: {
          class: cn('rich-text px-3 py-2 text-sm leading-relaxed focus:outline-none', minHeight),
          role: 'textbox',
          'aria-multiline': 'true',
          ...(label && { 'aria-label': label }),
          ...(labelledBy && { 'aria-labelledby': labelledBy }),
        },
        transformPastedHTML: transformWordLists,
      },
      onUpdate: ({ editor: current }) => handlers.current.onChange?.(serialize(current)),
      onFocus: () => setFocused(true),
      onBlur: ({ editor: current }) => {
        setFocused(false);
        handlers.current.onBlur?.(serialize(current));
      },
    },
    [],
  );

  // Atualizações em tempo real (outro membro editando) só entram se ninguém estiver digitando aqui.
  // Numa remontagem, o efeito pode rodar com a instância antiga, já destruída.
  useEffect(() => {
    if (!editor || editor.isDestroyed || editor.isFocused) return;
    const incoming = value ? sanitizeRichText(toEditorHtml(value)) : '';
    if (incoming !== serialize(editor)) editor.commands.setContent(toEditorHtml(value), { emitUpdate: false });
  }, [editor, value]);

  const showToolbar = toolbar === 'always' || focused;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border transition',
        toolbar === 'always'
          ? 'border-line bg-surface hover:border-ink-faint'
          : 'border-transparent hover:bg-sunken/60',
        focused && 'border-accent bg-surface ring-2 ring-accent/25 hover:bg-surface',
        invalid && 'border-accent',
      )}
    >
      {editor && showToolbar && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
