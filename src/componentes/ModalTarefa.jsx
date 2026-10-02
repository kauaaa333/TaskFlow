import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ModalTarefa.module.css';
import { PRIORIDADE_PADRAO, prioridadeMaisProxima, rotuloPrioridade } from '../prioridades';

// O efeito sincroniza o formulário com a tarefa selecionada para edição.
/* eslint-disable react-hooks/set-state-in-effect */

function ModalTarefa({ aberto, onFechar, onSalvar, tarefa = null, coluna = 'afazer', prioridades = [] }) {
  const [texto, setTexto] = useState('');
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('');
  const [idprioridade, setIdprioridade] = useState(PRIORIDADE_PADRAO);

  useEffect(() => {
    if (tarefa) {
      setTexto(tarefa.texto || '');
      setCep(tarefa.cep || '');
      setCidade(tarefa.cidade || '');
      setIdprioridade(tarefa.idprioridade ?? PRIORIDADE_PADRAO);
    } else {
      setTexto('');
      setCep('');
      setCidade('');
      setIdprioridade(PRIORIDADE_PADRAO);
    }
  }, [tarefa, aberto]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!aberto) return undefined;

    function handleEsc(event) {
      if (event.key === 'Escape') onFechar();
    }

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [aberto, onFechar]);

  async function consultarCidade(valor) {
    const cepLimpo = valor.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (!data.erro) setCidade(`${data.localidade} - ${data.uf}`);
    } catch {
      setCidade('');
    }
  }

  // Só prioridades ativas; na edição, mantém a atual mesmo que tenha sido desativada
  const opcoesPrioridade = prioridades.filter((p) => p.ativo || p.id === tarefa?.idprioridade);
  // Se a escolhida não está nas opções (ex.: 'media' desativada), usa a ativa mais próxima do padrão:
  // o que aparece no select é sempre o que é enviado
  const valorPrioridade = opcoesPrioridade.some((p) => p.id === idprioridade)
    ? idprioridade
    : (prioridadeMaisProxima(opcoesPrioridade, PRIORIDADE_PADRAO)?.id ?? idprioridade);

  function handleSalvar(event) {
    event.preventDefault();
    if (!texto.trim()) return;

    onSalvar({
      id: tarefa?.id,
      texto: texto.trim(),
      cep: cep.replace(/\D/g, ''),
      cidade,
      idprioridade: valorPrioridade,
      coluna: tarefa?.coluna || coluna,
    });
    onFechar();
  }

  if (!aberto) return null;

  return (
    <div className={styles.overlay} onClick={onFechar}>
      <form className={styles.card} onClick={(event) => event.stopPropagation()} onSubmit={handleSalvar}>
        <button type="button" className={styles.fechar} onClick={onFechar} aria-label="Fechar modal">×</button>
        <h2>{tarefa ? 'Editar tarefa' : 'Nova tarefa'}</h2>
        <input placeholder="Texto da tarefa" value={texto} onChange={(event) => setTexto(event.target.value)} autoFocus />
        <input
          placeholder="CEP (opcional)"
          value={cep}
          maxLength={9}
          onChange={(event) => {
            const valor = event.target.value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
            setCep(valor);
            consultarCidade(valor);
          }}
        />
        {cidade && <p className={styles.cidade}>{cidade}</p>}
        <select value={valorPrioridade} onChange={(event) => setIdprioridade(Number(event.target.value))}>
          {opcoesPrioridade.map((p) => (
            <option key={p.id} value={p.id}>{rotuloPrioridade(p.descricao)}</option>
          ))}
        </select>
        <div className={styles.botoes}>
          <button type="button" onClick={onFechar}>Cancelar</button>
          <button type="submit">Salvar</button>
        </div>
      </form>
    </div>
  );
}

export default ModalTarefa;
