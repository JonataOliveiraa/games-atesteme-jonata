import Phaser from 'phaser'
import type { Bit } from '../types'

/**
 * Tudo em WebAudio, sem arquivo.
 *
 * O `1` é agudo e o `0` é grave, do começo ao fim: carregar, converter e
 * remontar usam as MESMAS duas notas. É o que faz a remontagem do fim soar
 * como a mensagem que a criança acabou de mandar, e não como uma musiquinha
 * qualquer.
 */
const FREQ: Record<Bit, number> = { 1: 784, 0: 392 }

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
        osc.type = o.type ?? 'triangle'
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

    function noise(o: { dur: number; freq: number; q?: number; gain?: number }) {
        const audio = ctx()
        if (!audio) return
        const t0 = audio.currentTime
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

        /** O disparo: a nota do dígito que saiu. */
        fire(bit: Bit) {
            note({ freq: FREQ[bit], dur: 0.1, gain: 0.05 })
            noise({ dur: 0.1, freq: 1500, q: 0.8, gain: 0.035 })
        },

        /** O dígito acertou a caixa. Sobe um degrau a cada acerto seguido. */
        hit(value: Bit, streak: number) {
            const step = Math.min(streak, 6) * 16
            note({ freq: FREQ[value] + step, dur: 0.16, gain: 0.06 })
        },

        wrong() {
            note({ freq: 150, dur: 0.2, type: 'square', gain: 0.045, to: 110 })
        },

        row() {
            note({ freq: 523, dur: 0.18, gain: 0.05 })
            note({ freq: 784, dur: 0.22, gain: 0.05, at: 0.09 })
        },

        /** A figurinha saindo da máquina: papel raspando. */
        card() {
            noise({ dur: 0.34, freq: 900, q: 0.6, gain: 0.04 })
        },

        /** A figurinha entrando pela escotilha: um gole curto, de baixo para cima. */
        swallow() {
            note({ freq: 300, dur: 0.22, type: 'sine', gain: 0.06, to: 820 })
            noise({ dur: 0.18, freq: 600, q: 0.5, gain: 0.03 })
        },

        /** O arranque da nave. */
        blast() {
            noise({ dur: 0.7, freq: 420, q: 0.4, gain: 0.05 })
            note({ freq: 180, dur: 0.6, type: 'triangle', gain: 0.045, to: 640 })
        },

        fanfare() {
            const melody = [523, 659, 784, 1047]
            melody.forEach((freq, i) => note({ freq, dur: 0.32, gain: 0.06, at: i * 0.13 }))
        },

        destroy() {
            muted = true
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
