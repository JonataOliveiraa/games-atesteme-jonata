# Migração: código da habilidade vira tag, id vira identidade

## O problema real

`EF01CO01` acumula cinco papéis hoje:

| Papel | Onde |
| --- | --- |
| Chave do registro de dados | `gameByCode` |
| Ordem da listagem | `gameOrder` → `id: index` |
| Caminho físico | `src/games/EF01CO01/`, `src/assets/games/EF01CO01/` |
| Chave do carregador Phaser | `GAME_CONFIG_LOADERS` |
| Metadado pedagógico | a habilidade BNCC em si |

E o `slug` acumula outros dois: identidade pública (rota) e chave de estado (localStorage, histórico, ranking, bloqueios).

Enquanto um valor faz cinco coisas, mudar qualquer uma delas quebra as outras quatro. O refactor não é "trocar EF01CO01 por 001" — é **dar um campo para cada papel**.

## Os campos

| Campo | Papel | Muda? |
| --- | --- | --- |
| `id` | identidade eterna, chave de progresso | **nunca** |
| `slug` | identidade pública, URL | pode (guarda o antigo em `aliases`) |
| `module` | pasta em `src/games/` | pode, livremente |
| `skills[]` | habilidades BNCC — **tag** | pode |
| `order` | posição na trilha | pode |

## As pastas TÊM que ser renomeadas

Se o código da skill é tag, então vários jogos têm a mesma tag. E aí:

```
src/games/EF01CO01/   ← jogo A
src/games/EF01CO01/   ← jogo B    ✗ impossível
```

Nome de pasta precisa ser único **por jogo**. A skill não é única por jogo. Logo a renomeação não é opcional — é a consequência direta de a skill virar tag.

Formato adotado: `<id>-<slug>`.

```
src/games/001-base-dos-classificadores/
src/games/046-fabrica-dos-classificadores/     ← também skills: ["EF01CO01"]
src/assets/games/001-base-dos-classificadores/
```

Começa pelo `id`, que nunca muda, então a listagem do explorador sai em ordem e o nome nunca colide. Termina pelo slug, então dá para ler sem consultar tabela.

O campo `module` guarda esse nome. Ele é separado do `id` porque, se um dia você reorganizar as pastas de novo (por eixo, por ano, o que for), muda uma string no catálogo e mais nada.

Use `scripts/rename-game-folders.mjs` — ele faz o `git mv` das 45 pastas nos dois lugares e reescreve as referências em `src/**`.

## Sobre o formato do id

`"001"` até `"999"`, string, zero à esquerda. Três regras:

1. **Nunca muda e nunca é reaproveitado.** Jogo removido vira `status: "draft"`; o id fica queimado.
2. **Atribuído por ordem de criação**, não por ordem curricular. Jogo novo de 1º ano entra como `046`, não empurra ninguém.
3. **A ordem de exibição é o `order`**, em múltiplos de 10. Para encaixar entre `001` e `002`, use `order: 15`.

String e não número porque `id` é chave de objeto em JSON, e `0` vs `"000"` vs `"0"` é uma classe de bug que não vale a pena conhecer.

O teto de 200 não é necessário — `999` de folga custa o mesmo.

## Sobre a URL: mantenha o slug

`/jogos/pixel-secreto` continua. `/jogos/005` é pior em tudo que importa: ilegível, não compartilhável, não indexável. O id é interno.

O medo legítimo por trás de "mas e se o slug mudar?" está resolvido pelo campo `aliases`: o slug antigo continua resolvendo para o mesmo jogo. Isso já está em uso no catálogo para corrigir `arena-da-lógica` (com acento, inválido em URL) → `arena-da-logica`.

## Arquivos novos

```
src/types/game.ts          Game com id, slug, module, skills, years, tags, order
src/shared/types/game.ts   GameCode renomeado para SkillCode (+ alias deprecated)
src/data/catalog.ts        os 45 jogos, fonte única de verdade
src/data/gameIndex.ts      índices, resolvers e loadGameConfig
src/data/games.ts          shim: reexporta tudo, ninguém precisa mudar o import
src/context/migrateState.ts  migração v5 (slug) → v6 (id)
```

