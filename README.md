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
│   ├── EF01CO01/              # Base dos Classificadores (1º ano)
│   │   ├── index.ts           # GameConfig exportado
│   │   ├── types.ts           # Tipos TypeScript do jogo
│   │   ├── scenes/
│   │   │   ├── BootScene.ts   # Preload de assets
│   │   │   ├── GameScene.ts   # Lógica principal + drag & drop
│   │   │   └── UIScene.ts     # HUD paralelo (regra, progresso, mute)
│   │   └── data/
│   │       ├── items.ts       # Dataset de itens classificáveis
│   │       └── levels.ts      # Configuração dos 3 níveis
│   └── EF01CO06/              # Desktop Digital Infantil (1º ano)
│       ├── index.ts           # GameConfig exportado
│       ├── types.ts           # AppId, AppDef, Mission, LevelConfig
│       ├── scenes/
│       │   ├── BootScene.ts   # Texturas programáticas (ícones, wallpaper)
│       │   ├── GameScene.ts   # Desktop, janelas arrastáveis, 6 mini-apps
│       │   └── UIScene.ts     # HUD: missão ativa, passo atual, dots progresso
│       └── data/
│           ├── missions.ts    # Missões dos 3 níveis
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

## Referência Rápida dos 45 Jogos

| Código | Nome do Jogo | Ano | Eixo |
|--------|-------------|-----|------|
| EF01CO01 | Base dos Classificadores | 1º | PC |
| EF01CO02 | Trilha do Passo a Passo | 1º | PC |
| EF01CO03 | Oficina dos Algoritmos | 1º | PC |
| EF01CO04 | Correio Multimídia | 1º | MD |
| EF01CO05 | Pixel Secreto | 1º | MD |
| EF01CO06 | Desktop Digital Infantil | 1º | CD |
| EF01CO07 | Guardiões dos Dados | 1º | CD |
| EF02CO01 | Hangar dos Modelos | 2º | PC |
| EF02CO02 | Desfile do Robô Repetidor | 2º | PC |
| EF02CO03 | Fábrica de Máquinas | 2º | MD |
| EF02CO04 | Museu Vivo do Computador | 2º | MD |
| EF02CO05 | Cidade das Tecnologias | 2º | CD |
| EF02CO06 | Checklist do Jogador Seguro | 2º | CD |
| EF03CO01 | Tribunal do Verdadeiro ou Falso | 3º | PC |
| EF03CO02 | Labirinto do Enquanto | 3º | PC |
| EF03CO03 | Chef dos Subproblemas | 3º | PC |
| EF03CO04 | Montador de Informações | 3º | MD |
| EF03CO05 | Formato Certo | 3º | MD |
| EF03CO06 | Central de Entrada e Saída | 3º | MD |
| EF03CO07 | Detetives da Busca | 3º | CD |
| EF03CO08 | Estúdio Multiformato | 3º | CD |
| EF03CO09 | Investigação: Dados em Risco | 3º | CD |
| EF04CO01 | Batalha das Coordenadas | 4º | PC |
| EF04CO02 | Arquivo dos Registros | 4º | PC |
| EF04CO03 | Prédio dos Laços | 4º | PC |
| EF04CO04 | Tradutor da Máquina | 4º | MD |
| EF04CO05 | Ateliê de Códigos Digitais | 4º | MD |
| EF04CO06 | Estúdio de Produção Digital | 4º | CD |
| EF04CO07 | Missão Ética Digital | 4º | CD |
| EF04CO08 | Caça à Fonte Confiável | 4º | CD |
| EF05CO01 | Baralho das Listas | 5º | PC |
| EF05CO02 | Mapas em Rede | 5º | PC |
| EF05CO03 | Arena da Lógica | 5º | PC |
| EF05CO04 | Cidade das Decisões | 5º | PC |
| EF05CO05 | Monte seu Computador | 5º | MD |
| EF05CO06 | Missão Arquivo Seguro | 5º | MD |
| EF05CO07 | Controlador do Sistema | 5º | MD |
| EF05CO08 | Radar de Confiabilidade | 5º | CD |
| EF05CO09 | Curadoria com Créditos | 5º | CD |
| EF05CO10 | Futuro em Cena | 5º | CD |
| EF05CO11 | Escolha a Ferramenta Certa | 5º | CD |
| EF15CO01 | Museu das Estruturas | 1º–5º | PC |
| EF15CO02 | Academia dos Algoritmos | 1º–5º | PC |
| EF15CO03 | Circuito da Verdade | 1º–5º | PC |
| EF15CO04 | Arquiteto das Missões | 1º–5º | PC |

> PC = Pensamento Computacional | MD = Mundo Digital | CD = Cultura Digital

## Jogos implementados

