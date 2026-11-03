const chave = 'taskflow.visitante.v1';
const usuario = { id: 1, nome: 'Visitante' };
const prioridades = ['Baixa', 'Média', 'Alta'].map((descricao, i) => ({ id: i + 1, descricao }));

export function criarApiVisitante(armazenamento) {
  function ler() {
    return JSON.parse(armazenamento.getItem(chave) ?? 'null') ?? { tarefas: [], projetos: [] };
  }

  function gravar(dados) {
    armazenamento.setItem(chave, JSON.stringify(dados));
  }

  function validarTarefa(tarefa) {
    if (!tarefa.texto?.trim()) throw new Error('Informe a descrição da tarefa.');
  }

  return {
    async get(url) {
      const { tarefas, projetos } = ler();
      return { data: { '/tarefas': tarefas, '/projetos': projetos, '/usuarios': [usuario], '/prioridades': prioridades }[url] };
    },
    async post(url, campos) {
      const dados = ler();
      const projeto = url === '/projetos';
      const lista = projeto ? dados.projetos : dados.tarefas;
      const id = lista.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;
      const item = { ...campos, id, usuarioId: usuario.id };
      if (!projeto) validarTarefa(item);
      lista.push(item);
      gravar(dados);
      return { data: item };
    },
    async put(url, campos) {
      const dados = ler();
      const id = Number(url.split('/').at(-1));
      const indice = dados.tarefas.findIndex(t => t.id === id);
      if (indice === -1) throw new Error('Tarefa não encontrada.');
      const tarefa = { ...dados.tarefas[indice], ...campos, id, usuarioId: usuario.id };
      validarTarefa(tarefa);
      dados.tarefas[indice] = tarefa;
      gravar(dados);
      return { data: tarefa };
    },
    async delete(url) {
      const dados = ler();
      const id = Number(url.split('/').at(-1));
      dados.tarefas = dados.tarefas.filter(t => t.id !== id);
      gravar(dados);
    },
  };
}

export const apiVisitante = criarApiVisitante({
  getItem: (...args) => localStorage.getItem(...args),
  setItem: (...args) => localStorage.setItem(...args),
});
