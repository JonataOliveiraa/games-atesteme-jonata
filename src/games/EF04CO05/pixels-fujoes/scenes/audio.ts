type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

/** sons de 8 bits, feitos na hora (WebAudio), combinando com a pixel art */
export interface Audio {
    zoom(inward: boolean): void
    escape(i: number): void
    lock(): void
    /** o número também é som: quanto maior, mais agudo */
    fire(value: string): void
    fizz(): void
    crack(): void
    dodge(): void
    convert(): void
    read(): void
    good(): void
    scan(row: number): void
    cheer(): void
    blom(): void
    /** o cronômetro entrou no fim: um tique-taque curto, uma vez só */
    hurry(): void
    fail(): void
    lose(): void
    win(): void
    setMuted(on: boolean): void
    destroy(): void
}

interface ToneOpts {
    wave?: Wave
    gain?: number
    delay?: number
    to?: number
}

const MASTER = 0.5

export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false

    const get = () => {
        if (muted) return undefined
        if (!ctx) {
            const Ctor =
                window.AudioContext ??
                (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return undefined
            ctx = new Ctor()
            bus = ctx.createGain()
            bus.gain.value = MASTER
            bus.connect(ctx.destination)
        }
        if (ctx.state === 'suspended') void ctx.resume()
        return ctx
    }

    const tone = (freq: number, ms: number, o: ToneOpts = {}) => {
        const audio = get()
        if (!audio || !bus) return
        const t0 = audio.currentTime + (o.delay ?? 0) / 1000
        const t1 = t0 + ms / 1000
        const osc = audio.createOscillator()
        const gain = audio.createGain()
        osc.type = o.wave ?? 'square'
        osc.frequency.setValueAtTime(freq, t0)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t1)
        const peak = o.gain ?? 0.12
        gain.gain.setValueAtTime(0.0001, t0)
        gain.gain.linearRampToValueAtTime(peak, t0 + 0.006)
        gain.gain.exponentialRampToValueAtTime(0.0001, t1)
        osc.connect(gain)
        gain.connect(bus)
        osc.start(t0)
        osc.stop(t1 + 0.02)
    }

    const notes = (freqs: number[], step: number, o: ToneOpts = {}) =>
        freqs.forEach((f, i) => tone(f, step * 1.4, { ...o, delay: (o.delay ?? 0) + i * step }))

    return {
        zoom(inward) {
            tone(inward ? 180 : 720, 900, { wave: 'triangle', to: inward ? 720 : 180, gain: 0.08 })
        },
        escape(i) {
            tone(300 + i * 60, 160, { wave: 'square', to: 900 + i * 80, gain: 0.07 })
        },
        lock() {
            tone(1400, 30, { wave: 'square', gain: 0.04 })
        },
        fire(value) {
            const top = 900 + Number(value) * 300
            tone(top, 150, { wave: 'square', to: top * 0.35, gain: 0.09 })
        },
        crack() {
            tone(1800, 60, { wave: 'square', gain: 0.07 })
            tone(900, 140, { wave: 'sawtooth', to: 300, gain: 0.06, delay: 40 })
        },
        dodge() {
            tone(300, 160, { wave: 'triangle', to: 1200, gain: 0.06 })
        },
        fizz() {
            tone(500, 90, { wave: 'sawtooth', to: 200, gain: 0.04 })
        },
        convert() {
            notes([1047, 1568], 50, { wave: 'square', gain: 0.07 })
        },
        read() {
            tone(660, 60, { wave: 'triangle', gain: 0.1 })
        },
        good() {
            notes([784, 1047, 1319], 60, { wave: 'square', gain: 0.07 })
        },
        scan(row) {
            tone(400 + row * 70, 50, { wave: 'triangle', gain: 0.06 })
        },
        cheer() {
            notes([523, 659, 784, 1047], 90, { wave: 'square', gain: 0.07 })
        },
        blom() {
            tone(220, 360, { wave: 'triangle', to: 110, gain: 0.16 })
        },
        hurry() {
            notes([880, 660, 880, 660], 120, { wave: 'triangle', gain: 0.06 })
        },
        fail() {
            notes([392, 330, 262], 140, { wave: 'triangle', gain: 0.12 })
        },
        lose() {
            tone(196, 420, { wave: 'triangle', to: 98, gain: 0.1 })
        },
        win() {
            notes([523, 659, 784, 1047, 1319], 110, { wave: 'square', gain: 0.07 })
        },
        setMuted(on) {
            muted = on
        },
        destroy() {
            void ctx?.close()
            ctx = undefined
        },
    }
}