| Código | Nome | Ano | Eixo | Slug |
|--------|------|-----|------|------|
| EF01CO01 | Base dos Classificadores | 1º | Pensamento Computacional | `base-dos-classificadores` |
| EF01CO02 | Trilha do Passo a Passo | 1º | Pensamento Computacional | `trilha-do-passo-a-passo` |
| EF01CO03 | Oficina dos Algoritmos | 1º | Pensamento Computacional | `oficina-dos-algoritmos` |
| EF01CO05 | Pixel Secreto | 1º | Mundo Digital | `pixel-secreto` |
| EF01CO06 | Desktop Digital Infantil | 1º | Cultura Digital | `desktop-digital-infantil` |
| EF01CO07 | Guardiões dos Dados | 1º | Cultura Digital | `guardioes-dos-dados` |
| EF02CO01 | Hangar dos Modelos | 2º | Pensamento Computacional | `hangar-dos-modelos` |
| EF02CO02 | Desfile do Robô Repetidor | 2º | Pensamento Computacional | `desfile-do-robo-repetidor` |
| EF02CO03 | Fábrica de Máquinas | 2º | Mundo Digital | `fabrica-de-maquinas` |
| EF02CO04 | Museu Vivo do Computador | 2º | Mundo Digital | `museu-vivo-do-computador` |
| EF02CO05 | Cidade das Tecnologias | 2º | Cultura Digital | `cidade-das-tecnologias` |
| EF02CO06 | Checklist do Jogador Seguro | 2º | Cultura Digital | `checklist-do-jogador-seguro` |
| EF03CO01 | Tribunal do Verdadeiro ou Falso | 3º | Pensamento Computacional | `tribunal-do-verdadeiro-ou-falso` |
| EF03CO02 | Labirinto do Enquanto | 3º | Pensamento Computacional | `labirinto-do-enquanto` |
| EF03CO03 | Chef dos Subproblemas | 3º | Pensamento Computacional | `chef-dos-subproblemas` |
| EF03CO04 | Montador de Informações | 3º | Mundo Digital | `montador-de-informacoes` |
| EF03CO05 | Formato Certo | 3º | Mundo Digital | `formato-certo` |
| EF03CO06 | Central de Entrada e Saída | 3º | Mundo Digital | `central-de-entrada-e-saida` |
| EF03CO07 | Detetives da Busca | 3º | Cultura Digital | `detetives-da-busca` |
| EF03CO08 | Estúdio Multiformato | 3º | Cultura Digital | `estudio-multiformato` |
| EF03CO09 | Investigação: Dados em Risco | 3º | Cultura Digital | `investigacao-dados-risco` |
| EF04CO01 | Batalha das Coordenadas | 4º | Pensamento Computacional | `batalha-das-coordenadas` |
| EF04CO02 | Arquivo dos Registros | 4º | Pensamento Computacional | `arquivo-dos-registros` |
| EF04CO03 | Prédio dos Laços | 4º | Pensamento Computacional | `predio-dos-lacos` |
| EF04CO04 | Tradutor da Máquina | 4º | Mundo Digital | `tradutor-da-maquina` |
| EF04CO05 | Ateliê de Códigos Digitais | 4º | Mundo Digital | `atelier-codigos-digitais` |
| EF05CO01 | Baralho das Listas | 5º | Pensamento Computacional | `baralho-das-listas` |

> **45 de 45 jogos implementados**

---

### EF01CO01 — Base dos Classificadores

Jogo de drag & drop onde o aluno classifica formas geométricas por cor, forma ou tamanho arrastando-as para a base correta.

- **3 níveis**: cor + 6 círculos + 20 s (N1) → cor + 12 itens + 25 s (N2) → forma + 18 itens em 2 linhas + 30 s (N3)
- **Áudio sintético**: Web Audio API — acerto, erro, countdown, fanfarra, aviso de timer — sem arquivos externos
- **Texturas programáticas**: círculo, quadrado, triângulo e retângulo × 4 cores × 3 tamanhos
- **Tela de início** com apresentação antes de inicializar o Phaser

---

### EF01CO06 — Desktop Digital Infantil

Simulador de desktop infantil onde o aluno recebe missões narradas e precisa identificar e usar o app correto para completá-las.

- **6 mini-apps funcionais**: Câmera, Gravador, Desenho (canvas livre + paleta), Calculadora, Navegador, Player
- **Sistema de janelas**: `Container` arrastável via `pointermove`, `setDepth` para z-order
- **3 níveis**: 2 apps + 20s (N1) → 4 apps + 25s (N2) → 6 apps + 30s (N3)
- **Áudio sintético**: Web Audio API — sem arquivos externos

---

### EF02CO01 — Hangar dos Modelos

Showroom de veículos onde o aluno usa filtros para agrupá-los e descobre padrões e atributos em comum.

- **N1**: filtro binário "Voa?" com animação de separação em zonas
- **N2**: comparação lado a lado de 2 veículos com 4 atributos (IGUAL / DIFERENTE)
- **N3**: descoberta do atributo que une um grupo destacado em dourado (MCQ)
- **12 veículos** com atributos `voa`, `temRodas`, `temMotor`, `meio`
- **Assets PNG reais** via import Vite em `src/assets/games/EF02CO01/`

---

### EF03CO07 — Detetives da Busca

Buscador digital simulado onde o aluno digita palavras-chave, aplica filtros e avalia relevância e confiabilidade dos resultados.

