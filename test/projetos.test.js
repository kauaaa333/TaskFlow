import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cadastrarProjeto } from '../src/projetos.js';

test('Projeto é criado com nome limpo e sem proprietário fornecido pelo cliente', async () => {
  const projeto = { id: 25, nome: 'Meu projeto', usuarioId: 12 };
  const api = { async post(url, body) {
    assert.equal(url, '/projetos');
    assert.deepEqual(body, { nome: 'Meu projeto' });
    return { data: projeto };
  } };
  assert.equal(await cadastrarProjeto(api, '  Meu projeto  '), projeto);
});

test('Nome vazio ou acima do limite não chega à API', async () => {
  const api = { post() { assert.fail('Não deve enviar nome inválido'); } };
  await assert.rejects(cadastrarProjeto(api, '   '), /Informe o nome/);
  await assert.rejects(cadastrarProjeto(api, 'a'.repeat(101)), /100 caracteres/);
});

test('Conflito ou falha da API é propagado para o formulário', async () => {
  const erro = { response: { status: 409, data: { erro: 'Projeto já cadastrado' } } };
  const api = { async post() { throw erro; } };
  await assert.rejects(cadastrarProjeto(api, 'Duplicado'), e => e === erro);
});
