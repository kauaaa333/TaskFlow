# TaskFlow

Quadro de tarefas com React e Vite, integrado a uma API Node.js com PostgreSQL.

[Aplicação](https://task-flow-gamma-inky.vercel.app/) · [Backend](https://github.com/kauaaa333/backend.api) · [Swagger](https://backend-api-black-seven.vercel.app/docs/)

## Executar

Requer Node.js 22.

```sh
npm ci
npm run dev
```

A API de desenvolvimento padrão é `http://localhost:3001`. Para outro endereço, configure `VITE_API_URL` em `.env.local`. A porta precisa corresponder à configuração do backend.

## Funcionalidades

- Login com conta cadastrada.
- Criação, edição, movimentação e exclusão de tarefas.
- Cadastro de projetos no formulário da tarefa.
- Prioridades e filtros do quadro.
- Filtro por usuário para administradores.
- Temas claro e escuro.

Usuários comuns visualizam seus próprios dados. Administradores podem acompanhar tarefas de outros usuários. Os filtros de usuário e prioridade funcionam juntos; os contadores acompanham a seleção.

O cadastro de contas e a recuperação de acesso são feitos pela administração. Não há cadastro público nem recuperação de senha por e-mail.

## Verificar

```sh
npm test
npm run lint
npm run build
```

O build é gerado em `dist/`. O GitHub Actions executa testes, lint e build em envios para `main` e pull requests.

Não inclua senhas, tokens ou arquivos `.env` no repositório.
