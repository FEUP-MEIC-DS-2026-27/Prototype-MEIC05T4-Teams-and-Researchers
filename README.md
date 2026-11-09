# HumanISE.info - People & Teams Microfrontend

Microfrontend de equipes para a VA1 de HumanISE.info, relacionado à issue
[#96 – Create and Edit Formal Teams and Details](https://github.com/FEUP-MEIC-DS-2026-27/h.i/issues/96).
Permite criar e editar equipes formais (nome, descrição, áreas de investigação e líder), pesquisar e filtrar o diretório.

O layout usa Bootstrap e CSS Modules sobre as variáveis de tema do host. O contrato federado não cria root nem router;
o host mantém a navegação e fornece a sessão/autorização.

## Comandos

```sh
npm install
npm run dev     # página standalone e remote Module Federation em localhost:3005
npm test
npm run build   # dist/mf-manifest.json + remoteEntry.js e a página standalone
```

## Importação na VA1 do h.i

Este repositório publica um remote Module Federation chamado `people_teams`, compatível com a VA1 do
[`h.i`](https://github.com/FEUP-MEIC-DS-2026-27/h.i). O remote partilha React, React DOM `18.3.1` e
React Router DOM `7.9.6` como singletons e expõe:

- `people_teams/TeamsPage`: página React de equipes; não cria root nem router.
- `people_teams/TeamsNavigationLink`: link `Teams` para a navegação existente da VA1.

Na estrutura principal, a VA1 pode importar `people_teams/TeamsPage` como uma rota filha, mantendo suas demais rotas.
Configure o remote e os tipos no host, sem substituir o `va1/App` ou as páginas já existentes:

```ts
remotes: {
  people_teams: "people_teams@http://localhost:3005/mf-manifest.json",
}
```

Declare o módulo remoto no projeto TypeScript do host, onde a geração automática de tipos está desativada:

```ts
declare module "people_teams/TeamsPage" {
  import type { ComponentType } from "react";
  const TeamsPage: ComponentType<{
    isAdmin?: boolean;
    apiBaseUrl?: string;
    getToken?: () => string | undefined;
  }>;
  export default TeamsPage;
}
```

Se o host não compartilhar os tipos-fonte deste microfrontend, declare as mesmas propriedades opcionais localmente:
`isAdmin`, `apiBaseUrl` e `getToken`.

Na rota do host, renderize `TeamsPage` sob a sessão autenticada e o router existente:

```tsx
<Route
  path="teams/*"
  element={<TeamsPage isAdmin={session.permissions.includes("teams:write")} getToken={getAccessToken} />}
/>
```

`isAdmin` controla apenas a visibilidade dos controles; o backend deve validar a permissão em cada `POST` e `PUT`.
`getToken` é consultado a cada requisição para enviar o bearer token. A URL base pode ser informada por `apiBaseUrl`
ou pela variável `PUBLIC_API_URL`.

Para desenvolvimento local, inicie este remote com `npm run dev`. O router da Shell/VA1 continua sendo o único router;
a página federada não cria um `BrowserRouter`.

Ao publicar, sirva todo o diretório `dist/` deste repositório e configure `REMOTE_PEOPLE_TEAMS_URL` com a URL do
`mf-manifest.json` publicado.

### Design e prévia standalone

Os componentes federados usam Bootstrap 5 e CSS Modules com tokens `--bs-*`; não carregam tema global próprio. O
entrypoint standalone carrega Bootstrap `5.3.8` para manter a mesma aparência.

Por padrão, a aplicação usa dados demonstrativos em memória; nesse modo os controles administrativos ficam disponíveis
para demonstrar criação e edição. Quando configurada uma API HTTP, a UI é somente leitura por padrão e o host pode
passar `isAdmin` após consultar a sessão autenticada. Falhas da API são apresentadas com opção de retry, sem fallback
silencioso para dados de demonstração.

### Backend e permissões

`docs/openapi.yaml` descreve o contrato esperado pelo formulário: `GET/POST /teams`, `PUT /teams/{id}`,
`GET /research-areas` e `GET /researchers`. A API deve responder aos formatos documentados e aplicar autorização
administrativa no servidor. O serviço atual do repositório principal ainda pode não implementar essas rotas; enquanto
isso, o modo de demonstração permite validar toda a jornada de criação e edição sem persistência.