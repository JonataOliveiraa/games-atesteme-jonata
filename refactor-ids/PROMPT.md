# Refatoração de identidade dos jogos — especificação completa

> Este documento é auto-contido. Quem ler só ele deve conseguir executar a
> refatoração inteira sem precisar de contexto adicional da conversa.

---

## 1. O projeto

Plataforma educacional de jogos alinhados à BNCC Computação, para os anos
iniciais do Ensino Fundamental (1º ao 5º ano).

**Stack:** React 18 + TypeScript + Vite + React Router + Phaser 3.90.

**Arquitetura:** o React é a plataforma (catálogo, pontos, vidas, bloqueios,
ranking, histórico) e cada jogo é uma cena Phaser carregada sob demanda dentro
de um canvas. Os dois lados se falam por um *bridge* de eventos
(`PlatformEvent` / `PlatformCommand`) e por um `EventBus` singleton.

**Escala atual:** 45 jogos implementados. A meta é chegar a 200.

**Estrutura relevante:**

```
src/
  data/games.ts                 catálogo (o arquivo que vamos explodir)
  types/game.ts                 type Game
  shared/types/game.ts          type GameCode (união de 45 strings literais)
  context/GameContext.tsx       pontos, vidas, bloqueios, histórico (localStorage)
  pages/GameDetailsPage.tsx     página do jogo: monta o Phaser
  pages/GamesPage.tsx           listagem paginada
  pages/RankingPage.tsx
  pages/ResourcesPage.tsx
  components/GameCard.tsx
  platform/components/          GameFrame -> GameLauncher -> PhaserCanvas
  games/EF01CO01/index.ts       config do Phaser de cada jogo
  games/EF01CO01/scenes/...
  assets/games/EF01CO01/*.png
```

---

## 2. Como está hoje

O código da habilidade BNCC — `EF01CO01`, `EF02CO03`, `EF15CO04` — é usado como
**identidade do jogo**. Ele aparece como:

**a) Chave do registro de dados** (`src/data/games.ts`)

```ts
const gameByCode: Partial<Record<string, Omit<Game, "id">>> = {
  EF01CO01: { title: "Base dos Classificadores", slug: "base-dos-classificadores", ... },
  EF01CO02: { ... },
  // ... 45 entradas
};
```

**b) Lista de ordenação, em paralelo** (mesmo arquivo)

```ts
const gameOrder = ["EF01CO01", "EF01CO02", /* ... 45 strings ... */];

export const games: Game[] = gameOrder.map((code, index) => {
  const game = gameByCode[code];
  return game ? { id: index, ...game } : placeholderGame(code, index);
});
```

**c) Nome da pasta física**

```
src/games/EF01CO01/
src/assets/games/EF01CO01/
```

**d) Chave do carregador dinâmico do Phaser** (`GameDetailsPage.tsx`)

```ts
const GAME_CONFIG_LOADERS: Partial<Record<GameCode, () => Promise<...>>> = {
  EF01CO01: () => import("../games/EF01CO01/index"),
  // ... 45 linhas escritas à mão
};
```

**e) Um segundo mapa manual, invertido** (`GameDetailsPage.tsx`)

```ts
const SLUG_TO_CODE: Record<string, GameCode> = {
  "base-dos-classificadores": "EF01CO01",
  // ... 45 linhas
};
```

**f) Um terceiro mapa, incompleto** (`GameContext.tsx`)

```ts
const GAME_CODE_TO_SLUG: Record<string, string> = {
  EF01CO01: "base-dos-classificadores",
  EF01CO03: "oficina-dos-algoritmos",
  EF01CO05: "pixel-secreto",
  EF01CO07: "guardioes-dos-dados",
};   // ← 4 de 45
```

**g) E, finalmente, o metadado pedagógico que ele de fato é.**

Em paralelo, o `slug` acumula dois papéis:

- identidade pública: `/jogos/:slug`
- chave de estado: é por slug que `GameContext` indexa pontos, vidas,
  bloqueios e histórico no `localStorage`

E o campo `id` do tipo `Game` é `number` e vale **o índice do array**:

```ts
export type Game = {
  id: number;      // ← posição em gameOrder
  title: string;
  description: string;
  category: string;
  points: number;
  icon: string;
  slug: string;
  thumbnail?: string;
};
```

---

## 3. Por que isso está errado

### 3.1 O problema central: a skill é uma tag, não uma identidade

Um código BNCC descreve **uma habilidade curricular**. O roadmap exige que
várias jogos exercitem a mesma habilidade — `EF01CO01` vai ter 2, 3, 5 jogos.

