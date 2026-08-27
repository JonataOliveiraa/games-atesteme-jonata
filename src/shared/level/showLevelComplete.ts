import Phaser from 'phaser'

// Tamanho de PROJETO — fallback, nao o canvas. O tamanho real vem do
// `scene.scale` dentro da funcao: a EF01CO03 roda em 960x540 e o modal
// nascia centrado em (640, 360), que la e o canto de baixo a direita.
const DESIGN_W = 1280
const DESIGN_H = 720
const PW = 604          // painel mais largo: cabe fonte maior sem quebrar frase curta
const PAD_X = 56
const CAP_H = 34       // faixa de acento colada no topo do painel

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

const darken = (color: number, amount: number) =>
  Phaser.Display.Color.ValueToColor(color).darken(amount).color

export function showLevelComplete(
  scene: Phaser.Scene,
  options: LevelCompleteOptions = {},
): LevelCompleteHandle {
  const accent = options.accent ?? 0xf59e0b
  const panelColor = options.panelColor ?? 0xfff6e8
  const overlayColor = options.overlayColor ?? 0x12324a
  const depth = options.depth ?? 450

  // O CANVAS DESTE JOGO. Em 1280x720 estes dois valem 1280 e 720, e tudo
  // abaixo fica identico ao que sempre foi.
  const W = scene.scale.width || DESIGN_W
  const H = scene.scale.height || DESIGN_H

  const overlay = scene.add.rectangle(W / 2, H / 2, W, H, overlayColor, 0.6)
    .setDepth(depth).setInteractive()
  const modal = scene.add.container(W / 2, H / 2).setDepth(depth + 1)

  // ── textos ────────────────────────────────────────────────────────────
  // Arial Black no título; sem stroke branco, que sobre painel claro só
  // engorda a letra e suja a forma.
  const title = scene.add.text(0, 0, options.title ?? 'Parabéns!', {
    fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    fontSize: '46px',
    color: options.titleColor ?? '#25327a',
    align: 'center',
    wordWrap: { width: PW - PAD_X * 2 },
    lineSpacing: 4,
  }).setOrigin(0.5).setResolution(2)

  const subtitle = options.subtitle
    ? scene.add.text(0, 0, options.subtitle, {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
      fontSize: '28px',
      color: options.subtitleColor ?? '#f57c00',
      align: 'center',
      wordWrap: { width: PW - PAD_X * 2 },
      lineSpacing: 3,
    }).setOrigin(0.5).setResolution(2)
    : null

  const message = options.message
    ? scene.add.text(0, 0, options.message, {
      fontFamily: 'DynaPuff, Arial, sans-serif',
      fontStyle: 'bold',
      fontSize: '21px',
      color: options.messageColor ?? '#3b3b3b',
      align: 'center',
      wordWrap: { width: PW - PAD_X * 2 - 20 },
      lineSpacing: 5,
    }).setOrigin(0.5).setResolution(2)
    : null

  const buttons = (options.buttons ?? []).map(def => makeButton(scene, def, accent))

  const waitText = options.autoAdvance
    ? scene.add.text(0, 0, options.autoAdvance.label ?? 'Preparando o próximo nível...', {
      fontFamily: 'DynaPuff, Arial, sans-serif',
      fontStyle: 'bold',
      fontSize: '18px',
      color: '#7a8ba3',
    }).setOrigin(0.5).setResolution(2)
    : null

  // ── empilhamento vertical ─────────────────────────────────────────────
  const hasFooter = buttons.length > 0 || !!waitText
  let cursor = CAP_H + 28

  const place = (obj: Phaser.GameObjects.Text | null, gap: number) => {
    if (!obj) return
    obj.setY(cursor + obj.height / 2)
    cursor += obj.height + gap
  }

  place(title, 18)
  place(subtitle, 16)
  place(message, options.progress || hasFooter ? 30 : 0)

  let dotsY = 0
  if (options.progress) {
    dotsY = cursor + 12
    cursor += 24 + (hasFooter ? 32 : 0)
  }

  if (buttons.length) {
    const gap = 22
    const totalW = buttons.reduce((sum, b) => sum + b.width, 0) + gap * (buttons.length - 1)
    let bx = -totalW / 2
    buttons.forEach(b => {
      b.setPosition(bx + b.width / 2, cursor + 34)
      bx += b.width + gap
    })
    cursor += 72
  } else if (waitText) {
    waitText.setY(cursor + waitText.height / 2)
    cursor += waitText.height
  }

  const PH = cursor + 40
  const shift = -PH / 2

  const content: Phaser.GameObjects.GameObject[] = [
    title, subtitle, message, waitText, ...buttons,
  ].filter(Boolean) as Phaser.GameObjects.GameObject[]

  content.forEach(o => {
    const obj = o as Phaser.GameObjects.Container
    obj.setY(obj.y + shift)
  })

  // ── painel ────────────────────────────────────────────────────────────
  // Sombra em três camadas: borda macia em vez do degrau duro de antes.
  const shadow = scene.add.graphics()
  for (const [dy, a, grow] of [[26, 0.10, 10], [16, 0.12, 4], [8, 0.16, 0]] as const) {
    shadow.fillStyle(0x000000, a)
    shadow.fillRoundedRect(-PW / 2 - grow, shift + dy, PW + grow * 2, PH, 32 + grow)
  }

  const bg = scene.add.graphics()
  bg.fillStyle(darken(panelColor, 14), 1)
  bg.fillRoundedRect(-PW / 2, shift, PW, PH, 32)
  bg.fillStyle(panelColor, 1)
  bg.fillRoundedRect(-PW / 2 + 5, shift + 5, PW - 10, PH - 12, 28)

  const cap = scene.add.graphics()
  cap.fillStyle(accent, 1)
  cap.fillRoundedRect(-PW / 2 + 5, shift + 5, PW - 10, CAP_H,
    { tl: 28, tr: 28, bl: 0, br: 0 })
  cap.fillStyle(0xffffff, 0.26)
  cap.fillRoundedRect(-PW / 2 + 26, shift + 11, PW - 52, 7, 4)
  cap.fillStyle(0xffffff, 0.3)
  cap.fillRoundedRect(-PW / 2 + 24, shift + 10, PW - 48, 6, 3)

  modal.add([shadow, bg, cap, ...content])

  // ── progresso ─────────────────────────────────────────────────────────
  let dotsGroup: Phaser.GameObjects.Container | null = null
  if (options.progress) {
    const { total, current } = options.progress
    const gap = 34
    const startX = -((total - 1) * gap) / 2
    dotsGroup = scene.add.container(0, dotsY + shift)

    for (let i = 0; i < total; i++) {
      const x = startX + i * gap
      const g = scene.add.graphics()
      if (i < current) {
        g.fillStyle(accent, 1); g.fillCircle(x, 0, 11)
        g.lineStyle(3, 0xffffff, 0.9); g.strokeCircle(x, 0, 11)
      } else if (i === current) {
        // "atual" precisa aparecer sobre painel claro: anel forte, miolo suave
        g.fillStyle(accent, 0.28); g.fillCircle(x, 0, 12)
        g.lineStyle(4, accent, 1); g.strokeCircle(x, 0, 12)
      } else {
        g.fillStyle(0xd8dde8, 1); g.fillCircle(x, 0, 9)
      }
      dotsGroup.add(g)
    }
    modal.add(dotsGroup)
  }

  // ── entrada: painel primeiro, conteúdo em cascata ─────────────────────
  modal.setScale(0.9).setAlpha(0)
  scene.tweens.add({
    targets: modal, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut',
  })

  const staggered = [title, subtitle, message, dotsGroup, ...buttons, waitText]
    .filter(Boolean) as Phaser.GameObjects.Container[]

  staggered.forEach((obj, i) => {
    const restY = obj.y
    obj.setAlpha(0).setY(restY + 16)
    scene.tweens.add({
      targets: obj, alpha: 1, y: restY,
      duration: 300, delay: 140 + i * 70, ease: 'Cubic.easeOut',
    })
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
  const deep = darken(color, 26)
  const h = 62, drop = 6
  const w = Math.max(230, def.label.length * 15 + 76)

  const button = scene.add.container(0, 0)
  const bg = scene.add.graphics()
  const label = scene.add.text(0, -drop / 2, def.label, {
    fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    fontSize: '22px',
    color: '#ffffff',
  }).setOrigin(0.5).setResolution(2)

  let pressed = false
  // Base escura fixa + face que afunda: o botão tem espessura, não é adesivo.
  const paint = () => {
    bg.clear()
    bg.fillStyle(deep, 1)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h + drop, h / 2)
    bg.fillStyle(color, 1)
    bg.fillRoundedRect(-w / 2, -h / 2 + (pressed ? drop : 0), w, h, h / 2)
    bg.fillStyle(0xffffff, 0.28)
    bg.fillRoundedRect(-w / 2 + 12, -h / 2 + (pressed ? drop : 0) + 8, w - 24, h * 0.3, h / 4)
    label.setY(-drop / 2 + (pressed ? drop : 0))
  }
  paint()

  button.add([bg, label])
  button.setSize(w, h + drop)
  button.width = w
  button.setInteractive({ useHandCursor: true })

  button.on('pointerdown', () => { pressed = true; paint() })
  button.on('pointerout', () => { if (pressed) { pressed = false; paint() } })
  button.on('pointerup', () => {
    if (!pressed) return
    pressed = false; paint()
    def.onClick()
  })

  return button
}