export function filtrarTarefas(tarefas, { prioridade = 'todas', usuarioId = 'todos', administrador = false } = {}) {
  return tarefas.filter(tarefa =>
    (prioridade === 'todas' || String(tarefa.idprioridade) === String(prioridade)) &&
    (!administrador || usuarioId === 'todos' || String(tarefa.usuarioId) === String(usuarioId)));
}

export function contarTarefas(tarefas) {
  return {
    total: tarefas.length,
    pendentes: tarefas.filter(t => t.coluna === 'afazer').length,
    concluidas: tarefas.filter(t => t.coluna === 'concluido').length,
  };
}