O modelo atual torna isso impossível de representar:

- `gameByCode` é um objeto: `EF01CO01` só pode apontar para um jogo.
- `src/games/EF01CO01/` é um caminho: dois jogos não cabem na mesma pasta.

Ou seja, **a estrutura de dados proíbe o requisito**. Não é um detalhe de
nomenclatura; é o modelo errado.

A cardinalidade correta é assimétrica, e vale registrar as duas metades:

```
1 habilidade  ->  N jogos       precisa passar a ser possível
1 jogo        ->  1 habilidade  regra fixa; é o que permite agrupar por pasta
```

### 3.2 `id` é o índice do array

`id: index` muda sozinho toda vez que `gameOrder` é reordenado. Ele é usado
como `key` do React em `GamesPage`:

```tsx
{currentGames.map((game) => <GameCard key={game.id} game={game} />)}
```

Reordenar a trilha faz o React reconciliar cartões errados. E se algum dia esse
`id` for gravado em qualquer lugar persistente, o progresso migra de jogo
sozinho.

### 3.3 Cadastrar um jogo exige editar quatro lugares

`gameByCode`, `gameOrder`, `SLUG_TO_CODE`, `GAME_CONFIG_LOADERS` — em dois
arquivos diferentes. Esquecer `SLUG_TO_CODE` produz tela branca sem erro no
console. Isso não escala para 200 jogos.

### 3.4 Três mapas que são o mesmo dado

`SLUG_TO_CODE` e `GAME_CODE_TO_SLUG` são inversos um do outro, moram em
arquivos diferentes, e o segundo cobre 4 dos 45 jogos. `normalizeGameId` no
`GameContext` depende dele:

```ts
function normalizeGameId(gameId: string): string {
  const gameBySlug = games.find((game) => game.slug === gameId);
  if (gameBySlug) return gameBySlug.slug;
  return GAME_CODE_TO_SLUG[gameId] ?? gameId;   // ← devolve o input cru p/ 41 jogos
}
```

### 3.5 Código morto

`placeholderGame` nunca executa: os 45 códigos de `gameOrder` existem todos em
`gameByCode`. O ramo `game ? ... : placeholderGame(...)` é sempre o primeiro.

### 3.6 Um slug inválido

`"arena-da-lógica"` tem acento. Em URL isso vira `%C3%B3`, quebra ao ser
copiado de alguns clientes e é inconsistente com os outros 44 slugs.

---

## 4. O que queremos

**Separar os papéis.** Cada responsabilidade ganha o seu próprio campo, e
nenhum campo depende do outro.

| Campo | Papel | Muda? | Exemplo |
| --- | --- | --- | --- |
| `id` | identidade eterna; chave de todo estado persistido | **nunca** | `"001"` |
| `slug` | identidade pública; o que vai na URL | pode (guarda o antigo em `aliases`) | `"pixel-secreto"` |
| `module` | nome da pasta em `src/games/` e `src/assets/games/` | pode | `"005-pixel-secreto"` |
| `skills[]` | habilidades BNCC — **tag** | pode | `["EF01CO05"]` |
| `years[]` | anos escolares alvo | pode | `[1]` |
| `tags[]` | tags livres para busca | pode | `["pixel", "cor"]` |
| `order` | posição na trilha | pode | `50` |
| `status` | publicado / rascunho / em breve | pode | `"published"` |

### 4.1 Regras do `id`

1. Formato `"001"` a `"999"`. **String**, três dígitos, zero à esquerda.
   String e não número porque `id` é chave de objeto em JSON, e a confusão
   entre `0`, `"0"` e `"000"` é uma classe inteira de bug evitável.
2. **Nunca muda. Nunca é reaproveitado.** Jogo descontinuado vira
   `status: "draft"`; o id fica queimado para sempre.
3. **Atribuído por ordem de criação**, não por ordem curricular. Um jogo novo
   de 1º ano entra como `046`, não empurra ninguém.
4. A ordem de exibição é `order`, **não** `id`.

### 4.2 Regras do `order`

Múltiplos de 10 (`10, 20, 30...`). Para encaixar um jogo entre o `001` e o
`002`, use `order: 15`. Nunca renumere ninguém.

### 4.3 Regras do `skill`

É **tag**, e a cardinalidade é assimétrica:

```
1 habilidade  ->  N jogos       EF01CO01 pode ter 3 jogos
1 jogo        ->  1 habilidade  regra fixa do projeto
```

