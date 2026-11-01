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

## Integração com a Shell

O `npm run build` gera dois ficheiros em `dist/`: `people-teams.js` (módulo ES) e `people-teams.css`.
A Shell tem de carregar **os dois**.

```js
const mf = await import("/microfrontends/people-teams.js");

mf.mount(document.getElementById("slot"), {
  apiBaseUrl: "https://<api-gateway>/api",  // omitir = dados de demonstração
  getToken: () => session.accessToken,      // chamado em cada pedido
  isAdmin: session.user.isAdmin,            // tem de ser exatamente `true` para editar
});

mf.unmount(document.getElementById("slot")); // ao sair da rota
```

- **Permissões:** com `isAdmin !== true` a lista de equipas é só de leitura (sem "New team" nem "Edit",
  com um aviso). Se as permissões mudarem, a Shell volta a chamar `mount()` (substitui a instância anterior).
- **Segurança:** `isAdmin` só esconde botões. O serviço People, Roles & Teams tem de recusar
  escritas de não-administradores com `403`; o microfrontend mostra "You don't have permission to do this."
  (e `401` como sessão expirada).
- **API** (assumida, a confirmar com o backend): `GET/POST /teams`, `PUT /teams/:id`, `GET /research-areas`,
  `GET /researchers`, com `Authorization: Bearer <token>`. Está tudo em [src/api.ts](src/api.ts).