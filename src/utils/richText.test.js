// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  isRichText,
  normalizeHighlight,
  sanitizeRichText,
  toEditorHtml,
  transformWordLists,
} from './richText';

describe('sanitizeRichText', () => {
  it('mantém a formatação permitida', () => {
    const html = '<p><strong>Negrito</strong> <em>itálico</em> <u>sub</u> <s>risc</s></p><ul><li><p>item</p></li></ul>';
    expect(sanitizeRichText(html)).toBe(html);
  });

  it('remove scripts, eventos e tags fora da lista', () => {
    const dirty = '<p onclick="alert(1)">oi<script>alert(1)</script><img src=x onerror=alert(1)><iframe src="//x"></iframe></p>';
    expect(sanitizeRichText(dirty)).toBe('<p>oi</p>');
  });

  it('bloqueia links javascript e força abrir em nova aba', () => {
    expect(sanitizeRichText('<p><a href="javascript:alert(1)">x</a></p>')).toBe(
      '<p><a target="_blank" rel="noopener noreferrer">x</a></p>',
    );
    expect(sanitizeRichText('<p><a href="mailto:a@b.com">a@b.com</a></p>')).toBe(
      '<p><a href="mailto:a@b.com" target="_blank" rel="noopener noreferrer">a@b.com</a></p>',
    );
  });

  it('do CSS, só deixa o fundo do marca-texto', () => {
    const html = '<p><mark data-color="yellow" style="background-color: yellow; color: inherit; font-size: 40px">x</mark><span style="color:red">y</span></p>';
    expect(sanitizeRichText(html)).toBe(
      '<p><mark data-color="#fde047" style="background-color: #fde047">x</mark>y</p>',
    );
  });

  it('descarta CSS perigoso no marca-texto', () => {
    const html = '<p><mark style="background-color: url(https://x.test/track)">x</mark></p>';
    expect(sanitizeRichText(html)).toBe('<p><mark>x</mark></p>');
  });
});

describe('normalizeHighlight', () => {
  it('leva cores do Word para a paleta e ignora fundo branco', () => {
    expect(normalizeHighlight('yellow')).toBe('#fde047');
    expect(normalizeHighlight('#ABCDEF')).toBe('#abcdef');
    expect(normalizeHighlight('white')).toBeNull();
    expect(normalizeHighlight('#ffffff')).toBeNull();
    expect(normalizeHighlight('rgba(0, 0, 0, 0)')).toBeNull();
  });
});

describe('texto antigo', () => {
  it('reconhece HTML do editor e texto puro', () => {
    expect(isRichText('<p>oi</p>')).toBe(true);
    expect(isRichText('linha 1\nlinha 2')).toBe(false);
    expect(isRichText('a < b')).toBe(false);
  });

  it('converte quebras de linha em parágrafos, escapando o texto', () => {
    expect(toEditorHtml('linha 1\n<b>2</b>')).toBe('<p>linha 1</p><p>&lt;b&gt;2&lt;/b&gt;</p>');
    expect(toEditorHtml('')).toBe('');
  });
});

describe('transformWordLists', () => {
  const word = (marker, text) =>
    `<p class="MsoListParagraphCxSpMiddle" style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">${marker}<span>&nbsp;&nbsp;</span></span>${text}</p>`;

  it('transforma marcadores do Word em lista', () => {
    const html = `<p class="MsoNormal">Antes</p>${word('·', 'Um')}${word('·', 'Dois')}<p class="MsoNormal">Depois</p>`;
    expect(transformWordLists(html)).toBe(
      '<p class="MsoNormal">Antes</p><ul><li><p>Um</p></li><li><p>Dois</p></li></ul><p class="MsoNormal">Depois</p>',
    );
  });

  it('reconhece lista numerada', () => {
    expect(transformWordLists(word('1.', 'Primeiro'))).toBe('<ol><li><p>Primeiro</p></li></ol>');
  });

  it('não mexe em HTML que não veio do Word', () => {
    expect(transformWordLists('<p>oi</p>')).toBe('<p>oi</p>');
  });
});