## O que sumiu, e por quê

- **`gameOrder`** — uma lista paralela de 45 strings que precisava ficar sincronizada com outra lista de 45 strings. Virou o campo `order`.
- **`gameByCode`** — o mapa por código codificava "um jogo = uma habilidade". Virou lista; a habilidade virou `skills[]`.
- **`placeholderGame`** — código morto. Os 45 códigos de `gameOrder` existem todos em `gameByCode`, então o ramo nunca executou. Substituído por `status: "soon"`.
- **`id: index`** — o id era a posição no array, ou seja, mudava sozinho a cada reordenação. E era usado como `key` do React em `GamesPage`.
- **`SLUG_TO_CODE`** e **`GAME_CODE_TO_SLUG`** — dois mapas manuais, em arquivos diferentes, invertidos um do outro. O segundo cobria **4 dos 45 jogos**. Ambos viraram `resolveGameId()`.
- **`GAME_CONFIG_LOADERS`** — 45 linhas escritas à mão. Virou `import.meta.glob`, que o Vite resolve em build time mantendo o code-splitting. Cadastrar jogo novo agora é uma entrada no catálogo e mais nada.

---

# Trocas por arquivo

## 1. `src/context/GameContext.tsx`

Apague o bloco:

```ts
const STORAGE_KEY = "platform-state-v5";
// ...
const GAME_CODE_TO_SLUG: Record<string, string> = { /* 4 entradas */ };

function normalizeGameId(gameId: string): string {
  const gameBySlug = games.find((game) => game.slug === gameId);
  if (gameBySlug) return gameBySlug.slug;
  return GAME_CODE_TO_SLUG[gameId] ?? gameId;
}
```

No lugar:

```ts
import { resolveGameId } from "../data/gameIndex";
import { STORAGE_KEY, readPersistedState } from "./migrateState";

function normalizeGameId(gameId: string): string {
  return resolveGameId(gameId) ?? gameId;
}
```

O resto do arquivo **não muda** — todo ele já chama `normalizeGameId`. Esse era o ponto de estrangulamento, e ele já existia.

Em `loadInitialState()`, troque as duas primeiras linhas:

```ts
function loadInitialState(): PlatformState {
  const parsed = readPersistedState();          // ← v6, ou migra o v5
  if (!parsed) return INITIAL_STATE;

  return normalizeState({
    points: parsed.points ?? INITIAL_STATE.points,
    // ... resto igual
  });
}
```

> Aproveite para tirar o `points: 9999999999` fixo dentro do `loadInitialState` e o `points: 1000000000` do `INITIAL_STATE` — são valores de teste que estão sobrescrevendo o progresso real a cada reload.

## 2. `src/pages/GameDetailsPage.tsx`

Apague `SLUG_TO_CODE` (45 linhas) e `GAME_CONFIG_LOADERS` (45 linhas).

```ts
import { getGameBySlug, loadGameConfig } from "../data/gameIndex";

const game = slug ? getGameBySlug(slug) : undefined;
```

O `useEffect` de carregamento:

```ts
useEffect(() => {
  let cancelled = false;
  if (!game) return;

  loadGameConfig(game)
    .then((mod) => { if (!cancelled) setGameConfig(mod.default); })
    .catch((error) => console.error("Erro ao carregar configuração do jogo:", error));

  return () => { cancelled = true; };
}, [game]);
```

E o ponto central da migração — o que é passado ao Phaser:

```ts
<GameFrame
  gameId={game.id}        // ← era game.slug
  ...
/>
```

Todas as chamadas de contexto passam a usar o id:

```ts
const gameLives   = getGameLives(game.id);
const blocked     = isGameBlocked(game.id);
const blockedUntil = getGameBlockedUntil(game.id);
// e handleUnlock/handleBuyLife: unlockGameAccess(game.id), buyExtraLife(game.id)
```

