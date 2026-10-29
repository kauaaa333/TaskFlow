import { useEffect, useState } from 'react';
import api, { mensagensDeErro } from '../api';
import Header from '../componentes/Header';
import ListaTarefas from '../componentes/ListaTarefas';
import ModalTarefa from '../componentes/ModalTarefa';
import ModalExcluirTarefa from '../componentes/ModalExcluirTarefa';
import { cadastrarProjeto } from '../projetos';
import { ordenarPorImportancia, rotuloPrioridade } from '../prioridades';

function Dashboard({ theme, onToggleTheme }) {
  const [tarefas, setTarefas] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [falhaCarregamento, setFalhaCarregamento] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [colunaAtiva, setColunaAtiva] = useState('afazer');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas');
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const total = tarefas.length;
  const pendentes = tarefas.filter((tarefa) => tarefa.coluna === 'afazer').length;
  const concluidas = tarefas.filter((tarefa) => tarefa.coluna === 'concluido').length;

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
    setErro('');

    try {
      const { data: tarefaMovida } = await api.put(`/tarefas/${id}`, { coluna: novaColuna });
      setTarefas((atuais) => atuais.map((t) => (t.id === id ? tarefaMovida : t)));
    } catch (e) {
      setErro(mensagensDeErro(e).join('\n'));
      console.error(e);
    }
  }

  const prioridadePorId = Object.fromEntries(prioridades.map((p) => [p.id, p]));
  const usuarioPorId = Object.fromEntries(usuarios.map((u) => [u.id, u]));
  const projetoPorId = Object.fromEntries(projetos.map((p) => [p.id, p]));

  const tarefasFiltradas = tarefas.filter((tarefa) => (
    filtroPrioridade === 'todas' || String(tarefa.idprioridade) === filtroPrioridade
  ));

  const colunas = [
    { id: 'afazer', titulo: 'A Fazer', proxima: 'andamento' },
    { id: 'andamento', titulo: 'Em Andamento', anterior: 'afazer', proxima: 'concluido' },
    { id: 'concluido', titulo: 'Concluído', anterior: 'andamento' },
  ];

  return (
    <>
      <Header titulo="TaskFlow" subtitulo="Gerencie suas tarefas" total={total} pendentes={pendentes} concluidas={concluidas} theme={theme} onToggleTheme={onToggleTheme} />
      <div className="container dashboard-container">
        <div className="filtro-prioridade">
          <label htmlFor="filtro-prioridade">Filtrar por prioridade:</label>
          <select id="filtro-prioridade" value={filtroPrioridade} onChange={(event) => setFiltroPrioridade(event.target.value)}>
            <option value="todas">Todas</option>
            {prioridades.map((p) => (
              <option key={p.id} value={p.id}>{rotuloPrioridade(p.descricao)}</option>
            ))}
          </select>
        </div>

        {carregando && (<p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>Carregando tarefas...</p>)}
        
        {erro && (<p role="alert" style={{ textAlign: 'center', color: 'var(--danger)', padding: '2rem' }}>{erro}</p>)}

        {!carregando && !falhaCarregamento && (
          <div className="kanban">
            {colunas.map((coluna) => {
              const tarefasDaColuna = tarefas.filter((tarefa) => tarefa.coluna === coluna.id);
              const tarefasVisiveis = tarefasFiltradas.filter((tarefa) => tarefa.coluna === coluna.id);

              return (
                <div className="coluna" key={coluna.id}>
                  <div className="kanban-coluna-header">
                    <h2>{coluna.titulo}</h2>
                    <div className="kanban-coluna-controles">
                      <span className="kanban-contador">{tarefasDaColuna.length}</span>
                      <button className="kanban-btn-add" type="button" onClick={() => abrirModalCriar(coluna.id)} aria-label={`Adicionar tarefa em ${coluna.titulo}`}>+</button>
                    </div>
                  </div>
                  <ListaTarefas tarefas={tarefasVisiveis} prioridadePorId={prioridadePorId} usuarioPorId={usuarioPorId} projetoPorId={projetoPorId} onDeletar={deletarTarefa} onEditar={abrirModalEditar} moverTarefa={moverTarefa} />
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
