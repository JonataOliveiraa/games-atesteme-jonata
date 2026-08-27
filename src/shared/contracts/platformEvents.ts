/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O QUE O JOGO CONTA PARA QUEM ESTÁ DE FORA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Estes eventos saem dos jogos e chegam em dois lugares: na própria página de
 * jogo (pelo `localBridge`) e, quando o site está dentro de um iframe, na
 * plataforma que o embute (pelo `iframeBridge`).
 *
 * ── QUEM PREENCHE O QUÊ ──────────────────────────────────────────────────
 *
 * O JOGO preenche só o que ele sabe: o tipo, a fase, os pontos daquela
 * jogada. Ele NÃO sabe em que tentativa está, nem qual é o `id` dele no
 * catálogo, nem quantas fases o catálogo diz que ele tem — e não deve saber,
 * senão cada um dos 45 jogos vira um lugar onde essa informação pode estar
 * errada.
 *
 * Quem preenche `meta`, `totalStages` e `isFinalStage` é a camada de saída
 * (`shared/bridge/outgoingEvent.ts`), num lugar só, a partir do contexto da
 * sessão de embed. É por isso que esses campos são opcionais aqui: eles são
 * opcionais para QUEM EMITE e garantidos para QUEM RECEBE.
 */

/**
 * O envelope de identificação que acompanha todo evento que sai para a
 * plataforma.
 *
 * `attempt` volta como ECO EXATO do que chegou na query. O site de jogos não
 * interpreta esse valor, não deriva nada dele e não o guarda: ele existe para
 * a plataforma reconhecer de qual tentativa este resultado é.
 */
export type EventMeta = {
  /** Eco exato do parâmetro recebido na URL. */
  attempt: string;
  /** O `id` do catálogo (ex.: "037"), NUNCA o slug — slug pode mudar. */
  gameId: string;
  sentAt: number;
  protocolVersion: 1;
};

export type PlatformEventBody =
  | {
      type: "GAME_READY";
      gameId: string;
    }
  | {
      type: "CHECKPOINT";
      gameId: string;
      progress: number;
      score: number;
      stage: number;
      hits?: number;
      errors?: number;
    }
  | {
      type: "CORRECT_ANSWER";
      gameId: string;
      pointsEarned: number;
      stage: number;
    }
  | {
      type: "WRONG_ANSWER";
      gameId: string;
      pointsEarned: number;
      stage: number;
    }
  | {
      type: "GAME_OVER";
      gameId: string;
      stage: number;
    }
  | {
      /**
       * ATENÇÃO: este evento é emitido A CADA FASE concluída, e sempre foi.
       *
       * Sem `isFinalStage`, quem está de fora não consegue distinguir
       * "terminou a fase 1" de "terminou o jogo" — e aprovaria o aluno na
       * primeira fase. É esse campo que autoriza a aprovação, não o evento.
       */
      type: "GAME_COMPLETED";
      gameId: string;
      stage: number;
      /** Quantas fases o jogo tem. Preenchido pela camada de saída. */
      totalStages?: number;
      /** `true` só na última fase. Preenchido pela camada de saída. */
      isFinalStage?: boolean;
      score?: number;
      errors?: number;
      durationMs?: number;
    };

export type PlatformEvent = PlatformEventBody & { meta?: EventMeta };
