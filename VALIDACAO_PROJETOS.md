# Criação de projetos no formulário — 29/10/2026

- Botão `+ Novo projeto` na criação e edição da tarefa, para a conta autenticada selecionada como responsável.
- Nome validado (não vazio, até 100 caracteres); erros da API, inclusive duplicidade, exibidos sem fechar o formulário.
- Projeto persistido pela operação existente `POST /projetos`. Proprietário determinado pelo servidor, nunca enviado pelo frontend.
- Seleção automática do projeto criado; texto, prioridade e demais dados da tarefa preservados ao atualizar a lista.
- Aviso explícito: criar o projeto o cadastra imediatamente, mesmo se a tarefa for cancelada.
- Ao escolher outro responsável, permanecem a seleção dos projetos existentes e a orientação de que novos projetos pertencem à própria conta.
- Sem alteração no backend, schema ou dados existentes de produção.

Validação: 13 testes automatizados aprovados, lint e build aprovados, auditoria sem vulnerabilidades conhecidas. No navegador conectado ao banco isolado, nome vazio foi recusado, projeto criado e selecionado sem perder o texto da tarefa e tarefa salva com a associação correta. Consulta independente ao PostgreSQL confirmou o projeto e sua associação à tarefa.
