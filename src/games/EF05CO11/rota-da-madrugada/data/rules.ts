import type { DeviceDef, DeviceId, ProblemDef, Verdict } from '../types'
import { DEVICES } from './devices'

function warn(problem: ProblemDef, device: DeviceDef): Verdict {
    if (device.reach === 'perto') {
        if (problem.crowd || problem.far) return 'none'
        return problem.quiet ? 'over' : 'fit'
    }
    if (device.reach === 'celular') return problem.audience === 'bicho' || problem.crowd ? 'none' : 'fit'
    if (device.reach === 'todos') return problem.crowd ? 'fit' : 'over'
    if (device.reach === 'radio') return problem.radio ? 'fit' : 'none'
    return 'fit'
}

export function verdict(problem: ProblemDef, id: DeviceId): Verdict {
    const device = DEVICES[id]
    if (device.effect !== problem.need) return 'none'
    if (device.online && problem.offline) return 'none'
    if (problem.need === 'caminho') return device.paper && problem.newRoad ? 'none' : 'fit'
    if (problem.need === 'avisar') return warn(problem, device)
    return 'fit'
}

export function fitting(problem: ProblemDef, free: DeviceId[]): DeviceId[] {
    return free.filter(id => verdict(problem, id) === 'fit')
}
