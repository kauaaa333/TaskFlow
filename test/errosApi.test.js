import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mensagemErroApi, mensagensDeErro } from '../src/errosApi.js';

test('Lê mensagem e detalhes UC14 como texto para o React', () => {
  const erro = { response: { data: { erro: { mensagem: 'Dados inválidos', detalhes: ["O campo 'texto' é obrigatório"] } } } };
  assert.equal(mensagemErroApi(erro), "Dados inválidos · O campo 'texto' é obrigatório");
});
test('Mantém compatibilidade com mensagem antiga', () => {
  assert.equal(mensagemErroApi({ response: { data: { erro: 'Credenciais inválidas' } } }), 'Credenciais inválidas');
});
test('Mantém compatibilidade com a lista antiga de validação', () => {
  assert.equal(mensagemErroApi({ response: { data: { erros: ['Campo inválido'] } } }), 'Campo inválido');
});
test('Respostas inesperadas nunca devolvem um objeto para renderização', () => {
  assert.equal(mensagemErroApi({ response: { data: { erro: { mensagem: {}, detalhes: [{ sql: 'interno' }, null] } } } }, 'Falha'), 'Falha');
});
test('Falha de rede usa a mensagem apropriada à operação', () => {
  assert.equal(mensagemErroApi(new Error('Network Error'), 'Erro ao salvar tarefa.'), 'Erro ao salvar tarefa.');
});

test('Dia 3: detalhes da validação são uma lista sem a mensagem genérica duplicada', () => {
  const detalhes = ["O campo 'texto' é obrigatório", "O campo 'usuarioId' deve ser um inteiro positivo"];
  assert.deepEqual(mensagensDeErro({ response: { data: { erro: { mensagem: 'Dados inválidos', detalhes } } } }), detalhes);
});

test('Dia 3: conexão indisponível e timeout têm a mensagem pedida no modal', () => {
  assert.deepEqual(mensagensDeErro(new Error('Network Error')), ['Não foi possível conectar à API.']);
  assert.deepEqual(mensagensDeErro({ code: 'ECONNABORTED' }), ['Não foi possível conectar à API.']);
});

test('Dia 3: credenciais inválidas e erros internos preservam a mensagem da API', () => {
  for (const mensagem of ['Credenciais inválidas', 'Erro interno no servidor']) {
    assert.deepEqual(mensagensDeErro({ response: { data: { erro: { mensagem } } } }), [mensagem]);
  }
});

test('Dia 3: dados inesperados nunca entram na lista de mensagens', () => {
  assert.deepEqual(mensagensDeErro({ response: { data: { erro: { detalhes: [{ sql: 'segredo' }, null, ' '] } } } }), ['Não foi possível concluir a operação.']);
});
