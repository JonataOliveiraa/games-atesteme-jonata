import Phaser from 'phaser'
import { TRACK } from '../data/art'
import type { SoundId } from '../types'

type Stoppable = { stop: (when?: number) => void }

export function createAudio(scene: Phaser.Scene) {
    let muted = false
    let live: Stoppable[] = []

    const ctx = (): AudioContext | null => {
        if (muted) return null
        try {
            return (scene.sound as Phaser.Sound.WebAudioSoundManager).context ?? null
        } catch {
            return null
        }
    }

    const keep = (node: Stoppable) => {
        live.push(node)
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
        keep(osc)
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
        band.Q.value = o.q ?? 1.2
        band.frequency.value = o.freq
        const amp = audio.createGain()
        amp.gain.setValueAtTime(o.gain ?? 0.05, t0)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
        source.connect(band)
        band.connect(amp)
        amp.connect(audio.destination)
        source.start(t0)
        source.stop(t0 + o.dur)
        keep(source)
    }

    const hit = (id: SoundId, at: number) => {
        if (id === 'bells') {
            note({ freq: 1319, dur: 0.5, type: 'sine', gain: 0.05, at })
            note({ freq: 1976, dur: 0.34, type: 'sine', gain: 0.022, at })
        }
        if (id === 'shaker') noise({ dur: 0.09, freq: 6200, q: 0.9, gain: 0.045, at })
        if (id === 'drum') {
            note({ freq: 165, to: 58, dur: 0.22, type: 'sine', gain: 0.12, at })
            noise({ dur: 0.05, freq: 320, gain: 0.03, at })
        }
        if (id === 'claps') noise({ dur: 0.13, freq: 1500, q: 0.7, gain: 0.07, at })
    }

    const schedule = (id: SoundId, seconds: number) => {
        const { period, beats } = TRACK[id]
        for (let bar = 0; bar * period < seconds; bar++) {
            beats.forEach(beat => {
                const at = bar * period + beat
                if (at < seconds) hit(id, at)
            })
        }
    }

    const stop = () => {
        live.forEach(node => {
            try {
                node.stop()
            } catch {
                // já parou sozinho
            }
        })
        live = []
    }

    return {
        setMuted(value: boolean) {
            muted = value
            if (value) stop()
        },

        stop,

        preview(id: SoundId) {
            stop()
            schedule(id, 0.8)
        },

        play(id: SoundId, seconds: number) {
            stop()
            schedule(id, seconds)
        },

        tap() {
            note({ freq: 620, dur: 0.06, type: 'triangle', gain: 0.045 })
        },

        pick() {
            note({ freq: 480, dur: 0.07, type: 'triangle', gain: 0.05 })
            note({ freq: 760, dur: 0.09, type: 'sine', gain: 0.04, at: 0.06 })
        },

        whoosh() {
            noise({ dur: 0.26, freq: 900, q: 0.6, gain: 0.045 })
        },

        paper() {
            noise({ dur: 0.14, freq: 2600, q: 1.6, gain: 0.05 })
        },

        store() {
            note({ freq: 700, to: 1100, dur: 0.16, type: 'triangle', gain: 0.05 })
        },

        wrong() {
            note({ freq: 320, to: 170, dur: 0.3, type: 'square', gain: 0.045 })
        },

        applause(seconds = 1.6) {
            for (let i = 0; i < 26; i++) {
                noise({ dur: 0.11, freq: 1200 + Math.random() * 1400, q: 0.6, gain: 0.03, at: Math.random() * seconds })
            }
        },

        fanfare() {
            ;[523, 659, 784, 1047].forEach((freq, i) =>
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.09, at: i * 0.11 }),
            )
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
