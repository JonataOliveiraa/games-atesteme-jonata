import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

interface PhaserCanvasProps {
  config: Phaser.Types.Core.GameConfig
}

/**
 * Monta e desmonta a instância do Phaser.Game vinculada a uma div container.
 * O Phaser cria o <canvas> internamente dentro do ref.
 *
 * Regras:
 * - Nunca recriar a instância no re-render — o useEffect roda só uma vez (deps vazia)
 * - Sempre chamar game.destroy(true) no cleanup para liberar WebGL e listeners
 */
export default function PhaserCanvas({ config }: PhaserCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const game = new Phaser.Game({
      ...config,
      parent: containerRef.current,
    })

    return () => {
      if (game) {
        game.destroy(true)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} className="phaser-container" />
}
