# HumanISE.info - Investigadores e Equipas

Protótipo de um painel de informação sobre os investigadores, equipas,
colaborações e áreas de investigação da comunidade HumanISE. A aplicação
permite explorar os dados de demonstração e experimentar alguns fluxos de
edição através de perfis simulados.

> **Nota:** os registos apresentados são fictícios e servem apenas para
> demonstração. Os perfis e permissões não correspondem a pessoas ou contas
> reais.

## Funcionalidades

- **Visão geral:** resumo da comunidade e dos dados disponíveis.
- **Investigadores:** pesquisa e exploração de perfis, competências, equipas e
  áreas de investigação.
- **Equipas:** consulta de membros, coordenação, projetos e áreas associadas.
- **Áreas de investigação:** exploração das pessoas e equipas relacionadas com
  cada área.
- **Colaborações:** visualização da rede formada por investigadores que
  pertencem às mesmas equipas.
- **Edição de demonstração:** alteração de competências, descrições de equipas
  e membros, conforme o perfil selecionado.

As alterações e o perfil selecionado são guardados no `localStorage` do
navegador. A opção de repor os dados restaura o conjunto inicial de demonstração.
Não existe autenticação real nem persistência num servidor.

## Requisitos

- Node.js
- npm

## Começar

Na pasta `frontend`:

```sh
npm install
npm run dev
```

O Vite indica no terminal o endereço local para abrir no navegador.

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Cria a versão de produção em `dist/`. |
| `npm run preview` | Serve localmente a versão de produção compilada. |
| `npm test` | Executa os testes uma vez com Vitest. |
| `npm run test:watch` | Executa os testes em modo de observação. |
| `npm run lint` | Verifica o código com ESLint. |
| `npm run format` | Formata os ficheiros com Prettier. |

## Estrutura do projeto

```text
src/
├── components/
│   ├── shared/       # Componentes partilhados da aplicação
│   └── ui/           # Componentes de interface reutilizáveis
├── modules/
│   ├── dashboard/    # Visão geral
│   ├── data/         # Tipos, dados iniciais, consultas, operações e estado
│   ├── researchers/  # Funcionalidades de investigadores
│   └── teams/        # Funcionalidades de equipas
├── routes/           # Rotas da aplicação TanStack Router
├── test/             # Configuração e testes
├── router.tsx        # Configuração do router
├── server.ts         # Wrapper de erros para renderização no servidor
└── styles.css        # Estilos globais
```

O diretório `src/modules/data` concentra os dados e as operações da aplicação.
A interface consome esse estado através do provider e dos hooks do módulo; os
dados iniciais e as alterações locais são adequados a uma demonstração, não a
um ambiente de produção.

## Tecnologias

- React e TypeScript
- TanStack Start e TanStack Router
- Vite
- Tailwind CSS
- Vitest e Testing Library
