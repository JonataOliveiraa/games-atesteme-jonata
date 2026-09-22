import Phaser from 'phaser'

export interface FrameBox {
    /** A caixa do desenho dentro da célula, em fração de 0 a 1. */
    left: number
    right: number
    top: number
    bottom: number
    width: number
    height: number
}

export interface Sheet {
    key: string
    cols: number
    rows: number
    frameW: number
    frameH: number
    boxes: FrameBox[]
}

const CACHE = '__trilhaSheets'
const FULL: FrameBox = { left: 0, right: 1, top: 0, bottom: 1, width: 1, height: 1 }

const cache = (scene: Phaser.Scene): Record<string, Sheet> => {
    let store = scene.registry.get(CACHE) as Record<string, Sheet> | undefined
    if (!store) {
        store = {}
        scene.registry.set(CACHE, store)
    }
    return store
}

type Blank = (r: number, g: number, b: number, a: number) => boolean

const byAlpha: Blank = (_r, _g, _b, a) => a < 12
const byAlphaOrWhite: Blank = (r, g, b, a) => a < 12 || (r > 244 && g > 244 && b > 244)

function measure(
    image: CanvasImageSource,
    w: number,
    h: number,
    cols: number,
    rows: number,
    blank: Blank,
) {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    ctx.drawImage(image, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data

    const frameW = w / cols
    const frameH = h / rows
    const boxes: FrameBox[] = []

    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < cols; column++) {
            const x0 = Math.floor(column * frameW)
            const y0 = Math.floor(row * frameH)
            const x1 = Math.floor((column + 1) * frameW)
            const y1 = Math.floor((row + 1) * frameH)

            let minX = x1
            let maxX = x0
            let minY = y1
            let maxY = y0

            for (let y = y0; y < y1; y++) {
                const line = y * w
                for (let x = x0; x < x1; x++) {
                    const i = (line + x) * 4
                    if (blank(data[i], data[i + 1], data[i + 2], data[i + 3])) continue
                    if (x < minX) minX = x
                    if (x > maxX) maxX = x
                    if (y < minY) minY = y
                    if (y > maxY) maxY = y
                }
            }

            if (maxX < minX || maxY < minY) {
                boxes.push({ ...FULL })
                continue
            }

            const left = (minX - x0) / frameW
            const right = (maxX + 1 - x0) / frameW
            const top = (minY - y0) / frameH
            const bottom = (maxY + 1 - y0) / frameH
            boxes.push({ left, right, top, bottom, width: right - left, height: bottom - top })
        }
    }

    return boxes
}

/**
 * Corta a folha na grade pedida com a medida REAL do arquivo e devolve a caixa
 * alfa de cada quadro. As folhas chegaram em tamanhos diferentes do contrato, e
 * dividir o arquivo entregue é o que mantém o corte certo em qualquer entrega.
 */
export function cutSheet(
    scene: Phaser.Scene,
    key: string,
    cols = 1,
    rows = 1,
    trimWhite = false,
): Sheet | null {
    if (!scene.textures.exists(key)) return null

    const store = cache(scene)
    if (store[key]) return store[key]

    const texture = scene.textures.get(key)
    const source = texture.getSourceImage() as HTMLImageElement
    const w = source.width
    const h = source.height
    const frameW = w / cols
    const frameH = h / rows

    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < cols; column++) {
            const name = String(row * cols + column)
            if (texture.has(name)) continue
            texture.add(
                name,
                0,
                Math.round(column * frameW),
                Math.round(row * frameH),
                Math.floor(frameW),
                Math.floor(frameH),
            )
        }
    }

    let boxes: FrameBox[] | null = null
    try {
        boxes = measure(source, w, h, cols, rows, trimWhite ? byAlphaOrWhite : byAlpha)
    } catch {
        boxes = null
    }
    if (!boxes) boxes = Array.from({ length: cols * rows }, () => ({ ...FULL }))

    const sheet: Sheet = { key, cols, rows, frameW, frameH, boxes }
    store[key] = sheet
    return sheet
}

export const boxOf = (sheet: Sheet | null, frame: number): FrameBox =>
    sheet?.boxes[frame] ?? FULL

/**
 * Registra um quadro sem a faixa vazia do topo e devolve a altura dele.
 *
 * O `chao.png` entregue tem o topo BRANCO OPACO, não transparente: reposicionar
 * a imagem pela medida do alfa deixaria essa faixa branca cobrindo os morros.
 */
export function trimTop(scene: Phaser.Scene, sheet: Sheet, frame = 0): number {
    const box = boxOf(sheet, frame)
    const texture = scene.textures.get(sheet.key)
    const name = `ink${frame}`
    const cut = Math.round(box.top * sheet.frameH)
    const height = Math.round(sheet.frameH) - cut
    if (!texture.has(name)) {
        texture.add(name, 0, 0, cut, Math.floor(sheet.frameW), height)
    }
    return height
}

export interface Fit {
    width: number
    height: number
    /** O quanto mover a imagem para o DESENHO ficar centrado no ponto pedido. */
    offsetX: number
    offsetY: number
}

/** Encaixa o desenho de um quadro numa caixa, medindo pelo alfa e não pela célula. */
export function fitFrame(sheet: Sheet, frame: number, maxW: number, maxH: number): Fit {
    const box = boxOf(sheet, frame)
    const scale = Math.min(
        maxW / (box.width * sheet.frameW),
        maxH / (box.height * sheet.frameH),
    )
    return {
        width: sheet.frameW * scale,
        height: sheet.frameH * scale,
        offsetX: -(box.left + box.width / 2 - 0.5) * sheet.frameW * scale,
        offsetY: -(box.top + box.height / 2 - 0.5) * sheet.frameH * scale,
    }
}
