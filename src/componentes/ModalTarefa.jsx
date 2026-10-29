import { useEffect, useState } from 'react';
import { mensagensDeErro } from '../api';
import { useAuth } from '../contexts/useAuth';
import styles from './ModalTarefa.module.css';
import { PRIORIDADE_PADRAO, prioridadeMaisProxima, rotuloPrioridade } from '../prioridades';

function paraNumero(valor) {
  return valor === '' || valor == null ? null : Number(valor);
}

function ModalTarefa({ aberto, onFechar, onSalvar, tarefa = null, coluna = 'afazer', prioridades, usuarios, projetos }) {
  const { usuario } = useAuth();
  const [texto, setTexto] = useState('');
  const [idUsuario, setIdUsuario] = useState('');
  const [idProjeto, setIdProjeto] = useState('');
  const [erros, setErros] = useState([]);
  const [idprioridade, setIdprioridade] = useState(PRIORIDADE_PADRAO);
  const [salvando, setSalvando] = useState(false);

  // Sincroniza o formulário ao abrir ou selecionar outra tarefa.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!aberto) return;
    setErros([]);
    setTexto(tarefa?.texto ?? '');
    setIdprioridade(tarefa?.idprioridade
      ?? prioridadeMaisProxima(prioridades, PRIORIDADE_PADRAO)?.id ?? '');
    const responsavel = tarefa ? tarefa.usuarioId ?? '' : usuario?.id || usuarios[0]?.id || '';
    setIdUsuario(responsavel);
    setIdProjeto(tarefa ? tarefa.projetoId ?? ''
      : projetos.find((p) => p.usuarioId === Number(responsavel))?.id ?? '');
  }, [tarefa, aberto, usuario?.id, usuarios, projetos, prioridades]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!aberto || salvando) return undefined;

    function handleEsc(event) {
      if (event.key === 'Escape') onFechar();
    }

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [aberto, onFechar, salvando]);

  function trocarResponsavel(valor) {
    setIdUsuario(valor);
    setIdProjeto(projetos.find((p) => p.usuarioId === Number(valor))?.id ?? '');
  }

  // Só prioridades ativas; na edição, mantém a atual mesmo que tenha sido desativada
  const opcoesPrioridade = prioridades;
  const projetosDoResponsavel = projetos.filter((p) => p.usuarioId === Number(idUsuario)
    || (tarefa && p.id === tarefa.projetoId && Number(idUsuario) === tarefa.usuarioId));
  const prioridadeAtualInativa = tarefa && !prioridades.some((p) => p.id === tarefa.idprioridade);
  // Se a escolhida não está nas opções (ex.: 'media' desativada), usa a ativa mais próxima do padrão:
  // o que aparece no select é sempre o que é enviado
  const valorPrioridade = prioridadeAtualInativa && Number(idprioridade) === tarefa.idprioridade
    ? idprioridade : opcoesPrioridade.some((p) => p.id === Number(idprioridade))
    ? idprioridade
    : (prioridadeMaisProxima(opcoesPrioridade, PRIORIDADE_PADRAO)?.id ?? idprioridade);

  async function handleSalvar(event) {
    event.preventDefault();
    if (salvando) return;

    setErros([]);
    setSalvando(true);
    try {
      await onSalvar({
        id: tarefa?.id,
        texto: texto.trim(),
        idprioridade: paraNumero(valorPrioridade),
        usuarioId: paraNumero(idUsuario),
        projetoId: paraNumero(idProjeto),
        coluna: tarefa?.coluna || coluna,
        ...(tarefa?.ordem !== undefined ? { ordem: tarefa.ordem } : {}),
      });
      onFechar();
    } catch (e) {
      setErros(mensagensDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) return null;

  return (
    <div className={styles.overlay} onClick={salvando ? undefined : onFechar}>
      <form className={styles.card} role="dialog" aria-modal="true" aria-labelledby="titulo-modal-tarefa" onClick={(event) => event.stopPropagation()} onSubmit={handleSalvar} aria-busy={salvando} noValidate>
        <button type="button" className={styles.fechar} onClick={onFechar} aria-label="Fechar modal" disabled={salvando}>×</button>
        <h2 id="titulo-modal-tarefa">{tarefa ? 'Editar tarefa' : 'Nova tarefa'}</h2>
        <div className={styles.campo}>
          <label htmlFor="tarefa-texto">Tarefa</label>
          <input id="tarefa-texto" placeholder="Descreva a tarefa" value={texto} onChange={(event) => setTexto(event.target.value)} disabled={salvando} autoFocus />
        </div>
        <div className={styles.campo}>
          <label htmlFor="tarefa-responsavel">Responsável</label>
          <select id="tarefa-responsavel" value={idUsuario} onChange={(event) => trocarResponsavel(event.target.value)} disabled={salvando}>
            <option value="">Selecione um responsável</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
        </div>
        <div className={styles.campo}>
          <label htmlFor="tarefa-projeto">Projeto</label>
          <select id="tarefa-projeto" value={idProjeto} onChange={(event) => setIdProjeto(event.target.value)} disabled={salvando}>
            <option value="">Sem projeto</option>
            {projetosDoResponsavel.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div className={styles.campo}>
        <label htmlFor="tarefa-prioridade">Prioridade</label>
        <select id="tarefa-prioridade" disabled={salvando} value={valorPrioridade} onChange={(event) => setIdprioridade(Number(event.target.value))}>
          {!prioridades.length && !prioridadeAtualInativa && <option value="">Nenhuma prioridade ativa</option>}
          {prioridadeAtualInativa && <option value={tarefa.idprioridade}>Prioridade atual (inativa)</option>}
          {opcoesPrioridade.map((p) => (
            <option key={p.id} value={p.id}>{rotuloPrioridade(p.descricao)}</option>
          ))}
        </select>
        </div>
        {erros.length > 0 && <ul role="alert" className={styles.erros}>{erros.map((mensagem, i) => <li key={i}>{mensagem}</li>)}</ul>}
        <div className={styles.botoes}>
          <button type="button" onClick={onFechar} disabled={salvando}>Cancelar</button>
          <button type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </div>
  );
}

export default ModalTarefa;
