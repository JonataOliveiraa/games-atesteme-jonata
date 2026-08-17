/**
 * Shim de compatibilidade.
 *
 * Todo mundo que hoje faz `import { games } from "../data/games"` continua
 * funcionando sem alteração. A lógica de verdade mora em catalog.ts
 * (os dados) e gameIndex.ts (os índices e resolvers).
 *
 * O que sumiu deste arquivo e por quê:
 *
 * - `gameByCode`  → virou `catalog`, uma lista. O mapa por código dizia
 *                   "um jogo = uma habilidade", o que não é verdade.
 * - `gameOrder`   → virou o campo `order` de cada entrada. Uma lista
 *                   paralela de 45 strings que precisava ficar em sincronia
 *                   com outra lista de 45 strings é uma fonte de bug, não
 *                   uma fonte de ordem.
 * - `placeholderGame` → era código morto: os 45 códigos de gameOrder já
 *                   existiam em gameByCode, então o ramo nunca rodava.
 *                   O caso "jogo ainda não pronto" agora é status: "soon".
 * - `id: index`   → o id era o índice do array, ou seja, mudava sozinho
 *                   sempre que a ordem mudasse. Agora é fixo no catálogo.
 */
export { games } from "./gameIndex";

export {
  getGameById,
  getGameBySlug,
  getGamesBySkill,
  getGamesByYear,
  getGamesByTag,
  resolveGameId,
  loadGameConfig,
} from "./gameIndex";

export { catalog, NEXT_FREE_ID } from "./catalog";
