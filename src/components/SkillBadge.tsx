import type { SkillCode } from "../shared/types/game";
import { yearLabelOf } from "../data/skills";

type Props = {
  skill: SkillCode;
  /** Acrescenta o ano por extenso ao lado do código. */
  withYear?: boolean;
};

/**
 * O selo do código curricular.
 *
 * O código vem partido em duas metades — "EF03" e "CO08" — porque a primeira
 * é a que diz o ANO, e é por ela que o filtro da estante agrupa. Ler
 * "EF03CO08" de uma vez esconde justamente a parte que interessa na varredura.
 */
export default function SkillBadge({ skill, withYear = false }: Props) {
  return (
    <span className="skill-badge" title={`${skill} · ${yearLabelOf(skill)}`}>
      <span className="skill-badge-year">{skill.slice(0, 4)}</span>
      <span className="skill-badge-rest">{skill.slice(4)}</span>
      {withYear && <span className="skill-badge-label">{yearLabelOf(skill)}</span>}
    </span>
  );
}
