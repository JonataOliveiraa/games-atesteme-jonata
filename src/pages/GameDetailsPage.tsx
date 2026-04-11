import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../context/useGame'
import { games } from '../data/games'
import GameLauncher from '../platform/components/GameLauncher'
import type { GameLevel, RoundResult } from '../shared/types/game'

// Mapa de slug → código BNCC — expandir conforme jogos forem implementados
const SLUG_TO_CODE: Record<string, string> = {
  'base-dos-classificadores': 'EF01CO01',
}

// Importação dinâmica dos GameConfigs implementados
// Cada entry retorna { default: Phaser.Types.Core.GameConfig }
const GAME_CONFIG_LOADERS: Record<string, () => Promise<{ default: Phaser.Types.Core.GameConfig }>> = {
  EF01CO01: () => import('../games/EF01CO01/index'),
}

export default function GameDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const {
    coins,
    lives,
    consumeLife,
    buyLife,
    addCoins,
    loseLifeOnFailure,
    ensureLivesForGame,
    setCurrentGame,
    activateGameHint,
    usedHintsByGame,
  } = useGame()

  const [gameConfig, setGameConfig] = useState<Phaser.Types.Core.GameConfig | null>(null)
  const [currentLevel] = useState<GameLevel>(1)

  const hintAvailable = slug && !usedHintsByGame.includes(slug) ? 1 : 0
  const gameCode = slug ? SLUG_TO_CODE[slug] : undefined
  const game = games.find(g => g.slug === slug)

  useEffect(() => {
    if (slug) {
      ensureLivesForGame(slug)
      setCurrentGame(slug)
    }
    return () => {
      setCurrentGame(null)
    }
  }, [slug, ensureLivesForGame, setCurrentGame])

  useEffect(() => {
    if (!gameCode) return
    const loader = GAME_CONFIG_LOADERS[gameCode]
    if (!loader) return
    loader().then(mod => setGameConfig(mod.default)).catch(console.error)
  }, [gameCode])

  const handleHintClick = () => {
    if (!slug) return
    const result = activateGameHint(slug)
    if (result.success) {
      alert('Dica usada com sucesso por 10 moedas.')
      return
    }
    if (result.reason === 'already_used') {
      alert('A dica deste jogo já foi usada.')
      return
    }
    if (result.reason === 'not_enough_coins') {
      alert('Você não tem moedas suficientes para usar a dica deste jogo.')
    }
  }

  const handleLifeClick = () => {
    const success = consumeLife()
    if (!success) {
      const bought = buyLife()
      if (!bought) {
        alert('Você não tem vidas e também não possui 20 moedas para comprar uma nova vida.')
        return
      }
      alert('Você estava sem vidas. Compramos 1 vida por 20 moedas.')
      return
    }
    alert('Vida consumida com sucesso.')
  }

  const handleRoundComplete = (result: RoundResult) => {
    addCoins(result.hits * 5)
  }

  const handleExit = () => {
    navigate(-1)
  }

  return (
    <section>
      <button className="back-link" onClick={() => navigate(-1)}>
        {'<'} Voltar
      </button>

      <h1 className="page-title">{game?.title ?? slug}</h1>

      <div className="game-topbar">
        <div className="player-box">
          <div className="player-avatar">H</div>
          <div className="player-info">
            <span className="player-label">Jogadora</span>
            <strong>Helena</strong>
          </div>
        </div>

        <div className="game-resources">
          <button className="resource-button" onClick={handleHintClick}>
            <span className="resource-icon">💡</span>
            <div className="resource-text">
              <span>Dica</span>
              <strong>{hintAvailable}</strong>
            </div>
          </button>

          <button className="resource-button" onClick={handleLifeClick}>
            <span className="resource-icon">💗</span>
            <div className="resource-text">
              <span>Vidas</span>
              <strong>{lives}</strong>
            </div>
          </button>

          <div className="resource-card">
            <span className="resource-icon">🪙</span>
            <div className="resource-text">
              <span>Moedas</span>
              <strong>{coins}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="game-area">
        {gameConfig ? (
          <GameLauncher
            gameCode={gameCode as import('../shared/types/game').GameCode}
            level={currentLevel}
            config={gameConfig}
            onComplete={handleRoundComplete}
            onExit={handleExit}
          />
        ) : gameCode && !gameConfig ? (
          <div className="game-screen">
            <p style={{ color: 'var(--muted)' }}>Carregando jogo...</p>
          </div>
        ) : (
          <div className="game-screen">
            <h2>Em breve</h2>
            <p>Este jogo ainda está sendo desenvolvido.</p>
            <div className="game-actions" style={{ marginTop: 24 }}>
              <button onClick={() => addCoins(5)}>Simular acerto (+5 moedas)</button>
              <button onClick={() => addCoins(10)}>Simular 3 acertos (+10 moedas)</button>
              <button onClick={() => loseLifeOnFailure()}>Simular erro (-1 vida)</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
