# HumanISE.info - People & Teams Microfrontend

Esqueleto básico do microfrontend *People & Teams* para a user story
[#96 – Create and Edit Formal Teams and Details](https://github.com/FEUP-MEIC-DS-2026-27/h.i/issues/96):
o administrador cria e edita equipas formais (nome, descrição, áreas de investigação, líder).

Já funciona: listar equipas, criar e editar (nome + descrição) com dados em memória.
O resto está marcado com `TODO [Pessoa N]` no código. O protótipo completo anterior está na branch `v1-geral`.

## Cliente HTTP

`mount()` aceita `apiBaseUrl` para ligar ao API Gateway; sem este valor, usa os dados
de demonstração em memória. O cliente HTTP espera respostas JSON nos endpoints
`GET /teams`, `GET /research-areas`, `GET /researchers`, `POST /teams` e
`PUT /teams/{id}`. Se fornecido, `getToken` é chamado em cada pedido e o valor é
enviado como token Bearer.

```sh
npm install
npm run dev
npm test
npm run build   # dist/people-teams.js com mount()/unmount() para a Shell
```