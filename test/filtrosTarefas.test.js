import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filtrarTarefas, contarTarefas } from '../src/filtrosTarefas.js';

const tarefas = [
  { id: 1, usuarioId: 1, idprioridade: 4, coluna: 'afazer' },
  { id: 2, usuarioId: 2, idprioridade: 4, coluna: 'andamento' },
  { id: 3, usuarioId: 1, idprioridade: 3, coluna: 'concluido' },
  { id: 4, usuarioId: null, idprioridade: 3, coluna: 'afazer' },
];

test('Administrador começa vendo todos, inclusive tarefa sem responsável', () => {
  assert.deepEqual(filtrarTarefas(tarefas, { administrador: true }), tarefas);
});
test('Selecionar usuário restringe todas as colunas e combina com prioridade', () => {
  assert.deepEqual(filtrarTarefas(tarefas, { administrador: true, usuarioId: '1' }).map(t => t.id), [1, 3]);
  assert.deepEqual(filtrarTarefas(tarefas, { administrador: true, usuarioId: '1', prioridade: '4' }).map(t => t.id), [1]);
});
test('Contadores correspondem aos registros visíveis, incluindo resultado vazio', () => {
  assert.deepEqual(contarTarefas(filtrarTarefas(tarefas, { administrador: true, usuarioId: '1' })), { total: 2, pendentes: 1, concluidas: 1 });
  assert.deepEqual(contarTarefas(filtrarTarefas(tarefas, { administrador: true, usuarioId: '99' })), { total: 0, pendentes: 0, concluidas: 0 });
});
test('Retornar a todos mantém o filtro de prioridade e não altera os dados originais', () => {
  assert.deepEqual(filtrarTarefas(tarefas, { administrador: true, usuarioId: 'todos', prioridade: '4' }).map(t => t.id), [1, 2]);
  assert.equal(tarefas.length, 4);
});
test('Filtro de usuário não se aplica ao perfil comum; prioridade continua funcionando', () => {
  const somenteProprias = tarefas.filter(t => t.usuarioId === 1);
  assert.deepEqual(filtrarTarefas(somenteProprias, { usuarioId: '2', prioridade: '3' }).map(t => t.id), [3]);
});