- **N1**: 3 missões de busca simples — escolhe keyword em chips + identifica o resultado relevante
- **N2**: acrescenta filtros toggle (Sites / Imagens) que reordenam os resultados
- **N3**: combina keyword + filtro; resultados com indicador de confiabilidade (✅ / ⚠️)
- **Layout de referência**: padrão `drawPanel(72, 142, 1136, 486)` adotado como padrão visual do projeto a partir deste jogo
- **Assets PNG reais** via import Vite em `src/assets/games/EF03CO07/`

---

### EF03CO08 — Estúdio Multiformato

Estúdio criativo digital onde o aluno escolhe a ferramenta certa para cada tarefa, cria produções e as publica no mural da turma.

- **N1** (30s): 3 matchings de formato — toca no card correto (Desenho 🎨 / Texto 📝 / Som 🎵 / Foto 📷)
- **N2** (50s): fase de desenho livre (≥8 manchas) + fase de texto (banco de palavras, ≥3 palavras) — ambas publicam no mural com tween de voo
- **N3** (60s): 2 ciclos — escolhe formato entre 3 opções → mini-editor → publica no mural
- **Painel dividido** em N2/N3: zona editora (esquerda) + mural da turma (direita) dentro do mesmo `drawPanel`
- **Assets PNG reais** em `src/assets/games/EF03CO08/`

---

### EF03CO09 — Investigação: Dados em Risco

Jogo investigativo onde o aluno aprende a reconhecer o impacto de compartilhar dados pessoais online.

- **N1** (30s): 6 cards de informação em sequência — tap "🔒 Seguro" ou "⚠️ Perigoso"
- **N2** (45s): 3 cenários de compartilhamento → escolher a consequência correta entre 3 opções
- **N3** (55s): 2 incidentes × 2 perguntas — identificar o erro cometido e a atitude correta
- **Paleta investigação**: vermelho (#dc2626) + âmbar (#f59e0b); backgrounds de cena do crime
- **Assets PNG reais** em `src/assets/games/EF03CO09/`

---

### EF04CO01 — Batalha das Coordenadas

Jogo de grade matricial onde o aluno localiza células usando coordenadas (linha-letra × coluna-número).

- **N1** (35s): grade 4×4 — toca na célula da coordenada chamada (ex: "B-3")
- **N2** (45s): grade 4×4 com emoji posicionado — seleciona a coordenada correta em MCQ
- **N3** (55s): grade 5×5 — batalha naval; 4 navios escondidos, click para atacar (💥 hit / 🌊 miss)
- **Assets PNG reais** em `src/assets/games/EF04CO01/`

---

### EF04CO02 — Arquivo dos Registros

Jogo de fichas de dados onde o aluno lê registros com campos nomeados, filtra e responde perguntas.

- **N1** (35s): 4 fichas horizontais visíveis → toca a que satisfaz o campo pedido
- **N2** (45s): ficha expandida com todos os campos → MCQ para o valor do campo perguntado
- **N3** (55s): grade 4×2 com 8 registros completos → perguntas de contagem e filtro
- **Dataset**: 8 estudantes com campos Nome, Cidade, Hobby, Idade, Animal
- **Assets PNG reais** em `src/assets/games/EF04CO02/`

---

### EF04CO03 — Prédio dos Laços

Editor visual de laços onde o aluno programa o limpador de janelas para percorrer andares e janelas.

- **N1** (35s): laço simples — MCQ para o count correto → animação do limpador
- **N2** (45s): laço aninhado — botões +/- para outer (andares) e inner (janelas/andar) → executar
- **N3** (55s): eficiência — configura ambos os laços + prevê quantas janelas sujas serão limpas
- **Cores de laço**: externo azul (#1e40af), interno verde (#16a34a)
- **Assets PNG reais** em `src/assets/games/EF04CO03/`

---

### EF04CO04 — Tradutor da Máquina

Máquina de codificação onde o aluno traduz letras para binário (e vice-versa) usando tabela de referência.

- **Codificação**: 8 letras A–H com códigos 3-bit (A=000 … H=111) — tabela sempre visível
- **N1** (35s): letra destacada no teclado virtual → MCQ do código binário correspondente
- **N2** (45s): palavra de 3 letras → codificar letra a letra, acumulando código no visor
- **N3** (55s): código binário no visor → decodificar grupo a grupo para recuperar a palavra
- **Assets PNG reais** em `src/assets/games/EF04CO04/`

---

### EF04CO05 — Ateliê de Códigos Digitais

Três oficinas de codificação: binária (PBM), ASCII e cores RGB.

- **N1** (35s): grade 4×4 clicável (0=branco/1=preto) — reproduzir padrão-alvo PBM
- **N2** (45s): grupos binários exibidos → selecionar letra correspondente em MCQ (tabela visível)
- **N3** (55s): sliders R/G/B com 5 passos (0–255) — misturar a cor-alvo com tolerância ±32
- **Assets PNG reais** em `src/assets/games/EF04CO05/`