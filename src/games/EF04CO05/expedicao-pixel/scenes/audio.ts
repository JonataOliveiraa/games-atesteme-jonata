import Phaser from 'phaser'
import type { Step } from '../types'

/**
 * Tudo em WebAudio, sem arquivo.
 *
 * Os tons CARREGAM informação: a torneira soa mais aguda quanto mais aberta,
 * então a criança ouve o valor que acabou de escolher. E o erro não tem alarme —
 * é um "ohhh" curto de multidão, porque o fogo errado continua sendo um fogo.
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
        at?: number
    }) {
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
        source.stop(t0 + o.dur + 0.02)
    }

    return {
        setMuted(value: boolean) {
            muted = value
        },

        /** O tom sobe com o valor: a quantidade escolhida é audível. */
        tap(value: Step) {
            const base = 246
            note({ freq: base * Math.pow(1.33, value), dur: 0.15, type: 'triangle', gain: 0.055 })
            if (value > 0) note({ freq: base * Math.pow(1.33, value) * 2, dur: 0.09, gain: 0.02, at: 0.02 })
        },

        /** O assobio do foguete subindo. */
        whistle() {
            note({ freq: 420, to: 1500, dur: 0.72, type: 'sine', gain: 0.035 })
        },

        burst() {
            noise({ dur: 0.7, freq: 320, q: 0.5, gain: 0.09 })
            noise({ dur: 0.4, freq: 1600, q: 0.7, gain: 0.03, at: 0.02 })
        },

        /** A multidão vibrando: ruído largo e curto, sem palavra nenhuma. */
        crowd() {
            noise({ dur: 0.9, freq: 700, q: 0.25, gain: 0.05, at: 0.1 })
            ;[523, 659, 784].forEach((freq, i) =>
                note({ freq, dur: 0.24, type: 'triangle', gain: 0.045, at: 0.12 + i * 0.1 }),
            )
        },

        /** O "ohhh" do fogo que não bateu. Grave, curto, sem alarme. */
        sigh() {
            noise({ dur: 0.75, freq: 300, q: 0.3, gain: 0.04, at: 0.06 })
            note({ freq: 320, to: 196, dur: 0.6, type: 'sine', gain: 0.035, at: 0.06 })
        },

        win() {
            ;[523, 659, 784, 1047].forEach((freq, i) =>
                note({ freq, dur: 0.3, type: 'triangle', gain: 0.055, at: i * 0.11 }),
            )
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
