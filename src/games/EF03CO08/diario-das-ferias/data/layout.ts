export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    thing: 5,
    notes: 8,
    visor: 20,
    lens: 30,
    controls: 40,
    card: 50,
    duda: 70,
    banner: 80,
    stage: 90,
    hud: 100,
} as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    y: 44,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

/** as páginas do diário, no meio do cabeçalho */
export const DIARY = { x: 640, y: 44, w: 74, h: 56, gap: 86 } as const

/** a praia é mais larga que a tela: a câmera do jogo passeia por ela */
export const WORLD = { w: 2044, h: 720 } as const

/** a mira anda pelo mundo; a câmera a segue com atraso suave */
export const AIM = { startX: 640, startY: 330, minX: 80, maxX: 1964, minY: 120, maxY: 540, speed: 560, follow: 140 } as const

/** o quadro de foco, na tela; a foto copia o que está dentro dele */
export const FOCUS = { w: 300, h: 220 } as const

/** zoom de cada jeito de segurar o tablet */
export const ZOOM = { free: 1, photo: 1.22, sound: 1.06, ms: 480 } as const

/** o tremidinho da mão segurando a câmera */
export const SWAY = { x: 5, y: 4, msX: 1300, msY: 970 } as const

/** o joystick: toque em qualquer ponto do canto de baixo à esquerda pega o controle */
export const JOY = { x: 140, y: 610, r: 90, knob: 40, base: 196, grabMaxX: 440, grabMinY: 430 } as const

export const TOOLS = { photo: { x: 1030, y: 610 }, sound: { x: 1190, y: 610 }, size: 140, labelDY: 88 } as const

/** o botão de disparo (foto) ou de gravar (som), que só existe com a ferramenta na mão */
export const ACTION = { x: 1120, y: 330, r: 74, labelDY: 100 } as const

/** o medidor do microfone, embaixo no meio */
export const METER = { x: 640, y: 652, w: 420, h: 72 } as const

/** as setinhas na borda que apontam para o que está fora da tela */
export const EDGE = { inset: 46, minY: 150, maxY: 520, size: 30 } as const

/** o cartão que nasce no meio antes de voar para o diário */
export const CARD = { x: 640, y: 330, frame: 16, foot: 46 } as const

export const BANNER = { x: 640, y: 128, w: 980, h: 116 } as const

export const DUDA = { x: 300, feet: 712, h: 540, oopsX: 150, oopsH: 330 } as const

/** o palco do teatrinho (fim do nível) */
export const STAGE = {
    screen: { x: 640, y: 234, w: 618, h: 320 },
    titleY: 106,
    contentY: 264,
    contentW: 480,
    contentH: 218,
    /** com legenda: a página sobe e a frase fica embaixo, dentro do telão */
    captionContentY: 248,
    captionContentH: 166,
    captionY: 362,
    captionW: 420,
    captionGap: 460,
    chipY: 520,
    chipX: 520,
    chipW: 280,
    chipH: 76,
    chipGap: 300,
    duda: { x: 1080, feet: 532, h: 330 },
    buttonY: 520,
    buttonW: 300,
    buttonH: 76,
    pageMs: 2000,
} as const

