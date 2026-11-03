export const colunasKanban = [
  { id: 'afazer', titulo: 'A Fazer' },
  { id: 'andamento', titulo: 'Em Andamento' },
  { id: 'concluido', titulo: 'Concluído' },
];

export function podeMover(tarefa, destino) {
  return Boolean(tarefa && tarefa.coluna !== destino && colunasKanban.some(c => c.id === destino));
}

export async function persistirMovimento(api, tarefa, destino) {
  if (!podeMover(tarefa, destino)) return null;
  const { data } = await api.put(`/tarefas/${tarefa.id}`, { coluna: destino });
  return data;
}
