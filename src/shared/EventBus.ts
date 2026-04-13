import Phaser from 'phaser'

/**
 * Canal de comunicação singleton entre React e Phaser.
 *
 * React → Phaser:  EventBus.emit('set-level', 2)
 * Phaser → React:  EventBus.emit('round-complete', result)
 *
 * Regras:
 * - Sempre remover listeners no shutdown() da Scene
 * - Nunca importar componentes React dentro de Scenes Phaser
 * - Nunca importar Scenes Phaser diretamente em componentes React
 */
export const EventBus = new Phaser.Events.EventEmitter()
