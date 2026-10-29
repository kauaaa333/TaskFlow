// Cada detalhe da validação ocupa uma linha no modal. Aceita também a API legada.
export function mensagensDeErro(erro) {
  if (!erro?.response) return ['Não foi possível conectar à API.'];

  const dados = erro.response.data;
  const detalhes = dados?.erro?.detalhes ?? dados?.erros;
  const mensagens = Array.isArray(detalhes)
    ? detalhes.filter((item) => typeof item === 'string' && item.trim())
    : [];
  if (mensagens.length) return mensagens;

  const mensagem = typeof dados?.erro === 'string' ? dados.erro : dados?.erro?.mensagem;
  return [typeof mensagem === 'string' && mensagem.trim()
    ? mensagem : 'Não foi possível concluir a operação.'];
}

// Mantido para compatibilidade com consumidores anteriores.
export function mensagemErroApi(erro, mensagemPadrao = 'Não foi possível concluir a operação.') {
  const dados = erro?.response?.data;
  const mensagem = typeof dados?.erro === 'string' ? dados.erro : dados?.erro?.mensagem;
  const detalhes = dados?.erro?.detalhes ?? dados?.erros;
  const textos = Array.isArray(detalhes)
    ? detalhes.filter((detalhe) => typeof detalhe === 'string' && detalhe.trim())
    : [];

  return [typeof mensagem === 'string' && mensagem.trim() ? mensagem : '', ...textos]
    .filter(Boolean).join(' · ') || mensagemPadrao;
}
