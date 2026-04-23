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
│       ├── GameLauncher.tsx   # Tela de início + envia START_GAME via bridge
│       ├── GameFrame.tsx      # Roteia entre GameLauncher (local) e IframeGameFrame
│       └── IframeGameFrame.tsx # Renderiza <iframe> e comunica via postMessage
│
├── shared/                    # Código compartilhado React ↔ Phaser
│   ├── EventBus.ts            # Singleton Phaser.Events (uso interno de cenas)
│   ├── bridge/
│   │   ├── runtimeGameBridge.ts  # Auto-detecta contexto e roteia (local/iframe)
│   │   ├── gameBridge.ts         # Lado React: assina eventos do jogo
│   │   ├── localBridge.ts        # Implementação via CustomEvent
│   │   └── iframeBridge.ts       # Implementação via postMessage
│   ├── contracts/
│   │   ├── platformEvents.ts     # Tipos de eventos Phaser → React
│   │   ├── platformCommands.ts   # Tipos de comandos React → Phaser
│   │   └── iframeMessages.ts     # Wrappers para postMessage
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
└── GameFrame (React)             ← roteia entre modo local e iframe
    └── GameLauncher (React)      ← tela "Vamos Jogar!", gerencia níveis via bridge
        ├── [Tela de início]      ← exibida antes de inicializar o Phaser
        └── PhaserCanvas (React)  ← cria Phaser.Game no useEffect (após clique)
            └── Phaser.Game
                ├── BootScene     ← preload de assets
                ├── GameScene     ← lógica + render + drag & drop
                └── UIScene       ← HUD paralelo (roda ao mesmo tempo)
```

### Tela de início ("Vamos Jogar!")

Antes de inicializar o Phaser, o `GameLauncher` exibe uma tela de apresentação com o nome, descrição e ícone do jogo. O Phaser só é criado após o clique em "Vamos Jogar!" — isso respeita a política de autoplay de áudio dos navegadores e dá tempo ao jogador para se preparar.

```tsx
<GameFrame
  gameId="base-dos-classificadores"
  level={currentLevel}
  points={points}
  lives={lives}
  config={gameConfig}
  onPlatformEvent={handlePlatformEvent}
/>
```

### Bridge de comunicação (React ↔ Phaser)

A comunicação usa um sistema de bridge tipado com detecção automática de contexto:

**Phaser → React** (via `runtimeGameBridge.emit`):
```ts
runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId, stage })
runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId, pointsEarned, stage })
runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId, pointsEarned, stage })
runtimeGameBridge.emit({ type: 'GAME_OVER', gameId, stage })
```

**React → Phaser** (via `GameLauncher` + `gameBridge`):
```ts
// GameLauncher envia automaticamente quando `level` muda:
{ type: 'START_GAME', gameId, stage, points, lives }
```

O `runtimeGameBridge` detecta automaticamente se o jogo está rodando diretamente no DOM (usa `CustomEvent`) ou dentro de um `<iframe>` (usa `postMessage`). O código do jogo não muda entre os dois modos.

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

### EF01CO01 — Base dos Classificadores

Jogo de drag & drop onde o aluno classifica formas geométricas por cor, forma ou tamanho arrastando-as para a base correta.

- **3 níveis de progressão**: cor, 6 itens, 30s (N1) → cor, 12 itens, 45s (N2) → forma, 12 itens, 60s (N3)
- **Áudio sintético**: sons gerados via Web Audio API (acerto, erro, countdown, fanfarra, aviso de timer) — sem arquivos externos
- **Interface adaptada**: alto contraste, ícones grandes, feedback visual e sonoro a cada ação
- **Texturas programáticas**: círculo, quadrado, triângulo e retângulo em 4 cores × 3 tamanhos (sem assets externos)
- **Tela de início** com apresentação antes de inicializar o Phaser