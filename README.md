# HumanISE.info - People & Teams Microfrontend

Microfrontend do contentor **People & Teams** (ver modelo C4). Implementa a
user story [#96 - Create and Edit Formal Teams and Details](https://github.com/FEUP-MEIC-DS-2026-27/h.i/issues/96):

> Como administrador, quero criar e editar equipas formais (nome, descrição,
> áreas de investigação, líder) para que o diretório de equipas reflita a organização.

- Administradores: listar, criar e editar equipas (validação de todos os campos e nome único).
- Restantes utilizadores: diretório só de leitura.
- Dados via API Gateway (`GET/POST /teams`, `PUT /teams/:id`, `GET /research-areas`, `GET /researchers`);
  sem `apiBaseUrl` usa dados fictícios em memória.

A versão anterior (protótipo completo) está na branch `v1-geral`.

## Comandos

```sh
npm install
npm run dev     # página standalone (?role=user para modo só de leitura)
npm test
npm run build   # gera dist/people-teams.js (+ .css)
```

## Integração com a Shell

```js
const { mount, unmount } = await import("/people-teams.js");
mount(document.getElementById("slot"), {
  apiBaseUrl: "https://gateway.example/people-teams",
  getToken: () => session.token,
  isAdmin: user.roles.includes("admin"),
});
// ao sair da rota: unmount(el)
```

A autorização real deve ser imposta pelo serviço; `isAdmin` apenas controla a UI.
