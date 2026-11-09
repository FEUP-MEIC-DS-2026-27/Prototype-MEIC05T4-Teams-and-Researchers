# HumanISE.info - Teams Microfrontend

Microfrontend de equipes para a VA1 de HumanISE.info. A página federada oferece a visão somente de leitura
**Teams Overview**, com busca por nome, estado e número de membros, seguindo o contrato do serviço de equipes
da estrutura atual do repositório principal.

O formulário administrativo standalone permanece disponível para o protótipo local; ele usa dados em memória e
não é exposto na integração com a VA1.

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

Na configuração atual, a VA1 continua sendo o remote principal (`va1/App`) e carrega `TeamsPage` como uma rota filha
em `/va1/teams`. A URL do manifest é configurada em `federation-value-areas/apps/va1/.env` e pode ser alterada
sem substituir o remote ou as rotas atuais:

```env
REMOTE_PEOPLE_TEAMS_URL=http://localhost:3005/mf-manifest.json
```

Para desenvolvimento local, inicie o remote com `npm run dev` e a VA1 com `pnpm --filter @value-areas/va1 dev`.
O router da Shell/VA1 continua sendo o único router; a página federada não cria um `BrowserRouter`.

Ao publicar, sirva todo o diretório `dist/` deste repositório e configure `REMOTE_PEOPLE_TEAMS_URL` com a URL do
`mf-manifest.json` publicado.

### Design e prévia standalone

Os componentes federados usam classes Bootstrap 5 e não carregam uma folha de estilos global própria: a VA1 fornece o
Bootstrap e o tema compartilhados. O entrypoint standalone carrega Bootstrap `5.3.8` para manter a mesma aparência.

`PUBLIC_USE_MOCK` controla os dados da página federada: qualquer valor diferente de `false` usa a lista de demonstração
(Alpha Team e Beta Team); com `false`, a página consulta `GET ${PUBLIC_TEAMS_API_URL}/teams`. O endereço base padrão é
`/api/people`, o mesmo usado pelo cliente Teams Overview da VA1. A página exibe erro e permite tentar novamente quando
a API falha; não converte falhas em dados falsos.

Na prévia standalone, o formulário administrativo continua disponível apenas para demonstração e usa dados em memória,
sem persistência. A rota federada não expõe ações de criação ou edição.

### Backend e permissões

O endpoint de Teams Overview é somente de leitura e responde uma lista com `id`, `name`, `status` e `memberCount`.
O formulário standalone não deve ser usado para inferir suporte de criação/edição ou autorização no backend.