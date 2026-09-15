import Phaser from 'phaser'
import type { Move } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  TUDO SINTETIZADO, NADA DE ARQUIVO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O §0 do TEXTURAS.md não pede MP3 nenhum, e o §11 do planejamento diz por
 * quê: a música aqui é ACOMPANHAMENTO, não critério de acerto. Nada toca em
 * ritmo crescente, nada encurta janela de toque, e cada som tem um equivalente
 * visual — quem joga no mudo não perde informação.
 *
 * Os três movimentos têm timbres distintos, e essa é a única coisa que o som
 * precisa ensinar: que PASSO, PALMA e GIRO são coisas diferentes.
 */
export function createAudio(scene: Phaser.Scene) {
    let muted = false

    const ctx = (): AudioContext | null => {
        if (muted) return null
        try {
            return (scene.sound as Phaser.Sound.WebAudioSoundManager).context ?? null
        } catch {
            return null
        }
    }

    function note(o: { freq: number; dur: number; type?: OscillatorType; gain?: number; to?: number; at?: number }) {
        const audio = ctx()
        if (!audio) return
        const t0 = audio.currentTime + (o.at ?? 0)
        const osc = audio.createOscillator()
        const amp = audio.createGain()
        osc.type = o.type ?? 'sine'
        osc.frequency.setValueAtTime(o.freq, t0)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), t0 + o.dur)
        amp.gain.setValueAtTime(0.0001, t0)
        amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.06, t0 + 0.012)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
        osc.connect(amp)
        amp.connect(audio.destination)
        osc.start(t0)
        osc.stop(t0 + o.dur + 0.05)
    }

    function noise(o: { dur: number; freq: number; q?: number; gain?: number; at?: number }) {
        const audio = ctx()
        if (!audio) return
        const t0 = audio.currentTime + (o.at ?? 0)
        const frames = Math.max(1, Math.floor(audio.sampleRate * o.dur))
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
        const source = audio.createBufferSource()
        source.buffer = buffer
        const band = audio.createBiquadFilter()
        band.type = 'bandpass'
        band.Q.value = o.q ?? 1.1
        band.frequency.value = o.freq
        const amp = audio.createGain()
        amp.gain.setValueAtTime(o.gain ?? 0.05, t0)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
        source.connect(band)
        band.connect(amp)
        amp.connect(audio.destination)
        source.start(t0)
        source.stop(t0 + o.dur)
    }

    return {
        setMuted(value: boolean) {
            muted = value
        },

        /** Tocar num espaço da ficha. */
        tap() {
            note({ freq: 620, dur: 0.055, type: 'triangle', gain: 0.04 })
        },

        /** O cartão encaixando no espaço. */
        snap() {
            note({ freq: 480, to: 760, dur: 0.11, type: 'triangle', gain: 0.05 })
        },

        /** Os dois pulsos de contagem antes de o ensaio começar. */
        countIn() {
            note({ freq: 392, dur: 0.16, type: 'sine', gain: 0.05, at: 0 })
            note({ freq: 392, dur: 0.16, type: 'sine', gain: 0.05, at: 0.26 })
        },

        /** Três timbres curtos e distintos, um por movimento. */
        beat(move: Move) {
            if (move === 'step') note({ freq: 300, to: 220, dur: 0.12, type: 'sine', gain: 0.06 })
            else if (move === 'clap') noise({ dur: 0.1, freq: 2100, q: 0.7, gain: 0.07 })
            else note({ freq: 520, to: 940, dur: 0.2, type: 'triangle', gain: 0.05 })
        },

        /** O laço de dentro fechando uma volta: nota ascendente discreta. */
        innerClose() {
            note({ freq: 700, to: 880, dur: 0.1, type: 'sine', gain: 0.035 })
        },

        /** O refrão fechado: acorde curto. */
        roundClose() {
            ;[523, 659].forEach((freq, i) => note({ freq, dur: 0.16, type: 'triangle', gain: 0.045, at: i * 0.05 }))
        },

        /**
         * A luz apagando: um clique que DESCE.
         *
         * Todos os outros fechamentos deste jogo sobem — o laço de dentro, o
         * refrão, a fase. O sinal do nível 3 é a única coisa que termina algo
         * sem ser mérito de ninguém, e descer é o que o separa de um acerto.
         */
        lampOff() {
            note({ freq: 620, to: 210, dur: 0.22, type: 'triangle', gain: 0.055 })
            noise({ dur: 0.07, freq: 900, q: 1.4, gain: 0.03 })
        },

        /** O erro: som neutro, sem susto, sem alarme. */
        stall() {
            note({ freq: 300, to: 210, dur: 0.2, type: 'sine', gain: 0.045 })
        },

        /** Fase concluída. */
        phase() {
            ;[523, 659, 784, 988].forEach((freq, i) =>
                note({ freq, dur: 0.2, type: 'triangle', gain: 0.055, at: i * 0.09 }),
            )
        },

        fanfare() {
            ;[523, 659, 784, 1047].forEach((freq, i) =>
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.09, at: i * 0.11 }),
            )
            for (let i = 0; i < 16; i++) {
                noise({
                    dur: 0.1,
                    freq: 1400 + Math.random() * 1200,
                    q: 0.6,
                    gain: 0.022,
                    at: 0.4 + Math.random() * 1.2,
                })
            }
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
