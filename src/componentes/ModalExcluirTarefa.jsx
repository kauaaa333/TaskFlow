import { useEffect, useRef } from 'react';
import styles from './ModalTarefa.module.css';

export default function ModalExcluirTarefa({ tarefa, excluindo, erro, onCancelar, onConfirmar }) {
  const cancelar = useRef(null);
  useEffect(() => {
    if (!tarefa) return undefined;
    cancelar.current?.focus();
    const escapar = (evento) => { if (evento.key === 'Escape' && !excluindo) onCancelar(); };
    document.addEventListener('keydown', escapar);
    return () => document.removeEventListener('keydown', escapar);
  }, [tarefa, excluindo, onCancelar]);
  if (!tarefa) return null;
  return (
    <div className={styles.overlay} onClick={excluindo ? undefined : onCancelar}>
      <section className={styles.card} role="dialog" aria-modal="true" aria-labelledby="titulo-excluir" aria-describedby="aviso-excluir" aria-busy={excluindo} onClick={(evento) => evento.stopPropagation()}>
        <h2 id="titulo-excluir">Excluir tarefa?</h2>
        <p id="aviso-excluir">A tarefa “{tarefa.texto}” será excluída. Essa ação não pode ser desfeita.</p>
        {erro && <p className={styles.erros} role="alert">{erro}</p>}
        <div className={styles.botoes}>
          <button ref={cancelar} type="button" onClick={onCancelar} disabled={excluindo}>Cancelar</button>
          <button type="button" onClick={onConfirmar} disabled={excluindo}>{excluindo ? 'Excluindo...' : 'Confirmar exclusão'}</button>
        </div>
      </section>
    </div>
  );
}
