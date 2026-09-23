import { useEffect, useMemo, useRef, useState } from "react";
import { catalog } from "../../data/catalog";
import { SKILLS, YEAR_CODES, yearCodeOf, yearLabelOf } from "../../data/skills";
import type { Game } from "../../types/game";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS DADOS DE CADASTRO DE UM JOGO, PRONTOS PARA COLAR NA PLATAFORMA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Cadastrar um desafio automático na Atesteme pede cinco informações que só
 * existem aqui: endereço, identificador do catálogo, total de fases, nome e
 * frase de apresentação — mais a capa. São dezenas de jogos; digitar isso à
 * mão é onde os erros nascem (slug trocado, id de outro jogo, nome
 * divergente).
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
 *
 * ── POR QUE A ESCOLHA DO JOGO NÃO É MAIS UM `<select>` ───────────────────
 *
 * Eram 71 linhas numa lista só, ordenadas por `order` — que é a posição na
 * TRILHA. Como a segunda rodada foi intercalada na trilha, a coluna de ids
 * saía 001, 046, 047, 002, 048… e uma lista assim parece desordenada mesmo
 * estando ordenada.
 *
 * Aqui a ordem é por HABILIDADE, que é como quem cadastra pensa, e a lista
 * ganhou busca: o mesmo campo encontra por nome, por id, por slug e por
 * código curricular, ignorando acento e maiúscula.
 *
 * ── POR QUE O EIXO VEM DE `SKILLS` E NÃO DE `category` ───────────────────
 *
 * Eixo é da habilidade, não do jogo: os dois jogos de EF05CO05 são do mesmo
 * eixo por definição. `category` é uma cópia disso gravada jogo a jogo, e
 * cópia diverge — seis já divergiam. Lendo da tabela, não tem como.
 */

const ORIGEM = typeof window !== "undefined" ? window.location.origin : "";

const FASES_PADRAO = 3;

type Campo = { rotulo: string; valor: string; dica?: string };

