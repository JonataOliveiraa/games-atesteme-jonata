import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { UIScene } from './scenes/UIScene'

const ArquitetoDasMissoesConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#1b2b46',
    scene: [BootScene, GameScene, UIScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: { activePointers: 3 },
    audio: { disableWebAudio: false },
    dom: { createContainer: false },
    render: { antialias: true, roundPixels: false },
}

export default ArquitetoDasMissoesConfig