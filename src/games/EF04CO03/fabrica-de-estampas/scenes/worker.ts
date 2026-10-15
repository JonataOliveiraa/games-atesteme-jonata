import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { cellKey, WORKER as POSE, WORKER_SHEET } from '../data/files'
import { DEPTH, WORKER } from '../data/layout'
import { has } from './art'

export type Pose = keyof typeof POSE

export interface Worker {
    pose(name: Pose): void
    destroy(): void
}

/** a estampadora só reage, e só existe quando a folha dela chegar */
export function createWorker(scene: Phaser.Scene): Worker {
    if (!has(scene, WORKER_SHEET)) return { pose() {}, destroy() {} }
    const image = scene.add.image(WORKER.x, WORKER.y, WORKER_SHEET.key, cellKey(POSE.wave)).setOrigin(0.5, 1).setDepth(DEPTH.worker)
    const fitScale = () => WORKER.h / image.frame.height
    image.setScale(fitScale())
    return {
        pose(name) {
            image.setFrame(cellKey(POSE[name]))
            scene.tweens.killTweensOf(image)
            image.setScale(fitScale() * 0.94)
            void FX.to(scene, image, { scale: fitScale() }, { duration: 260, ease: 'Back.easeOut' })
        },
        destroy() {
            image.destroy()
        },
    }
}
