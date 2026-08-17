import type { SkillCode } from "../shared/types/game";

/**
 * Estado de publicação. Substitui o antigo placeholderGame(),
 * que hoje é código morto (os 45 jogos existem em gameByCode).
 */
export type GameStatus = "published" | "draft" | "soon";

export type Game = {
  /**
   * IDENTIDADE ETERNA. Nunca muda, nunca é reaproveitada.
   * É por este campo que o progresso, o ranking e o histórico são indexados.
   * Formato: string de 3 dígitos com zero à esquerda ("001").
   * String, e não number, para não sofrer com math acidental, com
   * `0 == "000"` e para servir de chave de objeto em JSON sem surpresa.
   */
  id: string;

  /**
   * IDENTIDADE PÚBLICA. É o que aparece na URL (/jogos/:slug).
   * Pode mudar — se mudar, mova o valor antigo para `aliases`.
   */
  slug: string;

  /**
   * Slugs antigos que ainda devem resolver para este jogo.
   * Permite corrigir um slug (ex: "arena-da-lógica" -> "arena-da-logica")
   * sem quebrar link que alguém salvou.
   */
  aliases?: string[];

  /**
   * HABILIDADE BNCC. É uma TAG, não a identidade do jogo.
   *
   * Singular por regra do projeto: um jogo trabalha exatamente uma
   * habilidade. A relação é 1 habilidade -> N jogos, nunca o contrário.
   * Se um dia essa regra cair, este campo vira SkillCode[] e a estrutura
   * de pastas precisa ser achatada (ver comentário em `module`).
   */
  skill: SkillCode;

  /**
   * LOCALIZAÇÃO FÍSICA, relativa a src/games/ e src/assets/games/.
   * Convenção: "<skill>/<slug>" — ex: "EF01CO01/base-dos-classificadores".
   *
   * É um campo próprio, e não `${skill}/${slug}` calculado, porque assim
   * mudar o slug (identidade pública) não obriga a mover pasta, e mover
   * pasta não obriga a mudar o slug. Um depende do outro só por convenção,
   * não por código.
   */
  module: string;

  /**
   * Anos escolares alvo, derivados da skill.
   * Atenção: EF15 significa "1º ao 5º ano", então NÃO dá para fazer
   * parseInt(code.slice(2, 4)) — isso daria ano 15.
   */
  years: number[];

  /** Tags livres para busca e filtro. Não são validadas. */
  tags: string[];

  /**
   * Posição na trilha, independente do id.
   * Em múltiplos de 10 para permitir inserir um jogo entre dois
   * existentes sem renumerar nada.
   */
  order: number;

  status: GameStatus;

  title: string;
  description: string;
  /** Eixo da BNCC. Mantido com o nome "category" para não mexer na UI. */
  category: string;
  points: number;
  icon: string;
  thumbnail?: string;
};
