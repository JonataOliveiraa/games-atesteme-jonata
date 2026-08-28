import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type Phaser from "phaser";

import { getGameBySlug, loadGameConfig } from "../data/gameIndex";
import GameFrame from "../platform/components/GameFrame";
import {
  montarRotaDeRetorno,
  parseEmbedParams,
  validarEmbed,
} from "../platform/embed/embedParams";
import {
  clearEmbedSession,
  setEmbedSession,
} from "../shared/bridge/embedSession";
import { runtimeGameBridge } from "../shared/bridge/runtimeGameBridge";
import SeletorDeFase from "../platform/dev/SeletorDeFase";
import { useAtalhoDeFase } from "../platform/dev/useAtalhoDeFase";
import { installGameUiTunnel } from "../shared/bridge/uiTunnel";
import type { PlatformEvent } from "../shared/contracts/platformEvents";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O JOGO DENTRO DA PLATAFORMA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Esta é a rota `/jogos/:slug`, e ela é O CANVAS E MAIS NADA: sem cabeçalho,
 * menu, ranking, pontuação global, título, capa ou botão. Ela existe para ser
 * o `src` de um iframe — o da página `/iframe/:slug` deste site, e o da
 * Atesteme em produção.
 *
 * A capa com "Iniciar" e "Instruções" morava aqui e saiu: título e botão são
 * texto de plataforma, e é justamente plataforma que esta rota não pode ter.
 * Quem convida a criança a começar é quem embute — e quando o iframe é
 * montado, esse convite já foi aceito.
 *
 * ── QUEM DECIDE APROVADO OU REPROVADO É ESTA CAMADA ──────────────────────
 *
 * Os 45 jogos continuam só emitindo eventos, sem conhecer a plataforma nem a
 * URL dela. Esta página escuta, decide e navega. É a diferença entre um
 * contrato e um acoplamento: trocar a regra de aprovação amanhã é mexer aqui,
 * não em 45 jogos.
 */

const ESPERA_ANTES_DE_NAVEGAR_MS = 150;

/** Quantas fases um jogo tem quando o catálogo não diz outra coisa. */
const FASES_PADRAO = 3;

