import styles from "./TarefaItem.module.css";
import { rotuloPrioridade } from "../prioridades";

function TarefaItem({
  id,
  texto,
  coluna,
  moverTarefa,
  prioridade,
  responsavel,
  projeto,
  onDeletar,
  onEditar,
}) {
  const isConcluida = coluna === "concluido";

  const classeItem =
    (isConcluida ? styles.tarefa + " " + styles.concluida : styles.tarefa) +
    (styles[prioridade] ? " " + styles[prioridade] : "");

  const classeTexto = isConcluida
    ? styles.textoTarefa + " " + styles["texto-tarefa"]
    : styles.textoTarefa;

  const classePrioridade =
    styles["badge-prioridade"] + " " + styles["badge-" + prioridade];

  return (
    <li className={classeItem} aria-label={`Tarefa: ${texto}`}>
      <div className={styles.conteudo}>
        <span className={classeTexto} onDoubleClick={onEditar} title="Duplo clique para editar">
          {texto}
        </span>

        <div className={styles.badges}>
          {responsavel && <span className={styles.responsavel}>{responsavel}</span>}
          {prioridade && <span className={classePrioridade}>{rotuloPrioridade(prioridade)}</span>}
          {!prioridade && <span className={styles['badge-prioridade']}>Prioridade inativa</span>}
        </div>
        <span className={styles.responsavel}>Projeto: {projeto || 'Sem projeto'}</span>
      </div>

      <div className={styles.acoes}>
        <button onClick={onEditar} title="Editar tarefa" aria-label={`Editar ${texto}`}>Editar</button>
        {coluna !== "afazer" && (
          <button
            onClick={() =>
              moverTarefa(id, coluna === "concluido" ? "andamento" : "afazer")
            }
            title="Mover para esquerda"
          >
            ←
          </button>
        )}

        {coluna !== "concluido" && (
          <button
            onClick={() =>
              moverTarefa(id, coluna === "afazer" ? "andamento" : "concluido")
            }
            title="Mover para direita"
          >
            →
          </button>
        )}

        <button className={styles.btnDeletar} onClick={onDeletar} title="Excluir tarefa">
          X
        </button>
      </div>
    </li>
  );
}

export default TarefaItem;
