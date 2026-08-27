import { useSearchParams } from "react-router-dom";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O RETORNO SIMULADO — `/approve` e `/reprove` deste site
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Estas duas rotas NÃO são da plataforma. As de verdade moram na Atesteme, e é
 * para lá que o iframe vai em produção: `montarRotaDeRetorno` monta a URL a
 * partir do `returnBase` que veio na query, e o `returnBase` em produção é o
 * origin da Atesteme.
 *
 * ── ENTÃO POR QUE ELAS EXISTEM AQUI? ─────────────────────────────────────
 *
 * Porque nos testes locais o `returnBase` é o PRÓPRIO site de jogos: tanto o
 * `embed-harness.html` quanto o `embed-sandbox.html` passam
 * `returnBase = window.location.origin`, que é a única origem que eles têm e a
 * única que está na allowlist local.
 *
 * Sem estas rotas, terminar uma partida no sandbox levava o iframe para
 * `/approve` — um caminho que o `App.tsx` não conhecia. O React Router não
 * casava nada, renderizava `null`, e o resultado era uma TELA BRANCA tanto ao
 * vencer quanto ao perder. O jogo estava certo, o contrato estava certo, e o
 * fim da partida parecia um crash.
 *
 * O `embed-harness.html` tentava resolver isso sozinho, com um bloco que
 * trocava o `document.body` quando `location.pathname` fosse `/approve`. Esse
 * bloco nunca rodava: em `/approve` o servidor entrega o `index.html` do app,
 * não o `embed-harness.html`, então o script dele nem era carregado.
 *
 * ── A PÁGINA DIZ O QUE ELA É ─────────────────────────────────────────────
 *
 * Ela se anuncia como simulação, em letras grandes. Se alguém apontar o
 * `returnBase` de produção para o site de jogos por engano, o que aparece é
 * "retorno simulado", e não um "APROVADO" convincente que esconderia a
 * configuração errada.
 */

export default function EmbedReturnPage({
  resultado,
}: {
  resultado: "approve" | "reprove";
}) {
  const [query] = useSearchParams();

  /* `id` é o `attempt`, repassado sem transformação — o contrato da seção 4.1. */
  const attempt = query.get("id");

  const aprovado = resultado === "approve";

  return (
    <div className="embed-stage embed-aviso embed-retorno">
      <div className="embed-aviso-caixa">
        <span className="embed-retorno-marca">retorno simulado</span>

        <div
          className={`embed-retorno-selo ${
            aprovado ? "is-aprovado" : "is-reprovado"
          }`}
          role="status"
        >
          <span aria-hidden="true">{aprovado ? "✅" : "❌"}</span>
          <strong>{aprovado ? "APROVADO" : "REPROVADO"}</strong>
        </div>

        <dl className="embed-retorno-dados">
          <dt>rota</dt>
          <dd>
            <code>/{resultado}</code>
          </dd>
          <dt>id (attempt)</dt>
          <dd>
            <code>{attempt ?? "— não veio na query —"}</code>
          </dd>
        </dl>

        <p className="embed-aviso-dica">
          Em produção esta navegação sai deste site: o iframe vai para{" "}
          <code>&lt;returnBase&gt;/{resultado}</code>, na origem da Atesteme.
          Esta página existe porque os testes locais usam o próprio site de
          jogos como <code>returnBase</code>.
        </p>
      </div>
    </div>
  );
}
