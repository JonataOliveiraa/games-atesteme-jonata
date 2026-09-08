export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    veil: 2,
    stage: 6,
    art: 14,
    problem: 20,
    shed: 30,
    button: 34,
    machine: 44,
    strip: 56,
    ask: 70,
    hud: 80,
    toast: 200,
    fx: 300,
}

export const HUD = {
    cy: 42,
    livesX: 24,
    levelX: 82,
    levelW: 156,
    levelH: 48,
    stampX: 268,
    stampSize: 54,
    stampGap: 20,
    helpX: 1210,
    helpR: 30,
    helpHit: 128,
}

export const ASK = {
    cx: 640,
    cy: 148,
    w: 604,
    h: 108,
    r: 30,
    villagerX: -222,
    villagerY: 2,
    villagerSize: 96,
    iconX: -92,
    iconSize: 76,
    labelX: -34,
}

/** O palco: onde a missão acontece. `ground` é a linha em que tudo se apoia. */
export const STAGE = {
    cx: 640,
    cy: 340,
    w: 620,
    h: 278,
    r: 34,
    top: 201,
    bottom: 479,
    left: 330,
    right: 950,
    ground: 430,
}

export const SHED = {
    top: 474,
    btnW: 320,
    btnH: 190,
    btnR: 30,
    cy: 595,
}

/**
 * A máquina e as duas plaquinhas nascem no botão e sobem juntas para o palco.
 * `machineDY` e `plaqueDY` são as posições no galpão; no palco a máquina fica
 * com os pés na linha do chão e as plaquinhas param acima da cabeça dela.
 */
/**
 * O quadro de `maquinas.png` é QUADRADO (300 x 300 numa folha de 900 x 600).
 * `machineH` é o lado, então a máquina ocupa 100 x 100 — e o miolo do botão foi
 * medido para caber ela mais as duas plaquinhas sem encostar na borda.
 */
export const CREW = {
    machineH: 108,
    machineDY: -30,
    /** Sem a caixa branca, a medida do grupo é o próprio ícone. */
    plaqueW: 78,
    plaqueH: 78,
    plaqueDX: 46,
    plaqueDY: 58,
    plaqueIcon: 64,
}

export const crewHomeY = SHED.cy + CREW.machineDY
export const stripHomeY = SHED.cy + CREW.plaqueDY

/** Onde os pés da máquina encostam quando ela chega ao palco. */
export const crewStageY = STAGE.ground - CREW.machineH / 2

/** O drone não pousa: ele para um palmo acima do chão, com o gancho na carga. */
export const DRONE_HOVER = 26

/** Quanto o gancho segura a carga abaixo do drone. */
export const HOOK_DY = 46

const SLOTS: Record<number, number[]> = {
    1: [640],
    2: [400, 880],
    3: [240, 640, 1040],
}

export const buttonX = (index: number, total: number) =>
    (SLOTS[total] ?? SLOTS[3])[index] ?? 640

export const stampX = (index: number) =>
    HUD.stampX + HUD.stampSize / 2 + index * (HUD.stampSize + HUD.stampGap)

export const CATALOG = {
    cardW: 292,
    cardH: 330,
    gap: 28,
    cy: 372,
    r: 30,
}
