/** Paleta do jogo. Tudo que é desenhado por código sai daqui, para casar
 *  com os PNGs sem número mágico espalhado pelas cenas. */
export const C = {
    claro: 0x947d62,
    normal: 0x7e654c,
    escuro: 0x534434,
    borda: 0x2d2319,
    amarelo: 0xdda21c,

    // Derivados, usados só em estado (certo / errado / apagado)
    verde: 0x5f8f3e,
    vermelho: 0xa8412c,
    creme: 0xf3e7d3,
    apagado: 0x6b5a49,
} as const

export const CSS = {
    claro: '#947d62',
    normal: '#7e654c',
    escuro: '#534434',
    borda: '#2d2319',
    amarelo: '#dda21c',
    verde: '#5f8f3e',
    vermelho: '#a8412c',
    creme: '#f3e7d3',
} as const