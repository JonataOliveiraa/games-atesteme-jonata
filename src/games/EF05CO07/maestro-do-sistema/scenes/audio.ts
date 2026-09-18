import { BEAT_MS } from '../data/fases'
import type { Layer } from '../types'

type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    /** O compasso: cada camada que está tocando entra com a parte dela. */
    beat(index: number, layers: Layer[]): void
    pick(): void
    land(): void
    ret(): void
    finish(): void
    chord(): void
    fanfare(): void
    setMuted(on: boolean): void
    destroy(): void
}

/**
 * A VOLTA DE QUATRO COMPASSOS: dó, lá menor, fá, sol.
 *
 * Toda camada tira as notas daqui, então qualquer combinação de programas
 * tocando soa afinada — que é a promessa do §5 do planejamento. Cada compasso
 * tem QUATRO subdivisões: uma nota por compasso não é melodia, é metrônomo com
 * altura, e era o que o jogo fazia antes.
 */
const CHORDS = [
    { root: 131, fifth: 196, mel: [523, 659, 587, 659], pad: [330, 392] },
    { root: 110, fifth: 165, mel: [523, 440, 494, 440], pad: [262, 330] },
    { root: 175, fifth: 262, mel: [440, 523, 587, 523], pad: [262, 349] },
    { root: 196, fifth: 294, mel: [587, 494, 440, 494], pad: [247, 294] },
]

/** Um quarto de compasso, em segundos. */
const STEP = BEAT_MS / 4000

/** Tudo sintetizado em WebAudio, sem arquivo. É o padrão do projeto. */
export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let muted = false

    const get = () => {
        if (muted) return undefined
        if (!ctx) {
            const Ctor = window.AudioContext
                ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return undefined
            ctx = new Ctor()
        }
        if (ctx.state === 'suspended') void ctx.resume()
        return ctx
    }

    /*
     * SOM NUNCA DERRUBA O JOGO.
     *
     * `beat` roda dentro do `update` da cena: uma exceção aqui — contexto
     * suspenso, aba em segundo plano, política de autoplay, documento trocado —
     * sairia pelo `update` e pararia o loop inteiro. O `try` transforma isso em
     * silêncio, que é a falha aceitável.
     */
    const safe = (job: () => void) => {
        try {
            job()
        } catch {
            // sem som, o jogo continua
        }
    }

    const tone = (freq: number, dur: number, wave: Wave = 'sine', gain = 0.1, delay = 0) => safe(() => {
        const audio = get()
        if (!audio) return
        const at = audio.currentTime + delay
        const osc = audio.createOscillator()
        const vol = audio.createGain()
        osc.type = wave
        osc.frequency.setValueAtTime(freq, at)
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(gain, at + 0.018)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        osc.connect(vol).connect(audio.destination)
        osc.start(at)
        osc.stop(at + dur + 0.02)
    })

    const noise = (dur: number, from: number, to: number, gain = 0.1, delay = 0) => safe(() => {
        const audio = get()
        if (!audio) return
        const at = audio.currentTime + delay
        const frames = Math.max(1, Math.floor(audio.sampleRate * dur))
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
        const src = audio.createBufferSource()
        src.buffer = buffer
        const filter = audio.createBiquadFilter()
        filter.type = 'bandpass'
        filter.Q.value = 1.2
        filter.frequency.setValueAtTime(from, at)
        filter.frequency.exponentialRampToValueAtTime(Math.max(60, to), at + dur)
        const vol = audio.createGain()
        vol.gain.setValueAtTime(gain, at)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        src.connect(filter).connect(vol).connect(audio.destination)
        src.start(at)
    })

    return {
        /*
         * O PLACAR É ISTO.
         *
         * Cada programa tocando acrescenta a camada dele. Um sozinho soa
         * magro; três juntos viram música — e é assim que a criança ouve se a
         * orquestra está cheia, sem medidor nenhum na tela.
         */
        beat: (index, layers) => {
            if (!layers.length) {
                noise(0.03, 2600, 1800, 0.022)
                return
            }
            const ch = CHORDS[index % CHORDS.length]

            if (layers.includes('beat')) {
                tone(74, 0.18, 'sine', 0.12, 0)
                tone(74, 0.14, 'sine', 0.09, STEP * 2)
                noise(0.04, 6200, 3400, 0.035, STEP)
                noise(0.05, 6200, 3400, 0.045, STEP * 3)
            }
            if (layers.includes('bass')) {
                tone(ch.root, 0.5, 'sine', 0.11, 0)
                tone(ch.fifth, 0.32, 'sine', 0.07, STEP * 2)
            }
            if (layers.includes('melody')) {
                ch.mel.forEach((f, i) => {
                    tone(f, 0.26, 'triangle', 0.08, i * STEP)
                    tone(f * 2, 0.1, 'sine', 0.018, i * STEP)
                })
            }
            if (layers.includes('pad')) {
                ch.pad.forEach(f => tone(f, STEP * 4.2, 'triangle', 0.03))
            }
        },

        pick: () => tone(700, 0.09, 'triangle', 0.09),

        land: () => {
            tone(523, 0.12, 'triangle', 0.1)
            tone(784, 0.16, 'triangle', 0.08, 0.07)
        },

        ret: () => {
            tone(392, 0.12, 'sine', 0.08)
            tone(262, 0.18, 'sine', 0.07, 0.08)
        },

        finish: () => {
            [523, 659, 784].forEach((f, i) => tone(f, 0.22, 'triangle', 0.11, i * 0.08))
        },

        chord: () => {
            // arpeja e sustenta: o acorde final é o único momento em que a
            // música sai do dedo da criança, e precisa soar como um fim
            [262, 330, 392, 523].forEach((f, i) => tone(f, 0.3, 'triangle', 0.09, i * 0.075))
            ;[262, 330, 392, 523, 659].forEach(f => tone(f, 1.8, 'triangle', 0.062, 0.3))
            tone(131, 2, 'sine', 0.1, 0.3)
            noise(0.6, 7000, 900, 0.05, 0.28)
        },

        fanfare: () => {
            [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'triangle', 0.12, i * 0.1))
        },

        setMuted: on => {
            muted = on
        },

        destroy: () => {
            void ctx?.close()
            ctx = undefined
        },
    }
}
