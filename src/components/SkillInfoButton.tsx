import { useEffect, useId, useRef, useState } from "react";
import type { SkillCode } from "../shared/types/game";
import { skillInfo, yearLabelOf } from "../data/skills";

type Props = {
  skill: SkillCode;
};

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O BOTÃO "i" DA HABILIDADE
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Fica ao lado do título do jogo e responde à pergunta que o código sozinho
 * não responde: "EF03CO08, e daí?". O balão traz o ano, o eixo, o objeto de
 * conhecimento, o texto oficial da habilidade e uma frase de resumo.
 *
 * ── POR QUE NÃO É SÓ UM `title=""` ───────────────────────────────────────
 *
 * O `title` nativo demora ~1s para abrir, some sozinho, não quebra linha, não
 * aceita negrito e é invisível no celular. Aqui o texto tem parágrafos e
 * precisa abrir na hora.
 *
 * ── AS QUATRO MANEIRAS DE ABRIR, E POR QUE SÃO QUATRO ────────────────────
 *
 *   mouse em cima    é o que foi pedido, e é o gesto de quem está no desktop
 *   clique/toque     no celular não existe "passar o mouse". Sem isto, o
 *                    botão simplesmente não funcionaria no aparelho em que
 *                    a maior parte das crianças joga
 *   foco (Tab)       quem navega por teclado chega no botão mas nunca
 *                    "passa o mouse" nele
 *   Esc              o jeito de fechar sem ter que encontrar o botão de novo
 *
 * O clique TRAVA o balão aberto (`pinned`): sair com o mouse não fecha o que
 * foi aberto no toque. Só outro toque, o Esc ou o blur fecham.
 */
export default function SkillInfoButton({ skill }: Props) {
  const info = skillInfo(skill);

  /* Três estados e não um: o mouse saindo não pode apagar o balão que o
     Tab abriu, nem o blur apagar o que o mouse está segurando. */
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  const open = hovered || focused || pinned;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setPinned(false);
      setFocused(false);
      setHovered(false);
    };

    /* Um toque em qualquer outro lugar fecha — no celular não há "sair com o
       mouse", então sem isto o balão ficaria preso na tela. */
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setPinned(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  /* Habilidade sem ficha na tabela: o botão some em vez de abrir um balão
     vazio. Acontece se `SkillCode` ganhar um código novo antes de skills.ts. */
  if (!info) return null;

  return (
    <span
      className="skill-info"
      ref={wrapperRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className={open ? "skill-info-button open" : "skill-info-button"}
        aria-label={`O que é ${skill}`}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setPinned((was) => !was)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setPinned(false);
        }}
      >
        i
      </button>

      {open && (
        <span className="skill-info-balloon" role="tooltip" id={tooltipId}>
          <span className="skill-info-head">
            <strong>{skill}</strong>
            <span className="skill-info-year">{yearLabelOf(skill)}</span>
          </span>

          <span className="skill-info-eixo">{info.eixo}</span>

          {info.objeto && (
            <span className="skill-info-objeto">{info.objeto}</span>
          )}

          <span className="skill-info-habilidade">{info.habilidade}</span>

          <span className="skill-info-resumo">{info.resumo}</span>
        </span>
      )}
    </span>
  );
}
