import { useEffect, useRef } from "react";
import PhaserCanvas from "./PhaserCanvas";
import { gameBridge } from "../../shared/bridge/gameBridge";
import type { PlatformEvent } from "../../shared/contracts/platformEvents";
import type { PlatformCommand } from "../../shared/contracts/platformCommands";
import { resolveGameId } from "../../data/gameIndex";
import type Phaser from "phaser";

interface GameLauncherProps {
  gameId: string;
  level: 1 | 2 | 3;
  points: number;
  lives: number;
  config: Phaser.Types.Core.GameConfig;
  onPlatformEvent: (event: PlatformEvent) => void;
}

export default function GameLauncher({
  gameId,
  level,
  points,
  lives,
  config,
  onPlatformEvent,
}: GameLauncherProps) {
  const latestHandlerRef = useRef(onPlatformEvent);

  useEffect(() => {
    latestHandlerRef.current = onPlatformEvent;
  }, [onPlatformEvent]);

  useEffect(() => {
    const unsubscribe = gameBridge.onGameEvent((event) => {
      const normalizedEventGameId = resolveGameId(event.gameId) ?? event.gameId;
      const normalizedCurrentGameId = resolveGameId(gameId) ?? gameId;

      if (normalizedEventGameId !== normalizedCurrentGameId) return;
      latestHandlerRef.current({ ...event, gameId: normalizedEventGameId });
    });

    return () => {
      unsubscribe();
    };
  }, [gameId]);

  /*
   * START_GAME SÓ DEPOIS DE GAME_READY.
   *
   * Antes isto era um `setTimeout(0)` disparado na montagem — e um jogo Phaser
   * leva centenas de milissegundos para bootar, carregar as imagens e chegar
   * ao `create()`, que é onde ele registra o ouvinte. O comando saía com a
   * cena ainda no preload e caía no vazio, sempre. Os jogos não notavam
   * porque também recebem `points` e `stage` pelos dados da cena; a plataforma
   * notaria, porque para ela o comando simplesmente não teve efeito.
   *
   * Agora o launcher espera o jogo dizer que está pronto. É o mesmo aperto de
   * mão que a Atesteme faz do lado dela: GAME_READY primeiro, comando depois.
   */
  useEffect(() => {
    let enviado = false;

    const enviarStart = () => {
      if (enviado) return;
      enviado = true;

      const startCommand: PlatformCommand = {
        type: "START_GAME",
        gameId,
        points,
        stage: level,
        lives,
      };

      gameBridge.send(startCommand);
    };

    const cancelar = gameBridge.onGameEvent((event) => {
      if (event.type !== "GAME_READY") return;

      const doJogo = resolveGameId(event.gameId) ?? event.gameId;
      const atual = resolveGameId(gameId) ?? gameId;
      if (doJogo !== atual) return;

      enviarStart();
    });

    /*
     * A rede de segurança: se em três segundos nenhum GAME_READY chegou, manda
     * assim mesmo. Um jogo antigo que nunca emite o evento não pode ficar sem
     * receber o contexto da partida por causa disto.
     */
    const prazo = window.setTimeout(enviarStart, 3000);

    return () => {
      cancelar();
      window.clearTimeout(prazo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

return <PhaserCanvas key={gameId} gameId={gameId} config={config} stage={level} lives={lives} />;
}
