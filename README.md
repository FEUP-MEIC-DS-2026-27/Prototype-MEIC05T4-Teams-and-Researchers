# HumanISE.info - People & Teams Microfrontend

Esqueleto básico do microfrontend *People & Teams* para a user story
[#96 – Create and Edit Formal Teams and Details](https://github.com/FEUP-MEIC-DS-2026-27/h.i/issues/96):
o administrador cria e edita equipas formais (nome, descrição, áreas de investigação, líder).

Já funciona: listar equipas, criar e editar (nome + descrição) com dados em memória.
O resto está marcado com `TODO [Pessoa N]` no código. O protótipo completo anterior está na branch `v1-geral`.

```sh
npm install
npm run dev
npm test
npm run build   # dist/people-teams.js com mount()/unmount() para a Shell
```

## Divisão de trabalho (6 pessoas)

| # | Tarefa | Ficheiros |
|---|--------|-----------|
| 1 | Seletor múltiplo de áreas de investigação no formulário (`areaIds`) + testes | `TeamForm.tsx`, `TeamsAdminApp.tsx` |
| 2 | Seletor de líder da equipa (`leaderId`) + testes | `TeamForm.tsx`, `TeamsAdminApp.tsx` |
| 3 | Validação completa (descrição, áreas ≥ 1, líder, limites, nome único) + testes | `validation.ts`, `teams.test.tsx` |
| 4 | Cliente HTTP para o API Gateway, loading/erro/retry no carregamento + testes | `api.ts`, `TeamsAdminApp.tsx` |
| 5 | Permissões (`isAdmin`, modo só de leitura) e integração com a Shell | `TeamsAdminApp.tsx`, `mount.tsx` |
| 6 | Tabela completa (áreas, líder), pesquisa/filtro, feedback após guardar, estilos e acessibilidade | `TeamsAdminApp.tsx`, `styles.css` |

Os `it.todo` em `src/teams.test.tsx` indicam os testes por escrever.
