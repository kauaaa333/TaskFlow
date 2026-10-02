// A API devolve a descrição sem acento (como no banco); aqui fica o rótulo para exibir
const ROTULOS = {
  baixissima: 'Baixíssima',
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

// Prioridade usada quando a tarefa não informa idprioridade ('media')
export const PRIORIDADE_PADRAO = 3;

export function rotuloPrioridade(descricao) {
  if (!descricao) return '';
  return ROTULOS[descricao] ?? descricao.charAt(0).toUpperCase() + descricao.slice(1);
}

// Da mais importante para a menos: o id cresce com a importância
export function ordenarPorImportancia(prioridades) {
  return [...prioridades].sort((a, b) => b.id - a.id);
}

// Opção mais próxima de um id (no empate, a menos importante)
export function prioridadeMaisProxima(opcoes, id) {
  return [...opcoes].sort((a, b) => Math.abs(a.id - id) - Math.abs(b.id - id) || a.id - b.id)[0];
}

// Usada só se GET /prioridades falhar (ex.: backend antigo); mesmos ids da tabela prioridades
export const PRIORIDADES_RESERVA = [
  { id: 1, descricao: 'baixissima', ativo: true },
  { id: 2, descricao: 'baixa', ativo: true },
  { id: 3, descricao: 'media', ativo: true },
  { id: 4, descricao: 'alta', ativo: true },
  { id: 5, descricao: 'urgente', ativo: true },
];
