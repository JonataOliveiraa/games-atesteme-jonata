import Phaser from 'phaser'

export function pause(scene: Phaser.Scene, ms: number): Promise<void> {
    if (ms <= 0) return Promise.resolve()
    return new Promise(resolve => {
        const clock = { v: 0 }
        scene.tweens.add({
            targets: clock,
            v: 1,
            duration: ms,
            onComplete: () => resolve(),
        })
    })
}

export function settled(scene: Phaser.Scene, job: Promise<void>, ms: number): Promise<void> {
    return Promise.race([job, pause(scene, ms + 260)])
}
