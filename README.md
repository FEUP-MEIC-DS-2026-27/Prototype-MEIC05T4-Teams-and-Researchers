# HumanISE.info - People & Teams Microfrontend

Microfrontend do contentor *People & Teams* (modelo C4), que implementa a user story
[#96 – Create and Edit Formal Teams and Details](https://github.com/FEUP-MEIC-DS-2026-27/h.i/issues/96):
o administrador cria e edita equipas formais (nome, descrição, áreas de investigação, líder)
e os restantes utilizadores consultam o diretório de equipas.

O protótipo completo anterior está na branch `v1-geral`.

## Comandos

```sh
npm install
npm run dev     # página standalone e remote Module Federation em localhost:3005
npm test
npm run build   # dist/mf-manifest.json + remoteEntry.js e a página standalone
```

## Importação na VA1 do h.i

Este repositório publica um remote Module Federation chamado `people_teams`, compatível com a VA1 do
[`h.i`](https://github.com/FEUP-MEIC-DS-2026-27/h.i). O remote partilha React e React DOM `18.3.1` e
React Router DOM `7.9.6` como singletons e expõe:

- `people_teams/TeamsPage`: página React de equipes; não cria root nem router.
- `people_teams/TeamsNavigationLink`: link `Teams` para a navegação existente da VA1.

Para desenvolvimento local, inicie este remote com `npm run dev`. Na configuração Module Federation da VA1 do
`h.i`, adicione o remote sem substituir a VA1 nem os seus remotes/rotas atuais:

```ts
remotes: {
  people_teams: "people_teams@http://localhost:3005/mf-manifest.json",
},
```

Na `App.tsx` existente, importe `people_teams/TeamsPage` e `people_teams/TeamsNavigationLink` e use-os na navegação
e na árvore `Routes` já existentes, preservando as rotas de pesquisadores:

```tsx
<nav className="nav nav-tabs">
  {/* keep the existing Researchers navigation */}
  <TeamsNavigationLink basePath={basePath} />
</nav>
<Routes>
  {/* keep the existing researcher search and profile routes */}
  <Route path="teams" element={<TeamsPage />} />
</Routes>
```

Como a geração automática de tipos remotos está desativada, declare os módulos na VA1 do host, por exemplo em
`apps/va1/src/remote-modules.d.ts`:

```ts
declare module "people_teams/TeamsPage" {
  import type { ComponentType } from "react";
  const TeamsPage: ComponentType;
  export default TeamsPage;
}

declare module "people_teams/TeamsNavigationLink" {
  import type { ComponentType } from "react";
  const TeamsNavigationLink: ComponentType<{ basePath: string }>;
  export default TeamsNavigationLink;
}
```

Ao publicar, sirva todo o diretório `dist/` deste repositório e aponte o remote para o seu `mf-manifest.json`.

O router e o `createRoot` continuam pertencendo à Shell/VA1. O entrypoint `mount()` é mantido somente para o
protótipo standalone e consumidores legados; não deve ser chamado ao integrar na VA1.

### Design e prévia standalone

Os componentes federados usam classes Bootstrap 5 e não carregam uma folha de estilos global própria: a VA1 fornece o
Bootstrap e o tema compartilhados. O entrypoint standalone carrega Bootstrap `5.3.8` para manter a mesma aparência.

A página federada é somente para leitura. Na prévia standalone, os controles administrativos de demonstração ficam
desativados por padrão e só podem ser exibidos durante `npm run dev` com `?demoAdmin=true`; os dados continuam apenas
em memória e não são persistidos. Esse parâmetro não é um mecanismo de autenticação e não funciona no build de produção.

### Backend e permissões

`services/people-teams` no `h.i` oferece atualmente apenas leituras de pesquisadores (`GET /api/researchers`,
`/api/researchers/facets`, `/api/researchers/suggestions`, `/api/researchers/summary` e
`/api/researchers/{researcher_id}`). Não há endpoints de equipes ou áreas de investigação, nem autorização de
administrador. O endpoint atual de busca de pesquisadores também não fornece o formato de IDs string esperado pelo
seletor de líderes sem um adaptador. Por isso, `TeamsPage` usa exemplos em memória, identifica-os como demonstração e
permanece somente para leitura. Criar/editar no protótipo standalone não persiste dados.

Para habilitar persistência, o serviço precisará oferecer operações equivalentes às abaixo (elas **não existem** hoje):

- `GET /api/teams`, `POST /api/teams` e `PUT /api/teams/{id}`;
- `GET /api/research-areas`;
- uma operação de consulta de pesquisadores no formato usado pelo seletor de líderes;
- autenticação e autorização administrativa aplicadas no backend às operações de escrita.

Para restringir CRUD a administradores, a Shell deve obter a permissão de uma sessão autenticada e usá-la apenas para
controlar a visibilidade dos controles. O serviço precisa validar o token e a permissão em **cada** criação/edição e
responder `401`/`403` quando apropriado; esconder botões ou passar um booleano ao React não é uma barreira de
segurança. Não use query string, estado local ou seleção de perfil como autorização. Até existirem endpoints e
autorização reais, a VA1 deve continuar usando a página federada somente para leitura.