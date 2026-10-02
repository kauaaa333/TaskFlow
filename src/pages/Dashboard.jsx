import { useEffect, useState } from 'react';
import api from '../api';
import Header from '../componentes/Header';
import ListaTarefas from '../componentes/ListaTarefas';
import ModalTarefa from '../componentes/ModalTarefa';
import { useAuth } from '../contexts/useAuth';
import { ordenarPorImportancia, PRIORIDADES_RESERVA, rotuloPrioridade } from '../prioridades';

const LIMITE_ANDAMENTO = 2;
const MSG_LIMITE = `Limite de ${LIMITE_ANDAMENTO} tarefas em andamento atingido`;

function idDoToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)).id ?? null;
  } catch {
    return null;
  }
}

function Dashboard({ theme, onToggleTheme }) {
  const [tarefas, setTarefas] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [falhaCarregamento, setFalhaCarregamento] = useState(false);
  const { token } = useAuth();
  const usuarioId = idDoToken(token);

  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [colunaAtiva, setColunaAtiva] = useState('afazer');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas');

  const total = tarefas.length;
  const pendentes = tarefas.filter((tarefa) => tarefa.coluna === 'afazer').length;
  const concluidas = tarefas.filter((tarefa) => tarefa.coluna === 'concluido').length;
  const emAndamento = tarefas.filter((tarefa) => tarefa.coluna === 'andamento').length;

  useEffect(() => {
    async function carregarTarefas() {
      try {
        setCarregando(true);
        setErro('');
        setFalhaCarregamento(false);
        // allSettled: se só as prioridades falharem, as tarefas continuam aparecendo
        const [respostaTarefas, respostaPrioridades] = await Promise.allSettled([
          api.get('/tarefas', { params: usuarioId ? { usuarioId } : undefined }),
          api.get('/prioridades'),
        ]);
        if (respostaTarefas.status === 'rejected') throw respostaTarefas.reason;
        setTarefas(respostaTarefas.value.data);

        if (respostaPrioridades.status === 'fulfilled') {
          setPrioridades(ordenarPorImportancia(respostaPrioridades.value.data));
        } else {
          console.warn('GET /prioridades falhou; usando a lista padrão', respostaPrioridades.reason);
          setPrioridades(ordenarPorImportancia(PRIORIDADES_RESERVA));
        }
      } catch (e) {
        setFalhaCarregamento(true);
        setErro('Erro ao carregar tarefas. Verifique a conexao.');
        console.error(e);
      } finally {
        setCarregando(false);
      }
    }
    carregarTarefas();
  }, [usuarioId]);

  useEffect(() => {
    document.title = pendentes > 0 ? `(${pendentes}) TaskFlow` : 'TaskFlow';
  }, [pendentes]);

  function abrirModalCriar(coluna) {
    setTarefaEditando(null);
    setColunaAtiva(coluna);
    setModalAberto(true);
  }

  function abrirModalEditar(tarefa) {
    setTarefaEditando(tarefa);
    setModalAberto(true);
  }

  async function salvarTarefa(dados) {
    setErro('');

    if (dados.id === undefined && dados.coluna === 'andamento' && emAndamento >= LIMITE_ANDAMENTO) {
      setErro(MSG_LIMITE);
      return;
    }

    try {
      if (dados.id !== undefined) {
        const { data: tarefaEditada } = await api.put(`/tarefas/${dados.id}`, dados);
        setTarefas((atuais) => atuais.map((t) => (t.id === dados.id ? tarefaEditada : t)));
      } else {
        const { data: novaTarefa } = await api.post('/tarefas', dados);
        setTarefas((atuais) => [...atuais, novaTarefa]);
      }
    } catch (e) {
      setErro(e.response?.data?.erro || 'Erro ao salvar tarefa.');
      console.error(e);
    }
  }

  async function deletarTarefa(id) {
    const confirmado = window.confirm('Tem certeza que deseja deletar esta tarefa?');
    if (!confirmado) return;

    setErro('');

    try {
      await api.delete(`/tarefas/${id}`);
      setTarefas((atuais) => atuais.filter((t) => t.id !== id));
    } catch (e) {
      setErro('Erro ao deletar tarefa. Tente novamente.');
      console.error(e);
    }
  }

  async function moverTarefa(id, novaColuna) {
    setErro('');

    if (novaColuna === 'andamento' && emAndamento >= LIMITE_ANDAMENTO) {
      setErro(MSG_LIMITE);
      return;
    }

    try {
      const { data: tarefaMovida } = await api.put(`/tarefas/${id}`, { coluna: novaColuna });
      setTarefas((atuais) => atuais.map((t) => (t.id === id ? tarefaMovida : t)));
    } catch (e) {
      setErro(e.response?.data?.erro || 'Erro ao mover tarefa. Tente novamente.');
      console.error(e);
    }
  }

  const prioridadePorId = Object.fromEntries(prioridades.map((p) => [p.id, p]));

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
        
        {erro && (<p style={{ textAlign: 'center', color: 'var(--danger)', padding: '2rem' }}>{erro}</p>)}

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
                  <ListaTarefas tarefas={tarefasVisiveis} prioridadePorId={prioridadePorId} onDeletar={deletarTarefa} onEditar={abrirModalEditar} moverTarefa={moverTarefa} />
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ModalTarefa aberto={modalAberto} onFechar={() => setModalAberto(false)} onSalvar={salvarTarefa} tarefa={tarefaEditando} coluna={colunaAtiva} prioridades={prioridades} />
    </>
  );
}

export default Dashboard;
