# TaskFlow

## Entrega atual — uso real

- A tela de login não contém credenciais públicas; use uma conta fornecida pelo administrador.
- Exclusões usam confirmação acessível dentro da interface, com cancelamento e bloqueio de envios repetidos.
- Dependências atualizadas dentro das faixas compatíveis e auditoria sem alertas conhecidos na entrega.
- GitHub Actions executa instalação limpa, verificação de segredos, auditoria, testes, lint e build em pushes e pull requests.
- Nunca colocar senhas, tokens, arquivos `.env` ou backups neste repositório.
- O backend usa Prisma e mantém as permissões, datas e auditoria no PostgreSQL/Neon.

O provisionamento e a recuperação de acesso são feitos pelo operador do backend. Não há recuperação pública de senha por e-mail nesta versão.

Quadro de tarefas em React e Vite integrado à API Express do TaskFlow.

## Executar

```sh
npm install
npm run dev
```

Em desenvolvimento, a API padrão é `http://localhost:3001`, correspondente à configuração `PORTA=3001` já existente no backend. Para outra URL, configure `VITE_API_URL` em `.env.local`. Em produção, a URL padrão é `https://backend-api-black-seven.vercel.app`.

Faça login com uma conta cadastrada no seu banco. A aplicação envia o token nas requisições protegidas.

## Integração UC14 — Dias 1, 2 e 3

- Login, carregamento, salvamento, exclusão e movimentação exibem `erro.mensagem` e os itens de `erro.detalhes` como texto.
- A leitura dos erros mantém compatibilidade com as respostas antigas (`erro` como string e `erros` como lista).
- O formulário de tarefa aguarda a API e permanece aberto com os dados preenchidos quando ocorre uma falha. Durante o salvamento, os controles ficam desabilitados.
- O login impede envios repetidos e exige e-mail e senha preenchidos.
- A movimentação continua enviando somente a nova coluna, com o PUT parcial da API.
- Tarefas, prioridades ativas, usuários e projetos são carregados juntos com `Promise.all`.
- O modal possui labels e selects controlados de responsável, projeto e prioridade; os IDs são enviados como números.
- Projetos são filtrados pelo responsável e o nome dele aparece no card. O usuário logado também é restaurado após F5.
- CEP, cidade e ViaCEP foram retirados porque não fazem parte do banco.
- `mensagensDeErro`, exportada por `src/api.js`, retorna uma lista para a caixa de validação do modal. Texto vazio é enviado à API para mostrar a mensagem de validação.
- O modal permanece aberto em erros de validação, limite ou conexão. O botão mostra `Salvando...` durante a requisição.
- As cinco prioridades reais do banco têm badges e bordas próprias. A prioridade Média continua com ID 3.
- A API controla o acesso: usuários comuns consultam apenas os próprios dados; administradores podem alterar o responsável.

O backend correspondente está na pasta vizinha `backend.api`. O relatório das mudanças dos PDFs e as orientações de teste estão em `backend.api/UC14.md`. A coleção importável e os ambientes ficam em `backend.api/postman/`.

Os nomes enviados à API continuam `usuarioId`, `projetoId` e `idprioridade`. Os exemplos com nomes diferentes nos slides precisam ser adaptados a esse contrato.

## Verificar

```sh
npm test
npm run lint
npm run build
```
