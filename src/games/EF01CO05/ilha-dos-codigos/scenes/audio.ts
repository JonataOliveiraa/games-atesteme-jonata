import Phaser from 'phaser'
import { ISLAND } from '../data/island'
import type { Word } from '../types'

/**
 * Sem arquivo: tudo WebAudio. O que separa um bip de um som de jogo é o
 * envelope e o filtro — ataque curto, queda exponencial, e ruído passa-banda
 * para o que é ar, água e madeira.
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

    function note(o: {
        freq: number
        dur: number
        type?: OscillatorType
        gain?: number
        to?: number
        delay?: number
        cutoff?: number
    }) {
        const audio = ctx()
        if (!audio) return

        const t0 = audio.currentTime + (o.delay ?? 0)
        const osc = audio.createOscillator()
        const amp = audio.createGain()

        osc.type = o.type ?? 'sine'
        osc.frequency.setValueAtTime(o.freq, t0)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), t0 + o.dur)

        amp.gain.setValueAtTime(0.0001, t0)
        amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.08, t0 + 0.012)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)

        osc.connect(amp)
        if (o.cutoff) {
            const low = audio.createBiquadFilter()
            low.type = 'lowpass'
            low.frequency.setValueAtTime(o.cutoff, t0)
            amp.connect(low)
            low.connect(audio.destination)
        } else {
            amp.connect(audio.destination)
        }

        osc.start(t0)
        osc.stop(t0 + o.dur + 0.03)
    }

    function noise(o: { dur: number; from: number; to: number; gain?: number; delay?: number; q?: number }) {
        const audio = ctx()
        if (!audio) return

        const t0 = audio.currentTime + (o.delay ?? 0)
        const frames = Math.max(1, Math.floor(audio.sampleRate * o.dur))
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)

        const source = audio.createBufferSource()
        source.buffer = buffer

        const band = audio.createBiquadFilter()
        band.type = 'bandpass'
        band.Q.value = o.q ?? 1.1
        band.frequency.setValueAtTime(o.from, t0)
        band.frequency.exponentialRampToValueAtTime(Math.max(80, o.to), t0 + o.dur)

        const amp = audio.createGain()
        amp.gain.setValueAtTime(o.gain ?? 0.05, t0)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)

        source.connect(band)
        band.connect(amp)
        amp.connect(audio.destination)
        source.start(t0)
        source.stop(t0 + o.dur)
    }

    /** Um timbre por símbolo: código que CONTA batidas não emenda mensagem. */
    const voices = {
        chocalho() {
            noise({ dur: 0.09, from: 6200, to: 4200, gain: 0.05, q: 2.2 })
            noise({ dur: 0.09, from: 5400, to: 3800, gain: 0.045, q: 2.2, delay: 0.07 })
            noise({ dur: 0.12, from: 5000, to: 3200, gain: 0.04, q: 2.2, delay: 0.14 })
        },
        agua() {
            noise({ dur: 0.3, from: 2300, to: 320, gain: 0.07, q: 0.9 })
            note({ freq: 520, to: 180, dur: 0.26, type: 'sine', gain: 0.05, cutoff: 900 })
        },
        tambor() {
            note({ freq: 172, to: 58, dur: 0.28, type: 'sine', gain: 0.14, cutoff: 600 })
            noise({ dur: 0.05, from: 1800, to: 600, gain: 0.03 })
        },
        madeira() {
            note({ freq: 940, to: 700, dur: 0.07, type: 'square', gain: 0.05, cutoff: 2600 })
            note({ freq: 780, to: 560, dur: 0.07, type: 'square', gain: 0.045, cutoff: 2400, delay: 0.11 })
        },
    }

    return {
        setMuted(value: boolean) {
            muted = value
        },

        say(word: Word) {
            voices[ISLAND[word].sound]()
        },

        tap() {
            note({ freq: 720, dur: 0.035, type: 'triangle', gain: 0.05 })
        },

        place() {
            note({ freq: 540, to: 760, dur: 0.09, type: 'triangle', gain: 0.06 })
        },

        remove() {
            note({ freq: 700, to: 420, dur: 0.1, type: 'triangle', gain: 0.05 })
        },

        keyTurn() {
            note({ freq: 200, to: 520, dur: 0.22, type: 'sawtooth', gain: 0.05, cutoff: 1400 })
        },

        check(step: number) {
            note({ freq: 620 + step * 110, dur: 0.07, type: 'triangle', gain: 0.06 })
        },

        open() {
            noise({ dur: 0.18, from: 900, to: 260, gain: 0.05 })
            ;[523, 659, 784].forEach((freq, i) => {
                note({ freq, dur: 0.2, type: 'triangle', gain: 0.075, delay: 0.06 + i * 0.08 })
            })
        },

        /** O brilho cresce com a sequência: o som sobe junto. */
        streak(count: number) {
            const base = 660 + Math.min(count, 4) * 90
            ;[base, base * 1.25, base * 1.5].forEach((freq, i) => {
                note({ freq, dur: 0.14, type: 'triangle', gain: 0.055, delay: i * 0.06 })
            })
        },

        wrong() {
            noise({ dur: 0.22, from: 1500, to: 320, gain: 0.045 })
            note({ freq: 190, to: 88, dur: 0.3, type: 'square', gain: 0.05, cutoff: 700 })
        },

        fanfare() {
            [523, 659, 784, 1047].forEach((freq, i) => {
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.1, delay: i * 0.11 })
            })
            note({ freq: 1047, dur: 0.9, type: 'sine', gain: 0.05, delay: 0.44 })
        },
    }
}
