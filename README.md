# HumanISE.info - People & Teams Microfrontend

Microfrontend do contentor *People & Teams* (modelo C4), que implementa a user story
[#96 – Create and Edit Formal Teams and Details](https://github.com/FEUP-MEIC-DS-2026-27/h.i/issues/96):
o administrador cria e edita equipas formais (nome, descrição, áreas de investigação, líder)
e os restantes utilizadores consultam o diretório de equipas.

O protótipo completo anterior está na branch `v1-geral`.

## Comandos

## Cliente HTTP

`mount()` aceita `apiBaseUrl` para ligar ao API Gateway; sem este valor, usa os dados
de demonstração em memória. O cliente HTTP espera respostas JSON nos endpoints
`GET /teams`, `GET /research-areas`, `GET /researchers`, `POST /teams` e
`PUT /teams/{id}`. Se fornecido, `getToken` é chamado em cada pedido e o valor é
enviado como token Bearer.

```sh
npm install
npm run dev     # página standalone com dados de demonstração
npm test
npm run build   # dist/people-teams.js + dist/people-teams.css para a Shell
```
