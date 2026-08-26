import Phaser from 'phaser'

const PW = 556

export interface LevelCompleteButton {
    label: string
    color?: number
    onClick: () => void
}

export interface LevelCompleteOptions {
    title?: string
    subtitle?: string
    message?: string
    accent?: number
    panelColor?: number
    overlayColor?: number
    titleColor?: string
    subtitleColor?: string
    messageColor?: string
    progress?: { total: number; current: number }
    buttons?: LevelCompleteButton[]
    autoAdvance?: { delay: number; label?: string; onComplete: () => void }
    depth?: number
}

export interface LevelCompleteHandle {
    destroy: () => void
}

export function showLevelComplete(
    scene: Phaser.Scene,
    options: LevelCompleteOptions = {},
): LevelCompleteHandle {

    const accent = options.accent ?? 0xf59e0b
    const panelColor = options.panelColor ?? 0xfff6e8
    const overlayColor = options.overlayColor ?? 0x12324a
    const depth = options.depth ?? 450

    const { width, height } = scene.scale

    const overlay = scene.add.rectangle(
        width / 2,
        height / 2,
        width,
        height,
        overlayColor,
        0.56
    )
        .setDepth(depth)
        .setScrollFactor(0)
        .setInteractive()

    const modal = scene.add.container(
        width / 2,
        height / 2
    )
        .setDepth(depth + 1)
        .setScrollFactor(0)

    const title = scene.add.text(0, 0, options.title ?? 'Parabéns!', {
        fontFamily: 'DynaPuff, Arial, sans-serif',
        fontSize: '40px',
        fontStyle: 'bold',
        color: options.titleColor ?? '#25327a',
        stroke: '#ffffff',
        strokeThickness: 5,
        align: 'center',
        wordWrap: { width: PW - 90 },
    }).setOrigin(0.5).setResolution(2)

    const subtitle = options.subtitle
        ? scene.add.text(0, 0, options.subtitle, {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontSize: '26px',
            fontStyle: 'bold',
            color: options.subtitleColor ?? '#f57c00',
            align: 'center',
            wordWrap: { width: PW - 110 },
        }).setOrigin(0.5).setResolution(2)
        : null

    const message = options.message
        ? scene.add.text(0, 0, options.message, {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontSize: '17px',
            fontStyle: 'bold',
            color: options.messageColor ?? '#3b3b3b',
            align: 'center',
            wordWrap: { width: PW - 120 },
        }).setOrigin(0.5).setResolution(2)
        : null

    const buttons = (options.buttons ?? []).map(def => makeButton(scene, def, accent))

    const waitText = options.autoAdvance
        ? scene.add.text(0, 0, options.autoAdvance.label ?? 'Preparando o próximo nível...', {
            fontFamily: 'DynaPuff, Arial, sans-serif',
            fontSize: '15px',
            fontStyle: 'bold',
            color: '#25327a',
        }).setOrigin(0.5).setResolution(2)
        : null

    let cursor = 34
    const place = (obj: Phaser.GameObjects.Text | null, gap: number) => {
        if (!obj) return
        obj.setY(cursor + obj.height / 2)
        cursor += obj.height + gap
    }

    place(title, 16)
    place(subtitle, 14)
    place(message, options.progress || buttons.length || waitText ? 24 : 0)

    let dotsY = 0
    if (options.progress) {
        dotsY = cursor + 9
        cursor += 18 + (buttons.length || waitText ? 26 : 0)
    }

    if (buttons.length) {
        const gap = 20
        const totalW = buttons.reduce((sum, b) => sum + b.width, 0) + gap * (buttons.length - 1)
        let bx = -totalW / 2
        buttons.forEach(b => {
            b.setPosition(bx + b.width / 2, cursor + 29)
            bx += b.width + gap
        })
        cursor += 58
    } else if (waitText) {
        waitText.setY(cursor + waitText.height / 2)
        cursor += waitText.height
    }

    const PH = cursor + 34
    const shift = -PH / 2

    const shiftable: Phaser.GameObjects.GameObject[] = [
        title, subtitle, message, waitText, ...buttons,
    ].filter(Boolean) as Phaser.GameObjects.GameObject[]

    shiftable.forEach(o => {
        const obj = o as Phaser.GameObjects.Container
        obj.setY(obj.y + shift)
    })

    const shadow = scene.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-PW / 2 + 8, shift + 12, PW, PH, 28)

    const bg = scene.add.graphics()
    bg.fillStyle(panelColor, 0.98)
    bg.fillRoundedRect(-PW / 2, shift, PW, PH, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-PW / 2, shift, PW, PH, 28)

    const topBar = scene.add.graphics()
    topBar.fillStyle(accent, 1)
    topBar.fillRoundedRect(-196, shift - 16, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, shift - 16, 392, 28, 14)

    modal.add([shadow, bg, topBar, ...shiftable])

    if (options.progress) {
        const { total, current } = options.progress
        const gap = 28
        const startX = -((total - 1) * gap) / 2
        for (let i = 0; i < total; i++) {
            const dot = scene.add.graphics()
            const done = i < current
            dot.fillStyle(done ? accent : i === current ? 0xffffff : 0xd8dde8, 1)
            dot.fillCircle(startX + i * gap, dotsY + shift, 8)
            dot.lineStyle(2, 0xffffff, 0.9)
            dot.strokeCircle(startX + i * gap, dotsY + shift, 8)
            modal.add(dot)
        }
    }

    modal.setScale(0.9).setAlpha(0)
    scene.tweens.add({
        targets: modal,
        alpha: 1,
        scale: 1,
        duration: 260,
        ease: 'Back.easeOut',
    })

    const destroy = () => {
        overlay.destroy()
        modal.destroy()
    }

    if (options.autoAdvance) {
        scene.time.delayedCall(options.autoAdvance.delay, () => {
            destroy()
            options.autoAdvance!.onComplete()
        })
    }

    return { destroy }
}

function makeButton(scene: Phaser.Scene, def: LevelCompleteButton, accent: number) {
    const color = def.color ?? accent
    const w = Math.max(200, def.label.length * 13 + 60)

    const button = scene.add.container(0, 0)
    const bg = scene.add.graphics()
    bg.fillStyle(color, 1)
    bg.fillRoundedRect(-w / 2, -25, w, 50, 25)
    bg.lineStyle(4, 0xffffff, 0.95)
    bg.strokeRoundedRect(-w / 2, -25, w, 50, 25)

    const label = scene.add.text(0, 0, def.label, {
        fontFamily: 'DynaPuff, Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)

    button.add([bg, label])
    button.setSize(w, 54)
    button.width = w
    button.setInteractive({ useHandCursor: true })
    button.on('pointerdown', () => {
        scene.tweens.add({ targets: button, scale: 0.95, duration: 70, yoyo: true })
        def.onClick()
    })

    return button
}