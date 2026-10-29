import TarefaItem from './TarefaItem';

function ListaTarefas({ tarefas, prioridadePorId = {}, usuarioPorId = {}, projetoPorId = {}, onDeletar, onEditar, moverTarefa }) {
  return (
    <section id='lista-section'>
      {/* Mensagem quando nao ha tarefas */}
      {tarefas.length === 0 && (
        <p className='msg-vazia'>
          Nenhuma tarefa nesta coluna.
        </p>
      )}
      {/* Lista renderizada dinamicamente */}
      {tarefas.length > 0 && (
        <ul id='lista-tarefas'>
          {tarefas.map(tarefa => (
            <TarefaItem
              key={tarefa.id}
              texto={tarefa.texto}
              prioridade={prioridadePorId[tarefa.idprioridade]?.descricao}
              coluna={tarefa.coluna}
              responsavel={tarefa.usuario ?? usuarioPorId[tarefa.usuarioId]?.nome}
              projeto={tarefa.projeto ?? projetoPorId[tarefa.projetoId]?.nome}
              moverTarefa={moverTarefa}
              id={tarefa.id}
              onDeletar={() => onDeletar(tarefa.id)}
              onEditar={() => onEditar(tarefa)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default ListaTarefas;