function camposDoJogo(jogo: Game | undefined): Campo[] {
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

/**
 * Tira acento e caixa para a busca.
 *
 * Sem isto, "codigo" não acha "Ilha dos Códigos" e "MARATONA" não acha nada —
 * e quem está cadastrando digita rápido, sem acento, do jeito que sai.
 */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function IntegracaoPanel({ onClose }: { onClose: () => void }) {
  /*
    Só os publicados: jogo em "draft" é jogo removido (a regra do
    catálogo), e não pode virar cadastro na Atesteme. Em 23/09/2026 os 17
    rascunhos que sobravam foram todos publicados — estavam prontos — e a
    lista voltou a ser o catálogo inteiro.

    A ordem é por habilidade e, dentro dela, pela trilha — assim os dois ou
    três jogos da mesma habilidade aparecem colados, que é justamente a
    escolha que quem cadastra precisa fazer.
  */
  const jogos = useMemo(
    () =>
      catalog
        .filter((g) => g.status === "published")
        .sort((a, b) => a.skill.localeCompare(b.skill) || a.order - b.order),
    []
  );

  const [busca, setBusca] = useState("");
  const [ano, setAno] = useState("");
  const [escolhido, setEscolhido] = useState(jogos[0]?.slug ?? "");
  const [copiado, setCopiado] = useState<string | null>(null);

  const listaRef = useRef<HTMLUListElement>(null);

  const resultados = useMemo(() => {
    const alvo = normalizar(busca.trim());

    return jogos.filter((g) => {
      if (ano && yearCodeOf(g.skill) !== ano) return false;
      if (!alvo) return true;

      /* Um campo de busca só, varrendo tudo o que identifica o jogo: quem
         tem o código na mão procura pelo código, quem tem o nome procura
         pelo nome, e nenhum dos dois precisa saber em qual caixa digitar. */
      const agulha = `${g.id} ${g.skill} ${g.title} ${g.slug} ${yearLabelOf(
        g.skill
      )} ${SKILLS[g.skill].eixo}`;

      return normalizar(agulha).includes(alvo);
    });
  }, [jogos, busca, ano]);

  /*
    A escolha que VALE, calculada no render.

    Filtrar pode deixar o jogo escolhido fora da lista, e então quem vale é o
    primeiro resultado — senão os campos embaixo mostrariam um jogo que não
    está visível em lugar nenhum da tela. Derivar aqui em vez de corrigir
    `escolhido` num efeito evita a renderização em cascata: a tela nunca
    chega a ser pintada com a escolha inválida.
  */
  const slug = resultados.some((g) => g.slug === escolhido)
    ? escolhido
    : resultados[0]?.slug ?? "";

  const jogo = useMemo(
    () => jogos.find((g) => g.slug === slug),
    [jogos, slug]
  );

  const campos = useMemo(() => camposDoJogo(jogo), [jogo]);

  /* A linha escolhida pode estar fora da parte visível da lista depois de uma
     busca ou de uma seta — rolar até ela é o que mantém teclado e olho no
     mesmo lugar. */
  useEffect(() => {
    listaRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [slug]);

  /** Setas andam na lista sem tirar o foco do campo de busca. */
  const navegar = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();

    const atual = resultados.findIndex((g) => g.slug === slug);
    const passo = event.key === "ArrowDown" ? 1 : -1;
    const proximo = resultados[atual + passo];

    if (proximo) setEscolhido(proximo.slug);
  };

  /* Um relógio só: com uma cópia por linha, duas cópias seguidas em linhas
     diferentes são comuns, e o relógio da primeira apagaria o "copiado" da
     segunda antes da hora. */
  const relogioCopiado = useRef<number | undefined>(undefined);

  const copiar = async (rotulo: string, valor: string) => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(rotulo);
      window.clearTimeout(relogioCopiado.current);
      relogioCopiado.current = window.setTimeout(() => setCopiado(null), 1500);
    } catch {
      /* clipboard bloqueado: o valor continua visível para seleção manual */
    }
  };

  return (
    <div
      className="integracao-overlay"
      role="dialog"
      aria-label="Dados de integração"
    >
      <div className="integracao-painel">
        <div className="integracao-topo">
          <strong>Dados para cadastrar na Atesteme</strong>
          <button type="button" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        {/* Só daqui para baixo é que rola: o ✕ fica sempre alcançável. */}
        <div className="integracao-corpo">
          <div className="integracao-busca">
            <div className="integracao-busca-linha">
              <label className="integracao-campo integracao-campo-larga">
                <span>Jogo</span>
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onKeyDown={navegar}
                  placeholder="Buscar por nome, id, eixo ou código (EF03CO04)"
                  autoFocus
                />
              </label>

              <label className="integracao-campo">
                <span>Ano</span>
                <select value={ano} onChange={(e) => setAno(e.target.value)}>
                  <option value="">Todos</option>
                  {YEAR_CODES.map((y) => (
                    <option key={y.code} value={y.code}>
                      {y.code} · {y.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="integracao-contagem">
              <span>
                {resultados.length === jogos.length
                  ? `${jogos.length} jogos`
                  : `${resultados.length} de ${jogos.length} jogos`}
              </span>
              <span>Clique duas vezes para copiar código e nome</span>
            </div>

            {resultados.length === 0 ? (
              <p className="integracao-vazio">
                Nenhum jogo
                {busca.trim() && " com esse termo"}
                {ano && ` em ${ano}`}.
              </p>
            ) : (
              <ul className="integracao-lista" role="listbox" ref={listaRef}>
                {resultados.map((g) => {
                  const chave = `linha-${g.id}`;

                  return (
                    <li key={g.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={g.slug === slug}
                        className={
                          g.slug === slug
                            ? "integracao-opcao ativa"
                            : "integracao-opcao"
                        }
                        title="Clique duas vezes para copiar código e nome"
                        onClick={() => setEscolhido(g.slug)}
                        onDoubleClick={() =>
                          copiar(chave, `${g.skill} ${g.title}`)
                        }
                      >
                        <span className="integracao-opcao-skill">
                          {g.skill}
                        </span>
                        <span className="integracao-opcao-nome">
                          <span className="integracao-opcao-titulo">
                            {g.title}
                          </span>
                          <span className="integracao-opcao-eixo">
                            {SKILLS[g.skill].eixo}
                          </span>
                        </span>
                        <span className="integracao-opcao-id">
                          {copiado === chave ? "copiado" : g.id}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {campos.map((campo) => (
            <div key={campo.rotulo} className="integracao-linha">
              <div className="integracao-rotulo">{campo.rotulo}</div>
              <div className="integracao-valor">
                <input
                  readOnly
                  value={campo.valor}
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button
                  type="button"
                  onClick={() => copiar(campo.rotulo, campo.valor)}
                >
                  {copiado === campo.rotulo ? "copiado" : "copiar"}
                </button>
              </div>
              {campo.dica ? (
                <div className="integracao-dica">{campo.dica}</div>
              ) : null}
            </div>
          ))}

          <div className="integracao-rodape">
            <button
              type="button"
              className="integracao-principal"
              disabled={campos.length === 0}
              onClick={() =>
                copiar(
                  "tudo",
                  campos.map((c) => `${c.rotulo}: ${c.valor}`).join("\n")
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
            {slug && (
              <a
                className="integracao-secundario"
                href={`/jogos/${slug}?embed=1&attempt=teste-cadastro&stage=1&points=0&lives=3&returnBase=${encodeURIComponent(
                  ORIGEM
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                Testar como a plataforma abre
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
