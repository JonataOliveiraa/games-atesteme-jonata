import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useFullscreen } from "../../hooks/useFullscreen";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O PALCO DO JOGO NA PÁGINA, COM O BOTÃO DE TELA CHEIA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O botão é da página que hospeda, nunca da atividade (`/jogos/<slug>`): lá
 * dentro quem manda na janela é quem embute o iframe.
 *
 * ── POR QUE O BOTÃO NUNCA FICA EM CIMA DO JOGO ──────────────────────────
 *
 * O canto superior direito do jogo já tem dono: é onde quase todos os jogos
 * desenham o "?" da ajuda (x≈1212–1236, y≈32–46 em 1280x720). Um botão por
 * cima tiraria o toque do "?". Então:
 *
 *  - fora da tela cheia, ele fica numa linha logo ACIMA do jogo, à direita;
 *  - em tela cheia, ele mora na faixa preta que sobra — na lateral (celular
 *    deitado, monitor largo) ou no alto (16:10, tablet 4:3);
 *  - quando a faixa não comporta o botão, o jogo abre uma — no alto
 *    (`--faixa-topo`) ou nas laterais (`--faixa-lado`), a que menos o
 *    encolher. No 16:10 de notebook ele nem encolhe: só desce os poucos
 *    pixels que sobravam embaixo. No 16:9 exato perde ~5%, que custa menos
 *    que um botão em cima do "?".
 *
 * ── CELULAR DEITADO ──────────────────────────────────────────────────────
 *
 * Com o celular na horizontal o jogo já ocupa a tela sozinho, sem precisar do
 * botão: a página com cabeçalho e placar empurrava o jogo para baixo da
 * dobra. Virar o celular em pé devolve a página. O botão, aí, serve para
 * esconder também a barra do navegador (tela cheia de verdade).
 */

interface GameStageProps {
  children: ReactNode;
}

/** Todos os jogos são 16:9 (1280x720, e a `oficina` em 960x540). */
const PROPORCAO = 16 / 9;

const BOTAO = 40;
const MARGEM = 8;
/** A faixa mais estreita que ainda comporta o botão (4px de cada lado). */
const FAIXA = BOTAO + 8;

/** Celular, não tablet: deitado, a altura de um celular fica abaixo disso. */
const CELULAR_DEITADO =
  "(pointer: coarse) and (orientation: landscape) and (max-height: 540px)";

interface Arranjo {
  /** Faixas que o jogo abre quando a sobra natural não comporta o botão. */
  faixaLado: number;
  faixaTopo: number;
  botao: { top: number; right: number };
}

/**
 * A conta do `Scale.FIT` feita para o lado de fora: quanto sobra de faixa
 * preta, e onde ela comporta o botão.
 */
function arrumar(largura: number, altura: number): Arranjo {
  const larguraDoJogo = Math.min(largura, altura * PROPORCAO);
  const lado = (largura - larguraDoJogo) / 2;
  const topo = (altura - larguraDoJogo / PROPORCAO) / 2;

  if (lado >= FAIXA) {
    return {
      faixaLado: 0,
      faixaTopo: 0,
      botao: { top: MARGEM, right: (lado - BOTAO) / 2 },
    };
  }
  if (topo >= FAIXA) {
    return {
      faixaLado: 0,
      faixaTopo: 0,
      botao: { top: (topo - BOTAO) / 2, right: MARGEM },
    };
  }

  // nenhuma faixa serve: abre a que menos encolhe o jogo
  const comLado = Math.min(largura - 2 * FAIXA, altura * PROPORCAO);
  const comTopo = Math.min(largura, (altura - FAIXA) * PROPORCAO);

  if (comLado >= comTopo) {
    const ladoAberto = (largura - comLado) / 2;
    return {
      faixaLado: FAIXA,
      faixaTopo: 0,
      botao: { top: MARGEM, right: (ladoAberto - BOTAO) / 2 },
    };
  }

  // a margem empurra o jogo para baixo e o flex divide o resto (ver o CSS)
  const topoAberto = (altura - comTopo / PROPORCAO - FAIXA) / 2 + FAIXA;
  return {
    faixaLado: 0,
    faixaTopo: FAIXA,
    botao: { top: (topoAberto - BOTAO) / 2, right: MARGEM },
  };
}

function useCelularDeitado() {
  const [deitado, setDeitado] = useState(
    () => window.matchMedia?.(CELULAR_DEITADO).matches ?? false
  );

  useEffect(() => {
    const consulta = window.matchMedia?.(CELULAR_DEITADO);
    if (!consulta) return;
    const aoMudar = () => setDeitado(consulta.matches);
    consulta.addEventListener("change", aoMudar);
    return () => consulta.removeEventListener("change", aoMudar);
  }, []);

  return deitado;
}

export default function GameStage({ children }: GameStageProps) {
  const palcoRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle } = useFullscreen();
  const deitado = useCelularDeitado();
  const cheia = isFullscreen || deitado;
  const [arranjo, setArranjo] = useState<Arranjo>(() =>
    arrumar(window.innerWidth, window.innerHeight)
  );

  useEffect(() => {
    const palco = palcoRef.current;
    if (!palco || !cheia) return;

    const medir = () => {
      const { width, height } = palco.getBoundingClientRect();
      if (width && height) setArranjo(arrumar(width, height));
    };

    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(palco);
    return () => observador.disconnect();
  }, [cheia]);

  useEffect(() => {
    document.body.classList.toggle("game-fullscreen-active", cheia);
    return () => document.body.classList.remove("game-fullscreen-active");
  }, [cheia]);

  /*
   * O foco volta para o jogo. Clicar no botão deixa o foco NELE, e nos jogos
   * de teclado o próximo espaço ou Enter da criança apertaria o botão de novo
   * — saindo da tela cheia no meio da partida — em vez de chegar ao jogo.
   */
  const aoTocar = (botao: HTMLButtonElement) => {
    botao.blur();
    toggle();
    palcoRef.current?.querySelector("iframe")?.contentWindow?.focus();
  };

  const rotulo = isFullscreen ? "Sair da tela cheia" : "Tela cheia";

  return (
    <div
      ref={palcoRef}
      className={`game-stage${cheia ? " is-cheia" : ""}`}
      style={
        cheia
          ? ({
              "--faixa-lado": `${arranjo.faixaLado}px`,
              "--faixa-topo": `${arranjo.faixaTopo}px`,
            } as CSSProperties)
          : undefined
      }
    >
      <button
        type="button"
        className="game-stage-botao"
        onClick={(e) => aoTocar(e.currentTarget)}
        aria-label={rotulo}
        title={rotulo}
        style={cheia ? arranjo.botao : undefined}
      >
        <IconeTelaCheia sair={isFullscreen} />
      </button>

      <div className="game-stage-quadro">{children}</div>

      {/* Só aparece em tela cheia com o celular em pé (ver o CSS). */}
      <div className="game-stage-gire" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="56" height="56">
          <rect x="15" y="6" width="18" height="36" rx="4" />
          <line x1="21" y1="36" x2="27" y2="36" />
        </svg>
        <span>Vire o celular</span>
      </div>
    </div>
  );
}

/** Os quatro cantos para fora (entrar) ou para dentro (sair). */
function IconeTelaCheia({ sair }: { sair: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      {sair ? (
        <path d="M9 4v5H4M15 4v5h5M20 15h-5v5M4 15h5v5" />
      ) : (
        <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
      )}
    </svg>
  );
}