`startsInsidePhaser` vira `game.module === "EF01CO02"` (ou, melhor, um campo `startsInsidePhaser: boolean` no catálogo).

Se o slug da URL for um alias, redirecione para o canônico:

```ts
useEffect(() => {
  if (game && slug && game.slug !== slug) {
    navigate(`/jogos/${game.slug}`, { replace: true });
  }
}, [game, slug, navigate]);
```

## 3. `src/components/GameCard.tsx`

```ts
const blocked = isGameBlocked(game.id);          // era game.slug
const blockedUntil = getGameBlockedUntil(game.id);
const success = unlockGameAccess(game.id);
```

O `to={/jogos/${game.slug}}` **continua com slug** — a rota é pública.

## 4. `src/pages/GamesPage.tsx`

```tsx
{currentGames.map((game) => <GameCard key={game.id} game={game} />)}
```

Não muda uma letra, mas agora o `key` é estável de verdade: antes era o índice do array, que mudava a cada reordenação e fazia o React remontar cartões errados.

## 5. `src/pages/ResourcesPage.tsx` e `RankingPage.tsx`

```ts
import { getGameById } from "../data/gameIndex";

const getGameTitle = (gameId: string) => getGameById(gameId)?.title ?? gameId;
```

E as chamadas de bloqueio/vidas passam de `game.slug` para `game.id`.
Em `RankingPage`, o `key={game.slug}` da grade pode virar `key={game.id}`.

## 6. Verificação obrigatória antes de rodar

Os jogos Phaser tratam o `gameId` como **opaco**: recebem no `START_GAME` e devolvem igual no evento; o `GameLauncher` só compara `event.gameId !== gameId`. Se isso valer para os 45, trocar slug por id é a mudança de uma linha.

Confirme que nenhum jogo tem o próprio id escrito à mão:

```bash
grep -rn "gameId:" src/games/ | grep -v "gameId: data" | grep -v "gameId: this"
grep -rn "EF0.CO0" src/games/*/scenes/ src/games/*/*.ts | grep -i "gameid\|slug"
```

Se algum jogo emitir `gameId: 'EF03CO02'` literal, o `resolveGameId` já cobre — ele aceita código de habilidade e devolve o id. Mas vale saber quais são.

## Ordem de aplicação

1. `shared/types/game.ts` e `types/game.ts` (os tipos primeiro — o TS vira sua lista de tarefas)
2. `data/catalog.ts`, `data/gameIndex.ts`, `data/games.ts`
3. `context/migrateState.ts` e o `GameContext`
4. `GameDetailsPage`, depois os consumidores menores
5. Rodar com o localStorage **populado** de uma sessão antiga, para exercitar a migração de verdade

## Cadastrar um jogo novo, depois disso

Uma entrada em `catalog.ts` e uma pasta em `src/games/`. Nada mais:

```ts
{
  id: "046",                      // NEXT_FREE_ID
  slug: "meu-jogo-novo",
  module: "EF02CO07",             // o nome da pasta em src/games/
  skills: ["EF02CO07"],
  years: [2],
  tags: ["lógica"],
  order: 135,                     // entra entre o 130 e o 140
  status: "published",
  title: "Meu Jogo Novo",
  description: "...",
  category: "Pensamento Computacional",
  points: 60,
  icon: "🎯",
  thumbnail: meuThumbnail,
}
```

Antes eram quatro lugares: `gameByCode`, `gameOrder`, `SLUG_TO_CODE`, `GAME_CONFIG_LOADERS` — e esquecer o terceiro dava uma tela branca sem erro.

## Duas coisas que valem migrar junto (opcional)

Ambas são listas dispersas em `GameDetailsPage` que na verdade são propriedades do jogo:

- `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` → campo `hasOwnCompletionScreen: boolean`
- `instructionsBySlug` → campo `instructions: string[]`

Mesma razão de sempre: informação sobre o jogo mora no catálogo, não na página que o exibe.
