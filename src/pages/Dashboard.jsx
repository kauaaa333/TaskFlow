import { useEffect, useRef, useState } from 'react';
import api, { mensagensDeErro } from '../api';
import Header from '../componentes/Header';
import ListaTarefas from '../componentes/ListaTarefas';
import ModalTarefa from '../componentes/ModalTarefa';
import ModalExcluirTarefa from '../componentes/ModalExcluirTarefa';
import { cadastrarProjeto } from '../projetos';
import { ordenarPorImportancia, rotuloPrioridade } from '../prioridades';
import { useAuth } from '../contexts/useAuth';
import { filtrarTarefas, contarTarefas } from '../filtrosTarefas';
import { colunasKanban, persistirMovimento, podeMover } from '../movimentacao';

function Dashboard({ theme, onToggleTheme }) {
  const { usuario } = useAuth();
  const [tarefas, setTarefas] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  // O login guarda somente id/nome. O perfil confirmado vem da API autenticada.
  const administrador = usuarios.find(u => u.id === usuario?.id)?.administrador === true;
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [falhaCarregamento, setFalhaCarregamento] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [colunaAtiva, setColunaAtiva] = useState('afazer');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas');
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const tarefaArrastada = useRef(null);
  const movimentoEmCurso = useRef(false);
  const [movimentando, setMovimentando] = useState(false);
  const [destinoArraste, setDestinoArraste] = useState(null);
  const [avisoMovimento, setAvisoMovimento] = useState('');

  const tarefasFiltradas = filtrarTarefas(tarefas, {
    prioridade: filtroPrioridade, usuarioId: filtroUsuario, administrador,
  });
  const { total, pendentes, concluidas } = contarTarefas(tarefasFiltradas);

  useEffect(() => {
    let ativo = true;
    async function carregarTarefas() {
      try {
        setCarregando(true);
        setErro('');
        setFalhaCarregamento(false);
        const [respostaTarefas, respostaPrioridades, respostaUsuarios, respostaProjetos] = await Promise.all([
          api.get('/tarefas'),
          api.get('/prioridades'),
          api.get('/usuarios'),
          api.get('/projetos'),
        ]);
        if (!ativo) return;
        setTarefas(respostaTarefas.data);
        setPrioridades(ordenarPorImportancia(respostaPrioridades.data));
        setUsuarios(respostaUsuarios.data);
        setProjetos(respostaProjetos.data);
      } catch (e) {
        if (!ativo) return;
        setFalhaCarregamento(true);
        setErro(mensagensDeErro(e).join('\n'));
        console.error(e);
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregarTarefas();
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    document.title = pendentes > 0 ? `(${pendentes}) TaskFlow` : 'TaskFlow';
  }, [pendentes]);

  function abrirModalCriar(coluna) {
    setErro('');
    setTarefaEditando(null);
    setColunaAtiva(coluna);
    setModalAberto(true);
  }

  function abrirModalEditar(tarefa) {
    setErro('');
    setTarefaEditando(tarefa);
    setModalAberto(true);
  }

  async function salvarTarefa(dados) {
    setErro('');

    if (dados.id !== undefined) {
        const { data: tarefaEditada } = await api.put(`/tarefas/${dados.id}`, dados);
        setTarefas((atuais) => atuais.map((t) => (t.id === dados.id ? tarefaEditada : t)));
      } else {
        const { data: novaTarefa } = await api.post('/tarefas', dados);
        setTarefas((atuais) => [...atuais, novaTarefa]);
    }
  }

  async function criarProjeto(nome) {
    const projeto = await cadastrarProjeto(api, nome);
    setProjetos((atuais) => [...atuais, projeto]);
    return projeto;
  }

  function deletarTarefa(id) {
    setErro('');
    setTarefaParaExcluir(tarefas.find((tarefa) => tarefa.id === id) ?? null);
  }

  async function confirmarExclusao() {
    if (!tarefaParaExcluir || excluindo) return;
    const id = tarefaParaExcluir.id;
    setErro('');
    setExcluindo(true);

    try {
      await api.delete(`/tarefas/${id}`);
      setTarefas((atuais) => atuais.filter((t) => t.id !== id));
      setTarefaParaExcluir(null);
    } catch (e) {
      setErro(mensagensDeErro(e).join('\n'));
      console.error(e);
    } finally {
      setExcluindo(false);
    }
  }

  async function moverTarefa(id, novaColuna) {
    const tarefa = tarefas.find(t => t.id === id);
    if (movimentoEmCurso.current || !podeMover(tarefa, novaColuna)) return;
    movimentoEmCurso.current = true;
    setMovimentando(true);
    setErro('');
    setAvisoMovimento('Salvando movimentação…');

    try {
      const tarefaMovida = await persistirMovimento(api, tarefa, novaColuna);
      setTarefas((atuais) => atuais.map((t) => (t.id === id ? tarefaMovida : t)));
      setAvisoMovimento(`Tarefa movida para ${colunasKanban.find(c => c.id === novaColuna).titulo}.`);
    } catch (e) {
      setAvisoMovimento('');
      setErro(mensagensDeErro(e).join('\n'));
      console.error(e);
    } finally {
      movimentoEmCurso.current = false;
      setMovimentando(false);
    }
  }

  function iniciarArraste(event, id) {
    if (movimentoEmCurso.current || event.target.closest('button, select')) {
      event.preventDefault();
      return;
    }
    tarefaArrastada.current = id;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(id));
  }

  function encerrarArraste() {
    tarefaArrastada.current = null;
    setDestinoArraste(null);
  }

  function sobreColuna(event, destino) {
    const tarefa = tarefas.find(t => t.id === tarefaArrastada.current);
    if (!movimentoEmCurso.current && podeMover(tarefa, destino)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setDestinoArraste(destino);
    }
  }

  function soltarNaColuna(event, destino) {
    const id = tarefaArrastada.current;
    if (id === null) return;
    event.preventDefault();
    encerrarArraste();
    if (event.dataTransfer.getData('text/plain') === String(id)) moverTarefa(id, destino);
  }

  const prioridadePorId = Object.fromEntries(prioridades.map((p) => [p.id, p]));
  const usuarioPorId = Object.fromEntries(usuarios.map((u) => [u.id, u]));
  const projetoPorId = Object.fromEntries(projetos.map((p) => [p.id, p]));

  return (
    <>
      <Header titulo="TaskFlow" subtitulo="Gerencie suas tarefas" total={total} pendentes={pendentes} concluidas={concluidas} theme={theme} onToggleTheme={onToggleTheme} />
      <div className="container dashboard-container">
        <div className="filtros-tarefas">
        <div className="filtro-prioridade">
          <label htmlFor="filtro-prioridade">Filtrar por prioridade:</label>
          <select id="filtro-prioridade" value={filtroPrioridade} onChange={(event) => setFiltroPrioridade(event.target.value)}>
            <option value="todas">Todas</option>
            {prioridades.map((p) => (
              <option key={p.id} value={p.id}>{rotuloPrioridade(p.descricao)}</option>
            ))}
          </select>
        </div>
        {administrador && <div className="filtro-prioridade">
          <label htmlFor="filtro-usuario">Filtrar por usuário:</label>
          <select id="filtro-usuario" value={filtroUsuario} onChange={(event) => setFiltroUsuario(event.target.value)}>
            <option value="todos">Todos os usuários</option>
            {[...usuarios].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR') || a.id - b.id).map(u => (
              <option key={u.id} value={u.id}>{u.nome} — {u.email}</option>
            ))}
          </select>
        </div>}
        </div>

        {carregando && (<p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>Carregando tarefas...</p>)}
        
        {erro && (<p role="alert" style={{ textAlign: 'center', color: 'var(--danger)', padding: '2rem' }}>{erro}</p>)}
        <p className="kanban-dica" role="status">{avisoMovimento || 'Arraste uma tarefa para outra coluna ou use “Mover para…” no cartão.'}</p>

        {!carregando && !falhaCarregamento && (
          <div className="kanban">
            {colunasKanban.map((coluna) => {
              const tarefasVisiveis = tarefasFiltradas.filter((tarefa) => tarefa.coluna === coluna.id);

              return (
                <div className={`coluna${destinoArraste === coluna.id ? ' coluna-destino' : ''}`} key={coluna.id}
                  onDragOver={event => sobreColuna(event, coluna.id)}
                  onDragLeave={event => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setDestinoArraste(atual => atual === coluna.id ? null : atual);
                  }}
                  onDrop={event => soltarNaColuna(event, coluna.id)}>
                  <div className="kanban-coluna-header">
                    <h2>{coluna.titulo}</h2>
                    <div className="kanban-coluna-controles">
                      <span className="kanban-contador">{tarefasVisiveis.length}</span>
                      <button className="kanban-btn-add" type="button" onClick={() => abrirModalCriar(coluna.id)} aria-label={`Adicionar tarefa em ${coluna.titulo}`}>+</button>
                    </div>
                  </div>
                  <ListaTarefas tarefas={tarefasVisiveis} prioridadePorId={prioridadePorId} usuarioPorId={usuarioPorId} projetoPorId={projetoPorId} onDeletar={deletarTarefa} onEditar={abrirModalEditar} moverTarefa={moverTarefa} iniciarArraste={iniciarArraste} encerrarArraste={encerrarArraste} movimentando={movimentando} />
                </div>
              );
            })}
          </div>
        )}
      </div>
      {modalAberto && <ModalTarefa aberto onFechar={() => setModalAberto(false)} onSalvar={salvarTarefa} onCriarProjeto={criarProjeto} tarefa={tarefaEditando} coluna={colunaAtiva} prioridades={prioridades} usuarios={usuarios} projetos={projetos} />}
      <ModalExcluirTarefa tarefa={tarefaParaExcluir} excluindo={excluindo} erro={erro} onCancelar={() => { if (!excluindo) setTarefaParaExcluir(null); }} onConfirmar={confirmarExclusao} />
    </>
  );
}

export default Dashboard;
