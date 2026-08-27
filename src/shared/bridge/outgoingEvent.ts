import type { PlatformEvent } from "../contracts/platformEvents";
import { getEmbedSession } from "./embedSession";

/**
 * O ÚNICO LUGAR QUE COMPLETA UM EVENTO ANTES DE ELE SAIR.
 *
 * Os 45 jogos emitem o que sabem. Aqui entram as três coisas que eles não têm
 * como saber sem passar a conhecer a plataforma:
 *
 *   · `meta`         — de qual tentativa é este resultado, e qual o id do
 *                      jogo no catálogo (o jogo só conhece o próprio apelido);
 *   · `totalStages`  — quantas fases o catálogo diz que ele tem;
 *   · `isFinalStage` — se a fase que acabou é a última.
 *
 * Fazer isso aqui, e não em cada jogo, é o que impede 45 versões diferentes da
 * mesma regra — e é o que permite corrigir a regra em um lugar só.
 *
 * Se o jogo JÁ tiver preenchido `totalStages` ou `isFinalStage`, o que ele
 * disse vence: ele é quem sabe da própria estrutura, e o catálogo é o palpite.
 */
export function completarEvento(evento: PlatformEvent): PlatformEvent {
  const sessao = getEmbedSession();
  if (!sessao) return evento;

  const completo: PlatformEvent = {
    ...evento,
    meta: {
      attempt: sessao.attempt,
      gameId: sessao.gameId,
      sentAt: Date.now(),
      protocolVersion: 1,
    },
  };

  if (completo.type !== "GAME_COMPLETED") return completo;

  const total = completo.totalStages ?? sessao.totalStages;
  return {
    ...completo,
    totalStages: total,
    isFinalStage: completo.isFinalStage ?? completo.stage >= total,
  };
}
