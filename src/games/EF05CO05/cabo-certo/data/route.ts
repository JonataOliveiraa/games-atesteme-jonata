import type { DeviceDef, DeviceId, Kind, Owner, Payload, SocketDef } from '../types'

/**
 * A rede de cabos, sem desenho: quem está em qual tomada, quem tem energia e
 * por onde a informação passa. Uma tomada pode ser do computador ou de um
 * aparelho (o monitor leva o cabo do alto-falante).
 */

export interface SocketInfo extends SocketDef {
    owner: Owner
}

export interface Hop {
    /** A tomada por onde a informação passa. */
    socket: string
    /** O aparelho cujo cabo está naquela tomada. */
    device: DeviceId
}

export interface Route {
    payload: Payload
    /** Da fonte até o computador: cada cabo que a informação sobe. */
    up: Hop[]
    /** Para cada destino, do computador até ele: cada cabo que ela desce. */
    down: { to: DeviceId; hops: Hop[] }[]
}

export class Net {
    readonly sockets = new Map<string, SocketInfo>()
    private plugs = new Map<DeviceId, string | null>()
    private readonly devices: DeviceDef[]

    constructor(pc: SocketDef[], devices: DeviceDef[]) {
        this.devices = devices
        pc.forEach(s => this.sockets.set(s.id, { ...s, owner: 'pc' }))
        devices.forEach(d => {
            this.plugs.set(d.id, null)
            d.sockets?.forEach(s => this.sockets.set(s.id, { ...s, owner: d.id }))
        })
    }

    socketOf(device: DeviceId): string | null {
        return this.plugs.get(device) ?? null
    }

    occupant(socket: string): DeviceId | null {
        for (const [device, at] of this.plugs) if (at === socket) return device
        return null
    }

    plug(device: DeviceId, socket: string) {
        this.plugs.set(device, socket)
    }

    unplug(device: DeviceId) {
        this.plugs.set(device, null)
    }

    /** Ligado até o computador, cabo por cabo. */
    powered(device: DeviceId, seen = new Set<DeviceId>()): boolean {
        const at = this.socketOf(device)
        if (!at || seen.has(device)) return false
        seen.add(device)
        const owner = this.sockets.get(at)?.owner
        if (!owner) return false
        if (owner === 'pc') return true
        return this.powered(owner, seen)
    }

    /** A tomada aceita esta família, e o dono dela tem energia. */
    open(socket: string): boolean {
        const info = this.sockets.get(socket)
        if (!info) return false
        return info.owner === 'pc' || this.powered(info.owner)
    }

    fits(device: DeviceDef, socket: string): boolean {
        return this.sockets.get(socket)?.kind === device.kind
    }

    kindOf(socket: string): Kind | undefined {
        return this.sockets.get(socket)?.kind
    }

    /** Os cabos do aparelho até o computador, na ordem em que a informação sobe. */
    chain(device: DeviceId): Hop[] {
        const hops: Hop[] = []
        let current: Owner = device
        const seen = new Set<Owner>()
        while (current !== 'pc' && !seen.has(current)) {
            seen.add(current)
            const at = this.socketOf(current)
            if (!at) return []
            hops.push({ socket: at, device: current })
            current = this.sockets.get(at)?.owner ?? 'pc'
        }
        return hops
    }

    /** Para onde vai o que este aparelho manda. `null` se ele não tem energia. */
    route(source: DeviceId): Route | null {
        const def = this.devices.find(d => d.id === source)
        if (!def?.sends || !this.powered(source)) return null
        const payload = def.sends
        const down = this.devices
            .filter(d => d.id !== source && d.takes?.includes(payload) && this.powered(d.id))
            .map(d => ({ to: d.id, hops: this.chain(d.id).reverse() }))
        return { payload, up: this.chain(source), down }
    }
}
