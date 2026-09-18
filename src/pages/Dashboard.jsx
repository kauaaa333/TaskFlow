import { useEffect, useState } from 'react';
import api from '../api';
import Header from '../componentes/Header';
import ListaTarefas from '../componentes/ListaTarefas';
import ModalTarefa from '../componentes/ModalTarefa';

function Dashboard({ theme, onToggleTheme }) {
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [colunaAtiva, setColunaAtiva] = useState('afazer');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas');

  const total = tarefas.length;
  const pendentes = tarefas.filter((tarefa) => tarefa.coluna === 'afazer').length;
  const concluidas = tarefas.filter((tarefa) => tarefa.coluna === 'concluido').length;

  useEffect(() => {
    async function carregarTarefas() {
      try {
        setCarregando(true);
        setErro('');
        const resposta = await api.get('/tarefas');
        setTarefas(resposta.data);
      } catch (e) {
        setErro('Erro ao carregar tarefas. Verifique a conexao.');
        console.error(e);
      } finally {
        setCarregando(false);
      }
    }
    carregarTarefas();
  }, []);

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

    try {
      if (dados.id !== undefined) {
        const { data: tarefaEditada } = await api.put(`/tarefas/${dados.id}`, dados);
        setTarefas((atuais) => atuais.map((t) => (t.id === dados.id ? tarefaEditada : t)));
      } else {
        const { data: novaTarefa } = await api.post('/tarefas', dados);
        setTarefas((atuais) => [...atuais, novaTarefa]);
      }
    } catch (e) {
      setErro('Erro ao salvar tarefa.');
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

    try {
      const { data: tarefaMovida } = await api.put(`/tarefas/${id}`, { coluna: novaColuna });
      setTarefas((atuais) => atuais.map((t) => (t.id === id ? tarefaMovida : t)));
    } catch (e) {
      setErro('Erro ao mover tarefa. Tente novamente.');
      console.error(e);
    }
  }

  const tarefasFiltradas = tarefas.filter((tarefa) => (
    filtroPrioridade === 'todas' || tarefa.prioridade === filtroPrioridade
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
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>

        {carregando && (<p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>Carregando tarefas...</p>)}
        
        {erro && (<p style={{ textAlign: 'center', color: 'var(--danger)', padding: '2rem' }}>{erro}</p>)}

        {!carregando && !erro && (
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
                  <ListaTarefas tarefas={tarefasVisiveis} onDeletar={deletarTarefa} onEditar={abrirModalEditar} moverTarefa={moverTarefa} />
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ModalTarefa aberto={modalAberto} onFechar={() => setModalAberto(false)} onSalvar={salvarTarefa} tarefa={tarefaEditando} coluna={colunaAtiva} />
    </>
  );
}

export default Dashboard;