Por isso o campo é **singular** (`skill: SkillCode`), não um array. O tipo
carrega a regra: se alguém tentar dar duas habilidades a um jogo, o
compilador reclama, e essa é a hora certa de reabrir a discussão.

> Se um dia a regra do 1:1 cair, `skill` vira `skills: SkillCode[]` **e** a
> estrutura de pastas precisa ser achatada — ver 4.4.

### 4.4 Regras do `module` — a pasta agrupa por habilidade

Como uma habilidade pode ter vários jogos, ela **deixa de nomear o jogo** e
passa a **agrupar** os jogos:

```
src/games/EF01CO01/base-dos-classificadores/
src/games/EF01CO01/fabrica-dos-classificadores/    ← mesma habilidade
src/assets/games/EF01CO01/base-dos-classificadores/
```

Convenção do `module`: `"<skill>/<slug>"`.

Isso só é possível porque cada jogo tem **exatamente uma** habilidade. Uma
pasta tem um pai só; um conjunto de tags não cabe numa árvore. É a regra 1:1
de 4.3 que sustenta este layout — as duas decisões estão amarradas, e mudar
uma obriga a mudar a outra.

O campo `module` existe em vez de calcular `${skill}/${slug}` para que mudar o
slug (identidade pública) não obrigue a mover pasta, e vice-versa.

### 4.5 URL: continua o slug

`/jogos/pixel-secreto`. **Não** `/jogos/005`. O id é interno; a URL é para
humanos.

O risco de "e se o slug mudar" é coberto por `aliases: string[]`: o slug antigo
continua resolvendo para o mesmo jogo. É assim que `arena-da-lógica` é
corrigido para `arena-da-logica` sem quebrar link salvo.

### 4.6 localStorage: migrar de slug para id

O estado hoje é indexado por slug em `blockedGames`, `gameLives`,
`gameStreaks`, `gameErrorCounts` e `history[].gameId`. Passa a ser indexado por
`id`.

Isso exige `STORAGE_KEY: "platform-state-v5"` → `"platform-state-v6"` **com
função de migração**. Sem a migração, todo usuário perde pontos, vidas e
bloqueios silenciosamente.

---

## 5. O tipo alvo

```ts
// src/types/game.ts
import type { SkillCode } from "../shared/types/game";

export type GameStatus = "published" | "draft" | "soon";

export type Game = {
  id: string;              // "005" — identidade eterna
  slug: string;            // "pixel-secreto" — identidade pública (URL)
  aliases?: string[];      // slugs antigos que ainda devem resolver
  skill: SkillCode;        // "EF01CO05" — TAG, não identidade; 1 por jogo
  module: string;          // "EF01CO05/pixel-secreto" — pasta física
  years: number[];         // [1] — atenção: EF15 = [1,2,3,4,5]
  tags: string[];          // ["pixel", "cor"] — livres, não validadas
  order: number;           // 50 — múltiplos de 10
  status: GameStatus;

  title: string;
  description: string;
  category: string;        // o eixo da BNCC; nome mantido p/ não mexer na UI
  points: number;
  icon: string;
  thumbnail?: string;
};
```

E em `src/shared/types/game.ts`, `GameCode` é renomeado para `SkillCode`
(mantendo `export type GameCode = SkillCode` como alias `@deprecated` durante a
transição).

**Armadilha:** `EF15` significa "1º ao 5º ano". Não dá para derivar o ano com
`parseInt(code.slice(2, 4))` — isso daria ano 15. Use tabela explícita.

---

## 6. Arquivos a criar

```
src/data/catalog.ts            fonte única: os 45 jogos, um array
src/data/gameIndex.ts          índices (byId/bySlug/bySkill), resolvers, loader
src/data/games.ts              shim: reexporta tudo (nenhum import quebra)
src/context/migrateState.ts    STORAGE_KEY v6 + migração v5 -> v6
scripts/restructure-games.mjs  aninha as 45 pastas + recalcula os imports
```

### 6.0 `restructure-games.mjs` — por que não é find & replace

Ao descer o jogo um nível, **todo import relativo que sai da pasta do jogo
ganha um `../`** — não só assets, mas `shared/`, `types/`, tudo:

```
antes:  src/games/EF01CO01/scenes/GameScene.ts
        import { EventBus } from "../../../shared/EventBus"

depois: src/games/EF01CO01/base-dos-classificadores/scenes/GameScene.ts
        import { EventBus } from "../../../../shared/EventBus"
```

