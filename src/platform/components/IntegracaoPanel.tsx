import { useMemo, useState } from "react";
import { catalog } from "../../data/catalog";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS DADOS DE CADASTRO DE UM JOGO, PRONTOS PARA COLAR NA PLATAFORMA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Cadastrar um desafio automático na Atesteme pede cinco informações que só
 * existem aqui: endereço, identificador do catálogo, total de fases, nome e
 * frase de apresentação — mais a capa. São 45 jogos; digitar isso à mão é
 * onde os erros nascem (slug trocado, id de outro jogo, nome divergente).
 *
 * Este painel resolve pelo lado certo: quem tem a informação é este site, e
 * ele entrega pronta.
 *
 * ── POR QUE O ENDEREÇO SAI SEM PARÂMETRO ─────────────────────────────────
 *
 * `attempt`, `returnBase`, `stage` e `lives` pertencem a UMA partida e são
 * montados pela plataforma na hora de abrir o iframe. Gravar qualquer um
 * deles no cadastro é gravar o bilhete de uma partida que já acabou — e foi
 * exatamente o que aconteceu na primeira tentativa de integração.
 */

const ORIGEM = typeof window !== "undefined" ? window.location.origin : "";

const FASES_PADRAO = 3;

type Campo = { rotulo: string; valor: string; dica?: string };

function camposDoJogo(slug: string): Campo[] {
  const jogo = catalog.find((g) => g.slug === slug);
  if (!jogo) return [];

  return [
    {
      rotulo: "Endereço do jogo",
      valor: `${ORIGEM}/jogos/${jogo.slug}`,
      dica: "Sem parâmetros: a plataforma os acrescenta a cada tentativa.",
    },
    {
      rotulo: "Identificador do jogo",
      valor: jogo.id,
      dica: "É permanente. Se o endereço mudar, o vínculo continua por ele.",
    },
    { rotulo: "Total de fases", valor: String(FASES_PADRAO) },
    { rotulo: "Nome do jogo", valor: jogo.title },
    { rotulo: "Frase de apresentação", valor: jogo.description },
    {
      rotulo: "Capa do jogo",
      valor: `${ORIGEM}/og/${jogo.slug}.jpg`,
      dica: "Mesma imagem usada na prévia de link.",
    },
  ];
}

export default function IntegracaoPanel({ onClose }: { onClose: () => void }) {
  const publicados = useMemo(
    () => catalog.filter((g) => g.status === "published").sort((a, b) => a.order - b.order),
    [],
  );

  const [slug, setSlug] = useState(publicados[0]?.slug ?? "");
  const [copiado, setCopiado] = useState<string | null>(null);

  const campos = useMemo(() => camposDoJogo(slug), [slug]);

  const copiar = async (rotulo: string, valor: string) => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(rotulo);
      window.setTimeout(() => setCopiado(null), 1500);
    } catch {
      /* clipboard bloqueado: o valor continua visível para seleção manual */
    }
  };

  return (
    <div className="integracao-overlay" role="dialog" aria-label="Dados de integração">
      <div className="integracao-painel">
        <div className="integracao-topo">
          <strong>Dados para cadastrar na Atesteme</strong>
          <button type="button" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <label className="integracao-campo">
          <span>Jogo</span>
          <select value={slug} onChange={(e) => setSlug(e.target.value)}>
            {publicados.map((g) => (
              <option key={g.id} value={g.slug}>
                {g.id} — {g.title}
              </option>
            ))}
          </select>
        </label>

        {campos.map((campo) => (
          <div key={campo.rotulo} className="integracao-linha">
            <div className="integracao-rotulo">{campo.rotulo}</div>
            <div className="integracao-valor">
              <input readOnly value={campo.valor} onFocus={(e) => e.currentTarget.select()} />
              <button type="button" onClick={() => copiar(campo.rotulo, campo.valor)}>
                {copiado === campo.rotulo ? "copiado" : "copiar"}
              </button>
            </div>
            {campo.dica ? <div className="integracao-dica">{campo.dica}</div> : null}
          </div>
        ))}

        <div className="integracao-rodape">
          <button
            type="button"
            className="integracao-principal"
            onClick={() =>
              copiar(
                "tudo",
                campos.map((c) => `${c.rotulo}: ${c.valor}`).join("\n"),
              )
            }
          >
            {copiado === "tudo" ? "Copiado!" : "Copiar todos os campos"}
          </button>

          {/*
            Abrir a mesma URL que a plataforma abriria, com uma tentativa de
            teste. Serve para conferir o jogo antes de cadastrar — e é a
            diferença entre "o cadastro está errado" e "o jogo não abre".
          */}
          <a
            className="integracao-secundario"
            href={`/jogos/${slug}?embed=1&attempt=teste-cadastro&stage=1&points=0&lives=3&returnBase=${encodeURIComponent(ORIGEM)}`}
            target="_blank"
            rel="noreferrer"
          >
            Testar como a plataforma abre
          </a>
        </div>
      </div>
    </div>
  );
}
