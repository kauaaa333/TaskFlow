import styles from "./TarefaItem.module.css";
import { rotuloPrioridade } from "../prioridades";
import { colunasKanban } from "../movimentacao";

function TarefaItem({
  id,
  texto,
  coluna,
  moverTarefa,
  iniciarArraste,
  encerrarArraste,
  movimentando,
  prioridade,
  corPrioridade,
  responsavel,
  projeto,
  onDeletar,
  onEditar,
}) {
  const isConcluida = coluna === "concluido";

  const classeItem = isConcluida ? styles.tarefa + " " + styles.concluida : styles.tarefa;
  const cor = typeof corPrioridade === "string" && /^#[0-9a-f]{6}$/i.test(corPrioridade)
    ? corPrioridade : "#94A3B8";

  const classeTexto = isConcluida
    ? styles.textoTarefa + " " + styles["texto-tarefa"]
    : styles.textoTarefa;

  const classePrioridade = styles["badge-prioridade"];

  return (
    <li className={classeItem} style={{ "--cor-prioridade": cor }} aria-label={`Tarefa: ${texto}`}
      draggable={!movimentando} onDragStart={event => iniciarArraste(event, id)} onDragEnd={encerrarArraste}>
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
        <select className={styles.mover} aria-label={`Mover ${texto} para outra coluna`}
          value="" disabled={movimentando} onChange={event => moverTarefa(id, event.target.value)}>
          <option value="" disabled>Mover para…</option>
          {colunasKanban.filter(c => c.id !== coluna).map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
        </select>

        <button className={styles.btnDeletar} onClick={onDeletar} title="Excluir tarefa">
          X
        </button>
      </div>
    </li>
  );
}

export default TarefaItem;
