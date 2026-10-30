import { useEffect, useState } from 'react';
import { mensagensDeErro } from '../api';
import { useAuth } from '../contexts/useAuth';
import styles from './ModalTarefa.module.css';
import { PRIORIDADE_PADRAO, prioridadeMaisProxima, rotuloPrioridade } from '../prioridades';

function paraNumero(valor) {
  return valor === '' || valor == null ? null : Number(valor);
}

function ModalTarefa({ aberto, onFechar, onSalvar, onCriarProjeto, tarefa = null, coluna = 'afazer', prioridades, usuarios, projetos }) {
  const { usuario } = useAuth();
  // Atualizar os projetos não deve apagar os dados da tarefa em edição.
  const responsavelInicial = tarefa ? tarefa.usuarioId ?? '' : usuario?.id || usuarios[0]?.id || '';
  const [texto, setTexto] = useState(tarefa?.texto ?? '');
  const [idUsuario, setIdUsuario] = useState(responsavelInicial);
  const [idProjeto, setIdProjeto] = useState(tarefa ? tarefa.projetoId ?? ''
    : projetos.find((p) => p.usuarioId === Number(responsavelInicial))?.id ?? '');
  const [erros, setErros] = useState([]);
  const [idprioridade, setIdprioridade] = useState(tarefa?.idprioridade
    ?? prioridadeMaisProxima(prioridades, PRIORIDADE_PADRAO)?.id ?? '');
  const [salvando, setSalvando] = useState(false);
  const [novoProjetoAberto, setNovoProjetoAberto] = useState(false);
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [criandoProjeto, setCriandoProjeto] = useState(false);
  const [errosProjeto, setErrosProjeto] = useState([]);
  const [avisoProjeto, setAvisoProjeto] = useState('');
  const ocupado = salvando || criandoProjeto;
  const podeCriarProjeto = Number(idUsuario) === usuario?.id;

  useEffect(() => {
    if (!aberto || ocupado) return undefined;

    function handleEsc(event) {
      if (event.key === 'Escape') onFechar();
    }

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [aberto, onFechar, ocupado]);

  function trocarResponsavel(valor) {
    setIdUsuario(valor);
    setIdProjeto(projetos.find((p) => p.usuarioId === Number(valor))?.id ?? '');
    setNovoProjetoAberto(false);
    setNomeProjeto('');
    setErrosProjeto([]);
    setAvisoProjeto('');
  }

  async function criarProjeto() {
    if (ocupado || !podeCriarProjeto) return;
    if (!nomeProjeto.trim() || nomeProjeto.trim().length > 100) {
      setErrosProjeto(['Informe um nome de projeto com até 100 caracteres.']);
      return;
    }
    setCriandoProjeto(true);
    setErrosProjeto([]);
    try {
      const projeto = await onCriarProjeto(nomeProjeto);
      setIdProjeto(projeto.id);
      setNovoProjetoAberto(false);
      setNomeProjeto('');
      setAvisoProjeto('Projeto criado e selecionado. Ele permanece cadastrado mesmo se você cancelar a tarefa.');
    } catch (e) {
      setErrosProjeto(mensagensDeErro(e));
    } finally {
      setCriandoProjeto(false);
    }
  }

  // Na edição, preserva a prioridade atual mesmo se estiver inativa.
  const opcoesPrioridade = prioridades;
  const projetosDoResponsavel = projetos.filter((p) => p.usuarioId === Number(idUsuario)
    || (tarefa && p.id === tarefa.projetoId && Number(idUsuario) === tarefa.usuarioId));
  const prioridadeAtualInativa = tarefa && !prioridades.some((p) => p.id === tarefa.idprioridade);
  // Se a opção não existir mais, seleciona a prioridade ativa mais próxima.
  const valorPrioridade = prioridadeAtualInativa && Number(idprioridade) === tarefa.idprioridade
    ? idprioridade : opcoesPrioridade.some((p) => p.id === Number(idprioridade))
    ? idprioridade
    : (prioridadeMaisProxima(opcoesPrioridade, PRIORIDADE_PADRAO)?.id ?? idprioridade);

  async function handleSalvar(event) {
    event.preventDefault();
    if (ocupado || novoProjetoAberto) return;

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
    <div className={styles.overlay} onClick={ocupado ? undefined : onFechar}>
      <form className={styles.card} role="dialog" aria-modal="true" aria-labelledby="titulo-modal-tarefa" onClick={(event) => event.stopPropagation()} onSubmit={handleSalvar} aria-busy={ocupado} noValidate>
        <button type="button" className={styles.fechar} onClick={onFechar} aria-label="Fechar modal" disabled={ocupado}>×</button>
        <h2 id="titulo-modal-tarefa">{tarefa ? 'Editar tarefa' : 'Nova tarefa'}</h2>
        <div className={styles.campo}>
          <label htmlFor="tarefa-texto">Tarefa</label>
          <input id="tarefa-texto" placeholder="Descreva a tarefa" value={texto} onChange={(event) => setTexto(event.target.value)} disabled={ocupado} autoFocus />
        </div>
        <div className={styles.campo}>
          <label htmlFor="tarefa-responsavel">Responsável</label>
          <select id="tarefa-responsavel" value={idUsuario} onChange={(event) => trocarResponsavel(event.target.value)} disabled={ocupado}>
            <option value="">Selecione um responsável</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
        </div>
        <div className={styles.campo}>
          <label htmlFor="tarefa-projeto">Projeto</label>
          <select id="tarefa-projeto" value={idProjeto} onChange={(event) => setIdProjeto(event.target.value)} disabled={ocupado}>
            <option value="">Sem projeto</option>
            {projetosDoResponsavel.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          {podeCriarProjeto && !novoProjetoAberto && <button type="button" onClick={() => { setNovoProjetoAberto(true); setAvisoProjeto(''); setErrosProjeto([]); }} disabled={ocupado}>+ Novo projeto</button>}
          {!podeCriarProjeto && <small>Para criar um projeto, selecione sua própria conta como responsável.</small>}
          {novoProjetoAberto && <fieldset className={styles.novoProjeto} disabled={ocupado}>
            <legend>Novo projeto</legend>
            <label htmlFor="novo-projeto-nome">Nome do projeto</label>
            <input id="novo-projeto-nome" value={nomeProjeto} maxLength={100} onChange={(event) => setNomeProjeto(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); criarProjeto(); } }} />
            {errosProjeto.length > 0 && <ul role="alert" className={styles.erros}>{errosProjeto.map((mensagem, i) => <li key={i}>{mensagem}</li>)}</ul>}
            <div className={styles.botoes}>
              <button type="button" onClick={() => { setNovoProjetoAberto(false); setNomeProjeto(''); setErrosProjeto([]); }}>Cancelar novo projeto</button>
              <button type="button" onClick={criarProjeto}>{criandoProjeto ? 'Criando...' : 'Criar projeto'}</button>
            </div>
          </fieldset>}
          {avisoProjeto && <small role="status">{avisoProjeto}</small>}
        </div>
        <div className={styles.campo}>
        <label htmlFor="tarefa-prioridade">Prioridade</label>
        <select id="tarefa-prioridade" disabled={ocupado} value={valorPrioridade} onChange={(event) => setIdprioridade(Number(event.target.value))}>
          {!prioridades.length && !prioridadeAtualInativa && <option value="">Nenhuma prioridade ativa</option>}
          {prioridadeAtualInativa && <option value={tarefa.idprioridade}>Prioridade atual (inativa)</option>}
          {opcoesPrioridade.map((p) => (
            <option key={p.id} value={p.id}>{rotuloPrioridade(p.descricao)}</option>
          ))}
        </select>
        </div>
        {erros.length > 0 && <ul role="alert" className={styles.erros}>{erros.map((mensagem, i) => <li key={i}>{mensagem}</li>)}</ul>}
        <div className={styles.botoes}>
          <button type="button" onClick={onFechar} disabled={ocupado}>Cancelar</button>
          <button type="submit" disabled={ocupado || novoProjetoAberto}>{salvando ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </div>
  );
}

export default ModalTarefa;
