# Migracao para catalogo com ids estaveis

## Resumo

O sistema foi migrado para o modelo do `refactor-ids`. A identidade interna dos jogos deixou de depender de slug, codigo BNCC ou indice numerico e passou a usar um `id` estavel de tres digitos, por exemplo `001`, `043` e `045`.

A URL publica continua usando slug:

```txt
/jogos/academia-dos-algoritmos
```

O caminho fisico do jogo agora vem do campo `module` no catalogo:

```txt
src/games/EF15CO02/academia-dos-algoritmos/index.ts
```

## O que foi mudado

- `src/data/catalog.ts` passou a ser a fonte canonica dos jogos.
- `src/data/gameIndex.ts` concentra buscas por `id`, `slug`, `alias`, habilidade BNCC e carregamento dinamico do modulo Phaser.
- `src/data/games.ts` virou uma camada de compatibilidade que reexporta o novo indice.
- `src/types/game.ts` e `src/shared/types/game.ts` foram alinhados ao formato novo.
- `src/context/migrateState.ts` foi adicionado para migrar estado salvo do navegador.
- `src/context/GameContext.tsx` agora normaliza qualquer slug/codigo legado para o `id` estavel antes de gravar progresso, vidas, bloqueios e historico.
- `src/pages/GameDetailsPage.tsx` deixou de manter mapas manuais `SLUG_TO_CODE` e `GAME_CONFIG_LOADERS`.
- `src/components/GameCard.tsx`, `src/pages/ResourcesPage.tsx`, `src/pages/RankingPage.tsx` e ranking local passaram a usar `game.id` para estado interno.
- `src/platform/components/GameLauncher.tsx` e `src/platform/components/IframeGameFrame.tsx` agora aceitam eventos emitidos com slug/codigo legado e repassam ao site ja normalizados para o `id` novo.
- `src/shared/utils/progressStore.ts` deixou de depender de `GameCode` e aceita qualquer `gameId` string.

## Por que foi feito

Antes da migracao, o projeto misturava tres conceitos diferentes:

- `slug`, que serve para URL e classe visual.
- `codigo BNCC`, como `EF15CO02`, que representa habilidade curricular.
- identidade interna do jogo, usada para progresso, ranking, bloqueio, vidas e historico.

Essa mistura cria bugs quando mais de um jogo pertence a mesma habilidade, quando um slug muda, ou quando uma pasta fisica muda. O novo catalogo separa esses papeis:

| Campo | Papel |
|---|---|
| `id` | Identidade interna estavel. Nunca deve mudar depois de publicado. |
| `slug` | Identidade publica da rota `/jogos/:slug`. Pode ter aliases. |
| `module` | Caminho fisico em `src/games/<skill>/<slug>/index.ts`. |
| `skill` | Habilidade BNCC do jogo. |
| `order` | Ordem de exibicao na trilha/catalogo. |
| `aliases` | Slugs antigos aceitos para compatibilidade e redirecionamento. |

## Estado salvo

A chave de estado local mudou para `platform-state-v6`.

Quando o usuario abre o site, `readPersistedState()` tenta ler o estado atual e tambem estados antigos conhecidos. Qualquer `gameId` antigo em historico, vidas, bloqueios ou progresso de fase e convertido por `resolveGameId()` para o novo `id`.

Isso preserva progresso antigo sem manter os mapas antigos espalhados pelas telas.

## Como adicionar um jogo agora

1. Criar a pasta fisica no formato:

```txt
src/games/<CODIGO_BNCC>/<slug-do-jogo>/index.ts
```

2. Adicionar uma entrada em `src/data/catalog.ts`:

```ts
{
  id: "046",
  slug: "novo-jogo",
  module: "EF15CO02/novo-jogo",
  skill: "EF15CO02",
  title: "Novo Jogo",
  subtitle: "Descricao curta",
  description: "Descricao completa",
  category: "Pensamento Computacional",
  icon: "Puzzle",
  color: "from-sky-500 to-cyan-500",
  years: [1, 2, 3, 4, 5],
  tags: ["algoritmos"],
  difficulty: "intermediario",
  estimatedTime: "10 min",
  order: 46,
  status: "published",
}
```

3. Se um slug antigo precisar continuar abrindo, colocar esse valor em `aliases`.
4. Nao criar novos mapas manuais em paginas. Usar `getGameById`, `getGameBySlug`, `getGamesBySkill` ou `loadGameConfig`.
5. Para estado, ranking, loja, vidas e bloqueios, usar sempre `game.id`.
6. Para rota publica e CSS de pagina, usar `game.slug`.

## Consideracoes importantes

- Nao usar `id` na URL publica; a rota continua sendo `/jogos/:slug`.
- Se mudar um slug, manter o antigo em `aliases`.
- `module` precisa apontar para uma pasta real com `index.ts` exportando a config Phaser.
- Jogos Phaser ainda podem emitir `GAME_ID` legado; o launcher normaliza esses eventos para o novo `id` antes de atualizar o estado do site.
- O ideal em jogos novos e tratar `gameId` como valor opaco recebido no comando `START_GAME` e devolver o mesmo valor nos eventos.
- `GameStandalone` ainda importa `base-dos-classificadores` estaticamente; por isso o build avisa que esse jogo tambem aparece em import dinamico.

## Validacao feita

Foi executado:

```bash
npm run build
```

Resultado: build concluido com sucesso. O Vite emitiu apenas avisos de chunk grande e de import dinamico inefetivo para `base-dos-classificadores`, causado pela rota standalone legada.
