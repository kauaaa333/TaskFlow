import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarApiVisitante } from '../src/visitante.js';
import { cadastrarProjeto } from '../src/projetos.js';
import { persistirMovimento } from '../src/movimentacao.js';

test('Visitante cria, move, recarrega e exclui tarefas sem mexer na sessão', async () => {
  const valores = new Map([['token', 'sessao-existente']]);
  const storage = { getItem: k => valores.get(k), setItem: (k, v) => valores.set(k, v) };
  const api = criarApiVisitante(storage);
  assert.deepEqual((await api.get('/tarefas')).data, []);
  assert.equal((await api.get('/usuarios')).data[0].administrador, undefined);
  const projeto = await cadastrarProjeto(api, 'Pessoal');
  await assert.rejects(api.post('/tarefas', { texto: ' ' }), /descrição/);
  const { data: tarefa } = await api.post('/tarefas', { texto: 'Estudar', coluna: 'afazer', projetoId: projeto.id });
  await persistirMovimento(api, tarefa, 'andamento');
  const reaberto = criarApiVisitante(storage);
  const [salva] = (await reaberto.get('/tarefas')).data;
  assert.equal(salva.coluna, 'andamento');
  assert.equal(salva.projetoId, projeto.id);
  await reaberto.delete(`/tarefas/${tarefa.id}`);
  assert.deepEqual((await api.get('/tarefas')).data, []);
  assert.equal(valores.get('token'), 'sessao-existente');
});