export default function EmbedGamePage() {
  const { slug } = useParams<{ slug: string }>();
  const [query, setQuery] = useSearchParams();

  const params = parseEmbedParams(query);
  const validacao = validarEmbed(params);

  const game = slug ? getGameBySlug(slug) : undefined;

  const [gameConfig, setGameConfig] =
    useState<Phaser.Types.Core.GameConfig | null>(null);

  /*
   * A PARTIDA JÁ COMEÇOU QUANDO ESTA PÁGINA ABRE.
   *
   * Esta rota é só o canvas: não existe capa, não existe botão "Iniciar".
   * Quem convida a criança a começar é quem embute — a página `/iframe/:slug`
   * deste site, ou a tela da competência na Atesteme. Quando o iframe é
   * montado, o clique já aconteceu.
   */
  const comecou = true;

  /*
   * UMA NAVEGAÇÃO POR PARTIDA.
   *
   * Um jogo pode emitir GAME_OVER e, logo depois, um CHECKPOINT atrasado de
   * um tween que ainda estava rodando. Sem esta trava, o segundo evento
   * navegaria por cima do primeiro e a plataforma receberia dois resultados
   * para a mesma tentativa.
   */
  const jaFinalizou = useRef(false);
  const errosCometidos = useRef(0);

  /** Mostrado quando as vidas acabam, no meio segundo antes de sair da tela. */
  const [semVidas, setSemVidas] = useState(false);

  /* ── o atalho de teste para pular de fase (tecla L) ────────────────── */

  const [seletorAberto, setSeletorAberto] = useState(false);

  /*
   * QUEM PODE PULAR DE FASE.
   *
   * `returnBase` e a assinatura da partida de verdade: e para onde o
   * resultado volta, e so quem embute de fora manda. Sem ele, esta pagina
   * ou foi aberta direto (`/jogos/<slug>`) ou pelo iframe da propria
   * plataforma de jogos — os dois casos somos nos testando.
   *
   * Amarrar a permissao a ISSO, e nao a `import.meta.env.DEV`, e o que faz
   * o atalho existir no link publicado, que e onde os testes acontecem de
   * verdade. E amarrar ao `returnBase` — e nao a ausencia de `embed` — e o
   * que garante que nenhum aluno da Atesteme alcance isto: a partida dele
   * SEMPRE tem para onde voltar, senao `validarEmbed` nem deixa abrir.
   */
  const podePularDeFase = !params.returnBase;

  const abrirSeletor = useCallback(() => setSeletorAberto(true), []);
  useAtalhoDeFase(podePularDeFase && !seletorAberto, abrirSeletor);

  /*
   * A ESCOLHA VIRA A URL, E NAO UM ESTADO ESCONDIDO.
   *
   * `?stage=N` ja e o caminho por onde a fase inicial chega ao jogo (ver
   * `shared/level/faseInicial.ts`): escrever nele reaproveita a tubulacao
   * inteira, em vez de inventar uma segunda. E tem tres brindes — a barra
   * de endereco explica por que o jogo esta na fase 3, um F5 nao perde o
   * lugar, e o link e colavel para quem for reproduzir o mesmo teste.
   */
  const irParaFase = useCallback(
    (fase: 1 | 2 | 3) => {
      setSeletorAberto(false);

      const proxima = new URLSearchParams(query);
      proxima.set("stage", String(fase));
      setQuery(proxima, { replace: true });
    },
    [query, setQuery]
  );

  const pronto = !!game && validacao.ok;

  /* ── o contexto da tentativa, antes de qualquer jogo montar ────────── */

  /*
   * O TÚNEL DE INTERFACE.
   *
   * Sobe junto com a página embutida, nos dois modos. Sem ele o `exit-game`
   * que o jogo emite morre dentro do iframe: `EventBus` é memória, e memória
   * não atravessa janela. Ver `uiTunnel.ts`.
   */
  useEffect(() => installGameUiTunnel(), []);

  /*
   * ── A GEOMETRIA DA TELA CHEIA É DESTA PÁGINA ───────────────────────────
   *
   * `body.embed-active` é o que faz o documento parar de rolar e o que liga
   * as regras que dão altura ao `.phaser-container` e ao canvas.
   *
   * Quem ligava isso era o `Layout`, quando via `?embed=1`. Só que esta rota
   * saiu de dentro do `Layout` — precisava sair, senão herdava o cabeçalho —
   * e levou junto, sem querer, a classe que dava altura ao jogo: o canvas
   * ficava medindo contra um `body` de altura automática.
   *
   * Agora quem liga é a própria página. É o dono certo: a tela que É o embed
   * não deveria depender de um envoltório que ela nem usa mais.
   */
  useEffect(() => {
    document.body.classList.add("embed-active");
    return () => document.body.classList.remove("embed-active");
  }, []);

  /*
   * ── UMA TENTATIVA TAMBÉM NO MODO `inline` ──────────────────────────────
   *
   * `meta`, `totalStages` e `isFinalStage` só são preenchidos quando existe
   * uma sessão, e a sessão nascia do `attempt` da query. No `inline` não há
   * `attempt` — ninguém está creditando nada — e o efeito colateral era que os
   * eventos daqui saíam MAIS POBRES do que os que a Atesteme vai receber.
   *
   * Isso derrubava o motivo de ter movido o jogo para o iframe: o caminho que
   * percorremos todo dia deixava de exercitar o contrato inteiro, e um campo
   * quebrado em `isFinalStage` só apareceria na integração de verdade.
   *
   * Então o modo `inline` inventa a própria tentativa. O valor é descartável e
   * nunca sai desta aba: serve só para a sessão existir e o evento sair
   * completo. O prefixo diz de onde ele veio, para ninguém confundir com uma
   * tentativa da plataforma se ele aparecer num log.
   */
  useEffect(() => {
    if (!game) return;

    /*
     * Sorteado AQUI, dentro do efeito, e não num `useMemo`: sortear é impuro,
     * e um `useMemo` impuro devolve valores diferentes entre as duas
     * renderizações que o React faz em desenvolvimento. Efeito é o lugar de
     * quem tem colateral — e ele já roda uma vez por jogo, que é a vida útil
     * certa para uma tentativa.
     */
    const attempt =
      params.attempt ??
      (params.inline
        ? `inline-${
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : Math.random().toString(16).slice(2)
          }`
        : null);

    if (!attempt) return;

    setEmbedSession({
      attempt,
      gameId: game.id,
      totalStages: FASES_PADRAO,
    });

    return () => clearEmbedSession();
  }, [game, params.attempt, params.inline]);

  useEffect(() => {
    if (!pronto || !game) return;

    let cancelado = false;

    loadGameConfig(game)
      .then((mod) => {
        if (!cancelado) setGameConfig(mod.default);
      })
      .catch((erro) => {
        console.error("[embed] falha ao carregar o jogo:", erro);
      });

    return () => {
      cancelado = true;
    };
  }, [pronto, game]);

  /* ── o fim da partida ──────────────────────────────────────────────── */

  const finalizar = useCallback(
    (resultado: "approve" | "reprove") => {
      if (jaFinalizou.current) return;

      /*
       * No modo `inline` não há para onde navegar, e navegar seria o erro:
       * quem hospeda é a plataforma de jogos, que quer o jogo NA TELA para
       * mostrar o modal de parabéns e creditar os pontos. O resultado já saiu
       * por `postMessage` antes desta função ser chamada.
       */
      if (params.inline) return;

      if (!params.returnBase || !params.attempt) return;

      jaFinalizou.current = true;

      const destino = montarRotaDeRetorno(
        params.returnBase,
        resultado,
        params.attempt
      );

      /*
       * O EVENTO SAI ANTES, A NAVEGAÇÃO É A GARANTIA.
       *
       * A plataforma tem duas formas de saber o resultado: o `postMessage`,
       * que é imediato, e esta navegação, que é a rede de segurança para
       * quando o listener dela falhou ou nem existia. O intervalo curto
       * existe para o `postMessage` já ter saído da fila quando a página
       * começar a trocar — navegar no mesmo instante do evento cortaria a
       * mensagem no meio.
       *
       * `window.location.assign`, nunca `window.top`: quem manda na tela de
       * fora continua sendo a plataforma. Este site só troca o conteúdo do
       * próprio iframe.
       */
      window.setTimeout(() => {
        window.location.assign(destino);
      }, ESPERA_ANTES_DE_NAVEGAR_MS);
    },
    [params.attempt, params.returnBase, params.inline]
  );

  const aoReceberEvento = useCallback(
    (evento: PlatformEvent) => {
      if (jaFinalizou.current) return;

      /*
       * A CONTAGEM DE VIDAS É DE QUEM HOSPEDA.
       *
       * No modo `inline` a plataforma de jogos tem a economia dela — vidas por
       * jogo, compra de vida extra, bloqueio por tempo — e recebe os mesmos
       * eventos por `postMessage`. Contar aqui também faria dois juízes para a
       * mesma partida, cada um com a sua régua.
       */
      if (params.inline) return;

      if (evento.type === "GAME_COMPLETED" && evento.isFinalStage) {
        finalizar("approve");
        return;
      }

      if (evento.type === "GAME_OVER") {
        finalizar("reprove");
        return;
      }

      /*
       * A DERROTA DOS JOGOS QUE NÃO TÊM DERROTA.
       *
       * Só 14 dos 45 jogos emitem GAME_OVER — o resto simplesmente não tem
       * uma condição de perder, e inventar uma seria mexer na jogabilidade de
       * 31 jogos. Então a tolerância a erro vem de FORA: são as `lives` que a
       * plataforma mandou na query, contadas aqui pelos WRONG_ANSWER.
       *
       * Assim a regra de reprovação é a mesma para os 45, e a plataforma
       * controla o rigor sem que nenhum jogo precise saber que ela existe.
       */
      if (evento.type === "WRONG_ANSWER") {
        errosCometidos.current += 1;
        if (errosCometidos.current < params.lives) return;

        /*
         * ── A DERROTA QUE O JOGO NÃO TEM ─────────────────────────────────
         *
         * 30 dos 45 jogos não emitem `GAME_OVER` porque simplesmente não têm
         * como perder: a criança erra, o jogo mostra o erro e a vida segue.
         * Inventar uma condição de derrota dentro de cada um seria mexer na
         * jogabilidade de 30 jogos — e a maioria deles é de reconhecimento,
         * onde insistir até acertar É o exercício.
         *
         * Então a derrota mora aqui, e é a MESMA para os 45: acabaram as
         * vidas que a plataforma mandou, acabou a tentativa.
         *
         * O `GAME_OVER` é emitido POR ESTA CAMADA, e não pelo jogo. Sai pela
         * ponte de sempre, então chega na plataforma com `meta` completo e no
         * meio do fluxo normal de eventos — quem integra não precisa saber
         * que o jogo não sabia perder. Quem JÁ emite o próprio `GAME_OVER`
         * nunca chega aqui: aquele evento resolve a partida antes.
         *
         * A dureza é da plataforma, não deste código: `lives=1` na query faz
         * "errou, perdeu"; `lives=5` dá cinco chances. Nenhum jogo precisa ser
         * editado para mudar isso.
         */
        runtimeGameBridge.emit({
          type: "GAME_OVER",
          gameId: evento.gameId,
          stage: evento.stage,
        });

        setSemVidas(true);
        finalizar("reprove");
      }
    },
    [finalizar, params.lives, params.inline]
  );

  /* ── as telas ──────────────────────────────────────────────────────── */

  if (!game) {
    return (
      <EmbedAviso
        titulo="Jogo não encontrado"
        detalhe="O endereço não corresponde a nenhum jogo publicado."
      />
    );
  }

  if (!validacao.ok) {
    return <EmbedAviso titulo="Não foi possível abrir a atividade" detalhe={validacao.motivo} />;
  }

  if (!gameConfig) {
    return (
      <div className="embed-stage">
        <div className="game-screen">
          <p style={{ color: "var(--muted)" }}>Carregando jogo...</p>
        </div>
      </div>
    );
  }

  if (comecou) {
    return (
      <div className="embed-stage">
        {semVidas && (
          /*
           * Sem isto, a tela simplesmente TROCA: a criança erra o último e o
           * jogo desaparece. Meio segundo dizendo o que aconteceu é a
           * diferença entre perder e o jogo ter travado.
           */
          <div className="embed-derrota" role="alert">
            <div className="embed-derrota-caixa">
              <span aria-hidden="true">💔</span>
              <strong>Suas vidas acabaram</strong>
              <span>Voltando para a atividade...</span>
            </div>
          </div>
        )}

        {seletorAberto && (
          <SeletorDeFase
            faseAtual={params.stage}
            onEscolher={irParaFase}
            onFechar={() => setSeletorAberto(false)}
          />
        )}

        <GameFrame
          gameId={game.id}
          level={params.stage}
          points={params.points}
          lives={params.lives}
          config={gameConfig}
          onPlatformEvent={aoReceberEvento}
        />
      </div>
    );
  }

  /*
   * Não há mais nada para renderizar: o `if (comecou)` acima é o único
   * caminho, porque `comecou` nasce `true`.
   *
   * Havia aqui uma capa com o título do jogo, um "Iniciar" e um "Instruções".
   * Ela saiu porque esta rota é O CANVAS, e mais nada — título e botão são
   * texto de plataforma, e plataforma é o que esta página não pode ter.
   *
   * A capa não sumiu do produto: ela é da página hospedeira
   * (`/iframe/:slug`), que já a tinha e que só monta este iframe DEPOIS do
   * clique em "Iniciar". Quem embute de fora — a Atesteme — recebe o jogo
   * começando, e a tela de apresentação é a competência, do lado dela.
   */
  return null;
}

/**
 * O ERRO DE CONTEXTO É UMA TELA, NÃO UM `console.error`.
 *
 * Quem vai ver isto é um adulto configurando a integração, dentro de um
 * iframe onde o console não está à mão. A mensagem diz o que faltou.
 */
function EmbedAviso({ titulo, detalhe }: { titulo: string; detalhe: string }) {
  return (
    <div className="embed-stage embed-aviso">
      <div className="embed-aviso-caixa">
        <h1>{titulo}</h1>
        <p>{detalhe}</p>
        <p className="embed-aviso-dica">
          Verifique os parâmetros <code>attempt</code> e <code>returnBase</code>{" "}
          da URL do iframe.
        </p>
      </div>
    </div>
  );
}
