import { useEffect, useRef } from "react";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O SELETOR DE FASE — o painel que a tecla L abre
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Ferramenta de teste, e ele DIZ que é: quem abrir sem querer entende em uma
 * linha o que está vendo e como sair. Um painel sem explicação, aberto por
 * uma tecla, é indistinguível de um bug.
 *
 * ── POR QUE ESTILO EM LINHA, E NÃO UMA CLASSE NO global.css ──────────────
 *
 * Porque ele mora por cima do jogo, e as regras do modo embed são
 * `body.embed-active … !important` — uma classe nova entraria numa disputa de
 * especificidade que ela não tem por que travar. Estilo em linha ganha sem
 * briga, e mantém a ferramenta inteira em um arquivo só: para tirá-la do
 * produto um dia, apaga-se o arquivo e as duas linhas que o chamam.
 */

interface SeletorDeFaseProps {
  faseAtual: 1 | 2 | 3;
  totalDeFases?: number;
  onEscolher: (fase: 1 | 2 | 3) => void;
  onFechar: () => void;
}

const FUNDO: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 2147483000,
  display: "grid",
  placeItems: "center",
  background: "rgba(6, 10, 26, 0.72)",
  backdropFilter: "blur(2px)",
  fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
};

const CAIXA: React.CSSProperties = {
  minWidth: 300,
  maxWidth: "90vw",
  padding: "22px 24px 18px",
  borderRadius: 16,
  background: "#141c3a",
  border: "2px solid #2dd4bf",
  boxShadow: "0 18px 50px rgba(0, 0, 0, 0.55)",
  color: "#ffffff",
  textAlign: "center",
};

const BOTAO_BASE: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 14,
  fontSize: 26,
  fontWeight: 700,
  cursor: "pointer",
  color: "#ffffff",
  background: "#25316b",
  border: "2px solid #3b4a94",
};

const BOTAO_ATUAL: React.CSSProperties = {
  ...BOTAO_BASE,
  background: "#2dd4bf",
  borderColor: "#5eead4",
  color: "#06251f",
};

export default function SeletorDeFase({
  faseAtual,
  totalDeFases = 3,
  onEscolher,
  onFechar,
}: SeletorDeFaseProps) {
  const primeiroRef = useRef<HTMLButtonElement>(null);

  /*
   * O foco entra no painel assim que ele abre — senão as setas e o Enter
   * continuam indo para o jogo que está atrás, e o teclado parece quebrado.
   */
  useEffect(() => {
    primeiroRef.current?.focus();
  }, []);

  /*
   * Esc fecha, e a captura acontece aqui e não no `useAtalhoDeFase`: enquanto
   * o painel está aberto, ele é quem manda no teclado.
   */
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        onFechar();
        return;
      }

      const n = Number(evento.key);
      if (Number.isInteger(n) && n >= 1 && n <= totalDeFases) {
        evento.preventDefault();
        onEscolher(n as 1 | 2 | 3);
      }
    };

    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onEscolher, onFechar, totalDeFases]);

  const fases = Array.from({ length: totalDeFases }, (_, i) => (i + 1) as 1 | 2 | 3);

  return (
    <div
      style={FUNDO}
      role="dialog"
      aria-modal="true"
      aria-label="Pular para uma fase"
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div style={CAIXA}>
        <p style={{ margin: "0 0 2px", fontSize: 12, letterSpacing: 1, color: "#7dd3fc" }}>
          ATALHO DE TESTE
        </p>
        <h2 style={{ margin: "0 0 14px", fontSize: 20 }}>Ir para qual fase?</h2>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {fases.map((fase, i) => (
            <button
              key={fase}
              ref={i === 0 ? primeiroRef : undefined}
              type="button"
              style={fase === faseAtual ? BOTAO_ATUAL : BOTAO_BASE}
              onClick={() => onEscolher(fase)}
              aria-current={fase === faseAtual ? "true" : undefined}
            >
              {fase}
            </button>
          ))}
        </div>

        <p style={{ margin: "16px 0 0", fontSize: 13, color: "#a5b4fc", lineHeight: 1.5 }}>
          A partida recomeça na fase escolhida.
          <br />
          <strong>Esc</strong> fecha · <strong>L</strong> abre de novo
        </p>
      </div>
    </div>
  );
}
