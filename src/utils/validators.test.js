import { describe, expect, it } from 'vitest';
import { isPasswordValid, passwordScore } from './password';
import { isValidEmail, normalizeEmail } from './validators';

describe('e-mail', () => {
  it('aceita formatos comuns', () => {
    expect(isValidEmail('ana.souza+tag@empresa.com.br')).toBe(true);
  });

  it.each(['sem-arroba', 'a@b', 'a b@c.com', 'a@b.c', 'a/b@c.com'])('rejeita %s', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });

  it('normaliza caixa e espaços', () => {
    expect(normalizeEmail('  Ana@Empresa.COM ')).toBe('ana@empresa.com');
  });
});

describe('senha', () => {
  it('exige tamanho, maiúscula, minúscula e número', () => {
    expect(isPasswordValid('Abcdefg1')).toBe(true);
    expect(isPasswordValid('abcdefg1')).toBe(false);
    expect(isPasswordValid('ABCDEFG1')).toBe(false);
    expect(isPasswordValid('Abcdefgh')).toBe(false);
    expect(isPasswordValid('Abc1')).toBe(false);
  });

  it('pontua senhas longas e com símbolos acima do mínimo', () => {
    expect(passwordScore('')).toBe(0);
    expect(passwordScore('abc')).toBe(0);
    expect(passwordScore('fraca1')).toBe(1);
    expect(passwordScore('Abcdefg1')).toBe(2);
    expect(passwordScore('Abcdefg1!')).toBe(3);
    expect(passwordScore('Abcdefg1!long')).toBe(4);
  });
});
