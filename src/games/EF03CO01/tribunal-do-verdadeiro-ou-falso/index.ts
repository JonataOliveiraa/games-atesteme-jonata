import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'

/**
 * A `UIScene` saiu da lista.
 *
 * Ela existia só para desenhar a barra superior, e para isso precisava de um
 * canal de eventos ('mission-update') com a GameScene: dois objetos vivos
 * descrevendo o mesmo estado, um deles sem saber quando o outro reiniciava.
 * O HUD agora nasce e morre junto da cena que conhece o estado.
 */
const EF03CO01Config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#1a1008',
  scene: [BootScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 3,
  },
  audio: { disableWebAudio: false },
  dom: { createContainer: false },
}

export default EF03CO01Config
