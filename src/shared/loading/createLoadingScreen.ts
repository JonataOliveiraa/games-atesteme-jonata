import Phaser from 'phaser'

export interface LoadingScreenOptions {
    background?: number
    accent?: number
}

const W = 1280
const H = 720

const FONT_FAMILY = '"Comic Sans MS", "Arial Rounded MT Bold", sans-serif'

export function createLoadingScreen(
    scene: Phaser.Scene,
    options: LoadingScreenOptions = {}
) {
    const background = options.background ?? 0x2b2560
    const accent = options.accent ?? 0xffd166

    const layer = scene.add.container(0, 0).setDepth(10000)

    layer.add(
        scene.add.rectangle(W / 2, H / 2, W, H, background)
    )

    const BAR_W = 420
    const BAR_H = 24
    const barX = (W - BAR_W) / 2
    const barY = H / 2

    const loadingText = scene.add.text(W / 2, barY - 60, 'Carregando', {
        fontFamily: FONT_FAMILY,
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 5,
    }).setOrigin(0.5)

    const track = scene.add.graphics()
    track.fillStyle(0xffffff, 0.15)
    track.fillRoundedRect(barX, barY, BAR_W, BAR_H, BAR_H / 2)
    track.lineStyle(4, 0x000000, 1)
    track.strokeRoundedRect(barX, barY, BAR_W, BAR_H, BAR_H / 2)

    const fill = scene.add.graphics()

    const mascot = scene.add.container(barX, barY + BAR_H / 2)
    const mascotBody = scene.add.circle(0, 0, BAR_H, 0xffffff)
    const eyeL = scene.add.circle(-6, -3, 2.5, 0x2b2560)
    const eyeR = scene.add.circle(6, -3, 2.5, 0x2b2560)
    const mouth = scene.add.arc(0, 3, 6, 0, 180, false, 0x2b2560, 0)
    mouth.setStrokeStyle(2, 0x2b2560)
    mascot.add([mascotBody, eyeL, eyeR, mouth])

    layer.add([loadingText, track, fill, mascot])

    scene.tweens.add({
        targets: mascot,
        y: barY + BAR_H / 2 - 6,
        duration: 350,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    })

    const draw = (progress: number) => {
        const width = Math.max(0, BAR_W * progress)

        fill.clear()
        fill.fillStyle(accent)
        fill.fillRoundedRect(barX, barY, width, BAR_H, BAR_H / 2)

        if (width > 0) {
            fill.lineStyle(2, 0x000000, 1)
            fill.strokeRoundedRect(barX, barY, width, BAR_H, BAR_H / 2)
        }

        mascot.x = barX + width
    }
    draw(0)

    scene.load.on('progress', draw)
    scene.load.once('complete', () => {
        scene.load.off('progress', draw)
        dotsTimer.remove(false)
    })

    let dots = 1

    const dotsTimer = scene.time.addEvent({
        delay: 400,
        loop: true,
        callback: () => {
            loadingText.setText('Carregando' + '.'.repeat(dots))
            dots = (dots % 3) + 1
        },
    })

    return layer
}