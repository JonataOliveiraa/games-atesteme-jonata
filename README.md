# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# Plataforma de Jogos Educativos — BNCC Computação (EF I)

Plataforma web com 45 jogos digitais cobrindo todas as habilidades de Computação do 1º ao 5º ano do Ensino Fundamental, baseados na BNCC — Computação (SBC/MEC).

**Público-alvo:** Alunos de 6 a 11 anos (1º ao 5º ano EF)

---

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Shell (plataforma) | React + TypeScript | React 19 / TS 6 |
| Bundler | Vite | 8.x |
| Engine de jogos | Phaser 3 | 3.90.0 |
| Roteamento | React Router DOM | 7.x |
| Estilo (plataforma) | CSS global | — |

> **Regra de ouro:** React gerencia navegação, UI e progresso. Phaser gerencia 100% da lógica e renderização de cada jogo. Os dois nunca renderizam na mesma área do DOM ao mesmo tempo.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) **v18 ou superior**
- [npm](https://www.npmjs.com/) v9 ou superior (vem com o Node)

---

## Instalação

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd games-atesteme

# 2. Instale todas as dependências
npm install
```

Isso instala:
- React 19 + React DOM
- React Router DOM v7
- **Phaser 3.90.0** (engine dos jogos)
- Vite 8 + TypeScript 6
- ESLint e plugins

---

## Executando em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173` no navegador.

O servidor tem **Hot Module Replacement (HMR)** — alterações nos arquivos React são refletidas instantaneamente. Alterações nas Scenes Phaser recarregam o módulo automaticamente.

---

## Build de produção

```bash
# Compila TypeScript e gera os arquivos otimizados em /dist
npm run build

# Visualiza o build gerado localmente
npm run preview
```

---

## Outros comandos

```bash
# Lint (ESLint)
npm run lint
```

---

## Estrutura do projeto

```
src/
├── games/                     # Jogos individuais (Phaser 3)
│   └── EF01CO01/              # Base dos Classificadores (1º ano)
│       ├── index.ts           # GameConfig exportado
│       ├── types.ts           # Tipos TypeScript do jogo
│       ├── scenes/
│       │   ├── BootScene.ts   # Preload de assets
│       │   ├── GameScene.ts   # Lógica principal + drag & drop
│       │   └── UIScene.ts     # HUD paralelo (regra, progresso, mute)
│       └── data/
│           ├── items.ts       # Dataset de itens classificáveis
│           └── levels.ts      # Configuração dos 3 níveis
│
├── platform/                  # Componentes React da plataforma
│   └── components/
│       ├── PhaserCanvas.tsx   # Monta/desmonta instância Phaser.Game
│       └── GameLauncher.tsx   # Conecta React ↔ Phaser via EventBus
│
├── shared/                    # Código compartilhado React ↔ Phaser
│   ├── EventBus.ts            # Singleton de comunicação (Phaser.Events)
│   ├── types/
│   │   └── game.ts            # GameCode, GameLevel, RoundResult, GameProgress
│   └── utils/
│       └── progressStore.ts   # Wrapper de localStorage para progresso
│
├── pages/                     # Páginas React
│   ├── GamesPage.tsx          # Listagem de jogos com paginação
│   ├── GameDetailsPage.tsx    # Página de jogo (monta o GameLauncher)
│   └── ResourcesPage.tsx      # Moedas, vidas e dicas
│
├── context/                   # Estado global da plataforma (moedas, vidas)
├── components/                # Componentes reutilizáveis (GameCard)
├── layouts/                   # Layout principal com header/nav
├── data/                      # Catálogo de jogos
├── types/                     # Tipos React da plataforma
├── hooks/                     # Hooks utilitários
└── styles/
    └── global.css             # Estilo da plataforma (nunca dentro do Phaser)
```

---

## Como funciona a integração React ↔ Phaser

```
GameDetailsPage (React)
└── GameLauncher (React)          ← ouve EventBus, persiste progresso
    └── PhaserCanvas (React)      ← cria Phaser.Game no useEffect
        └── Phaser.Game
            ├── BootScene         ← preload de assets
            ├── GameScene         ← lógica + render + drag & drop
            └── UIScene           ← HUD paralelo (roda ao mesmo tempo)
```

**React → Phaser** (via EventBus):
```ts
EventBus.emit('set-level', 2)     // troca o nível
EventBus.emit('mute-audio', true) // silencia o jogo
```

**Phaser → React** (via EventBus):
```ts
EventBus.emit('round-complete', result) // React salva progresso
EventBus.emit('game-over', result)      // React exibe tela de conclusão
EventBus.emit('request-exit')           // React navega ao menu
```

---

## Adicionando um novo jogo

1. Crie a pasta `src/games/[CODIGO]/` seguindo a estrutura acima
2. Implemente `types.ts`, `data/levels.ts`, `data/items.ts`
3. Implemente `BootScene.ts`, `GameScene.ts`, `UIScene.ts`
4. Crie `index.ts` com o `GameConfig` e exporte como `default`
5. Registre o slug no mapa `SLUG_TO_CODE` em `GameDetailsPage.tsx`
6. Registre o loader em `GAME_CONFIG_LOADERS` em `GameDetailsPage.tsx`

---

## Assets (áudio e imagens)

Os assets de áudio e imagem ainda **não estão incluídos**. As Scenes Phaser geram elementos visuais programaticamente enquanto os arquivos reais não existem.

Quando os assets estiverem prontos, adicionar em:
```
public/
  assets/
    audio/    ← .ogg + .mp3 (sempre os dois formatos)
    images/   ← atlas PNG + JSON
    fonts/    ← bitmap fonts para texto Phaser
```

Os `load.audio(...)` e `load.atlas(...)` já estão comentados em cada `BootScene.ts` com o caminho correto — basta descomentar.

---

## Jogos implementados

| Código | Nome | Ano | Eixo | Status |
|--------|------|-----|------|--------|
| EF01CO01 | Base dos Classificadores | 1º | Pensamento Computacional | ✅ Implementado |