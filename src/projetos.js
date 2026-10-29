export async function cadastrarProjeto(api, nome) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) throw new Error('Informe o nome do projeto.');
  if (nomeLimpo.length > 100) throw new Error('O nome do projeto deve ter até 100 caracteres.');
  const { data } = await api.post('/projetos', { nome: nomeLimpo });
  return data;
}