O script resolve cada especificador relativo até o caminho absoluto de
destino, aplica o mapa de movimentação nesse destino, e recalcula o relativo
a partir da nova posição do arquivo. Correto por construção, independente da
profundidade. Também trata o `git mv` de uma pasta para dentro dela mesma
(passa por um temporário).

### 6.1 `gameIndex.ts` — o que ele substitui

- `SLUG_TO_CODE` + `GAME_CODE_TO_SLUG` + `normalizeGameId` →
  **`resolveGameId(input)`**, que aceita id, slug, alias ou código de
  habilidade e devolve sempre o id.
- `GAME_CONFIG_LOADERS` (45 linhas à mão) → **`import.meta.glob`**:

  ```ts
  const gameModules = import.meta.glob<{ default: Phaser.Types.Core.GameConfig }>(
    "../games/*/index.ts"
  );

  export function loadGameConfig(game: Game) {
    const loader = gameModules[`../games/${game.module}/index.ts`];
    if (!loader) throw new Error(`módulo "${game.module}" não existe`);
    return loader();
  }
  ```

  O Vite resolve o glob em build time e mantém cada jogo no seu próprio chunk —
  o carregamento continua preguiçoso.

- Deve conter **validação em `import.meta.env.DEV`** que lança erro em id
  duplicado, id fora do formato `\d{3}` e slug/alias duplicado. Catálogo com id
  repetido é o tipo de bug que só aparece três telas depois, como progresso
  trocado entre dois jogos.

---

## 7. Mudanças arquivo por arquivo

### `src/context/GameContext.tsx`

Apagar `GAME_CODE_TO_SLUG` e o corpo de `normalizeGameId`. Substituir por:

```ts
import { resolveGameId } from "../data/gameIndex";
import { STORAGE_KEY, readPersistedState } from "./migrateState";

function normalizeGameId(gameId: string): string {
  return resolveGameId(gameId) ?? gameId;
}
```

O resto do arquivo **não muda** — todas as funções já chamam `normalizeGameId`.
Esse ponto de estrangulamento já existia; só estava mal implementado.

Em `loadInitialState()`, trocar o `localStorage.getItem` direto por
`readPersistedState()`.

> Aproveitar para remover `points: 1000000000` do `INITIAL_STATE` e
> `points: 9999999999` de dentro do `loadInitialState` — são valores de teste
> que sobrescrevem o progresso real a cada reload.

### `src/pages/GameDetailsPage.tsx`

- Apagar `SLUG_TO_CODE` (45 linhas) e `GAME_CONFIG_LOADERS` (45 linhas).
- `const game = slug ? getGameBySlug(slug) : undefined;`
- O `useEffect` de carregamento passa a usar `loadGameConfig(game)`.
- **A mudança central:** `<GameFrame gameId={game.id} ...>` — era `game.slug`.
- Todas as chamadas de contexto: `getGameLives(game.id)`,
  `isGameBlocked(game.id)`, `getGameBlockedUntil(game.id)`,
  `unlockGameAccess(game.id)`, `buyExtraLife(game.id)`.
- `startsInsidePhaser` deixa de comparar `gameCode === "EF01CO02"`; vira um
  campo booleano no catálogo.
- Redirecionar alias para o slug canônico:

  ```ts
  useEffect(() => {
    if (game && slug && game.slug !== slug) {
      navigate(`/jogos/${game.slug}`, { replace: true });
    }
  }, [game, slug, navigate]);
  ```

### `src/components/GameCard.tsx`

`isGameBlocked`, `getGameBlockedUntil` e `unlockGameAccess` passam a receber
`game.id`. O `to={"/jogos/" + game.slug}` **continua com slug**.

### `src/pages/GamesPage.tsx`

Nenhuma linha muda, mas `key={game.id}` passa a ser estável de verdade.

### `src/pages/ResourcesPage.tsx` e `src/pages/RankingPage.tsx`

`games.find((item) => item.slug === gameId)` → `getGameById(gameId)`.
Chamadas de bloqueio/vidas passam de `game.slug` para `game.id`.

### `src/shared/types/game.ts`

`GameCode` → `SkillCode`. `RoundResult.gameCode` → `gameId: string`.
`GameMeta.code` → `id` + `skills[]`. Adicionar `yearsOfSkill()` com a tabela
explícita de prefixos (incluindo `EF15: [1,2,3,4,5]`).

---

## 8. Verificação obrigatória antes de rodar

Os jogos Phaser aparentemente tratam o `gameId` como **opaco**: recebem no
`START_GAME` e devolvem igual no evento; o `GameLauncher` só compara
`event.gameId !== gameId`. Se isso valer para os 45, trocar slug por id é a
mudança de uma linha.

