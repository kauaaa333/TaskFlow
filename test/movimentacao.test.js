import { test } from 'node:test';
import assert from 'node:assert/strict';
import { persistirMovimento } from '../src/movimentacao.js';

const tarefa = { id: 2, coluna: 'afazer' };

test('Envia apenas a coluna e usa a tarefa confirmada pela API', async () => {
  const confirmada = { ...tarefa, coluna: 'concluido' };
  const api = { async put(url, body) {
    assert.equal(url, '/tarefas/2');
    assert.deepEqual(body, { coluna: 'concluido' });
    return { data: confirmada };
  } };
  assert.equal(await persistirMovimento(api, tarefa, 'concluido'), confirmada);
  assert.equal(tarefa.coluna, 'afazer');
});

test('Ignora destino inválido, mesma coluna e tarefa ausente', async () => {
  const api = { put() { assert.fail('Não deve chamar a API'); } };
  assert.equal(await persistirMovimento(api, tarefa, 'afazer'), null);
  assert.equal(await persistirMovimento(api, tarefa, 'invalida'), null);
  assert.equal(await persistirMovimento(api, null, 'concluido'), null);
});

test('Falha da API é propagada sem mudar a coluna original', async () => {
  const api = { async put() { throw new Error('Limite atingido'); } };
  await assert.rejects(persistirMovimento(api, tarefa, 'andamento'), /Limite atingido/);
  assert.equal(tarefa.coluna, 'afazer');
});
