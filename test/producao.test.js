import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Login publicado não contém as credenciais didáticas', () => {
  const source = readFileSync(new URL('../src/pages/Login.jsx', import.meta.url), 'utf8');
  assert.equal(source.includes('123456'), false);
  assert.equal(source.includes('alice@email.com'), false);
});
