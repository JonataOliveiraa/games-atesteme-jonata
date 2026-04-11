import { useEffect } from 'react'
import type { GameCode, GameLevel, RoundResult } from '../../shared/types/game'
import { EventBus } from '../../shared/EventBus'
import { progressStore } from '../../shared/utils/progressStore'
import PhaserCanvas from './PhaserCanvas'
import type Phaser from 'phaser'

interface GameLauncherProps {
  gameCode: GameCode
  level: GameLevel
  config: Phaser.Types.Core.GameConfig
  onComplete: (result: RoundResult) => void
  onExit: () => void
}

/**
 * Componente React responsável por:
 * 1. Renderizar o <PhaserCanvas> com o GameConfig do jogo
 * 2. Ouvir os eventos do EventBus vindos das Scenes Phaser
 * 3. Persistir o progresso via progressStore
 * 4. Notificar o pai (GameDetailsPage) nos eventos de conclusão e saída
 */
export default function GameLauncher({
  level,
  config,
  onComplete,
  onExit,
}: GameLauncherProps) {
  useEffect(() => {
    // Informa o nível ao Phaser assim que a Scene estiver pronta
    const handleSceneReady = () => {
      EventBus.emit('set-level', level)
    }

    const handleRoundComplete = (result: RoundResult) => {
      progressStore.saveRound(result)
      onComplete(result)
    }

    const handleGameOver = (result: RoundResult) => {
      progressStore.saveRound(result)
      onComplete(result)
    }

    const handleRequestExit = () => {
      onExit()
    }

    EventBus.on('scene-ready', handleSceneReady)
    EventBus.on('round-complete', handleRoundComplete)
    EventBus.on('game-over', handleGameOver)
    EventBus.on('request-exit', handleRequestExit)

    return () => {
      EventBus.off('scene-ready', handleSceneReady)
      EventBus.off('round-complete', handleRoundComplete)
      EventBus.off('game-over', handleGameOver)
      EventBus.off('request-exit', handleRequestExit)
    }
  }, [level, onComplete, onExit])

  return <PhaserCanvas config={config} />
}