Confirmar que nenhum jogo escreve o próprio identificador à mão:

```bash
grep -rn "gameId:" src/games/
grep -rn "EF0.CO0\|EF15CO0" src/games/ | grep -i "gameid\|slug"
```

Se algum jogo emitir `gameId: 'EF03CO02'` literal, `resolveGameId` já cobre —
ele aceita código de habilidade. Mas é preciso saber quais são.

---

## 9. Ordem de execução

Com a árvore do git limpa:

1. `node scripts/restructure-games.mjs --dry` e ler a saída inteira.
2. `node scripts/restructure-games.mjs` — aninha as 45 pastas nos dois lugares
   e recalcula os imports de todo o `src/`.
3. `npx tsc --noEmit` e `npm run dev` — validar que os 45 jogos ainda abrem
   **antes** de mexer no catálogo. Este passo isola o risco: se algo quebrar
   aqui, é movimentação de arquivo, não modelagem.
4. `src/shared/types/game.ts` e `src/types/game.ts` — os tipos; o compilador
   vira a lista de tarefas.
5. `src/data/catalog.ts`, `gameIndex.ts`, `games.ts`. O `catalog.ts` já vem
   com os caminhos aninhados (`module: "EF01CO01/base-dos-classificadores"` e
   os thumbnails em `../assets/games/<skill>/<slug>/`).
6. `src/context/migrateState.ts` e o `GameContext`.
7. `GameDetailsPage`, depois os consumidores menores.
8. Testar com o `localStorage` **populado** de uma sessão antiga, para
   exercitar a migração de verdade.

O passo 4 é o único irreversível fora do git. Se sair errado:
`git checkout . && git clean -fd`.

---

## 10. Critérios de aceite

- [ ] `npx tsc --noEmit` passa sem erro.
- [ ] Os 45 jogos abrem, carregam o Phaser e completam uma fase.
- [ ] Uma sessão antiga (`platform-state-v5` populado) mantém pontos, vidas,
      bloqueios e histórico após a migração.
- [ ] `/jogos/arena-da-lógica` redireciona para `/jogos/arena-da-logica`.
- [ ] Duas entradas no catálogo com `skill: "EF01CO01"` coexistem em
      `src/games/EF01CO01/`, aparecem as duas na listagem, e
      `getGamesBySkill("EF01CO01")` devolve as duas.
- [ ] Trocar o `order` de um jogo reordena a listagem sem afetar progresso.
- [ ] Adicionar um jogo novo exige **uma** entrada em `catalog.ts` e **uma**
      pasta em `src/games/` — nada mais.
- [ ] `grep -rn "gameOrder\|gameByCode\|SLUG_TO_CODE\|GAME_CODE_TO_SLUG\|GAME_CONFIG_LOADERS" src/`
      não retorna nada.

---

## 11. Como fica cadastrar um jogo novo

```ts
// src/data/catalog.ts
{
  id: "046",                                       // NEXT_FREE_ID
  slug: "fabrica-dos-classificadores",
  skill: "EF01CO01",                               // mesma habilidade do 001
  module: "EF01CO01/fabrica-dos-classificadores",  // = caminho da pasta
  years: [1],
  tags: ["classificação", "arrastar"],
  order: 15,                                       // entra entre o 10 e o 20
  status: "published",
  title: "Fábrica dos Classificadores",
  description: "...",
  category: "Pensamento Computacional",
  points: 60,
  icon: "🏭",
  thumbnail: fabricaThumbnail,
}
```

Mais `src/games/EF01CO01/fabrica-dos-classificadores/index.ts` e
`src/assets/games/EF01CO01/fabrica-dos-classificadores/`.

Antes: quatro lugares em dois arquivos, e um deles produzia tela branca
silenciosa se esquecido. Depois: um lugar.

---

## 12. Restrições

- **Não alterar** `src/shared/tutorial/createTutorial.ts` — mais de 20 jogos
  dependem dele.
- **Não remover** a `UIScene` de nenhum jogo; todos têm e devem manter.
- Preservar a API pública de `src/shared/level/showLevelComplete.ts`.
- Manter o campo `category` com esse nome (a UI o consome em quatro lugares);
  renomear para `axis` é opcional e fora do escopo desta refatoração.
- O contrato do bridge (`PlatformEvent` / `PlatformCommand`) não muda de forma;
  só o **valor** de `gameId` passa de slug para id.
