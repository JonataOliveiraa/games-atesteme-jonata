import { C } from './theme'
import type { Command, CommandDef, MachineDef, MachineId, MissionStep } from '../types'

/** A ordem dos quadros é a ordem dos frames em `icones-comandos.png`. */
export const COMMANDS: Record<Command, CommandDef> = {
    sweep: { id: 'sweep', frame: 0, label: 'VARRER', color: C.cmdSweep },
    turn: { id: 'turn', frame: 1, label: 'GIRAR', color: C.cmdTurn },
    fly: { id: 'fly', frame: 2, label: 'VOAR', color: C.cmdFly },
    drop: { id: 'drop', frame: 3, label: 'SOLTAR', color: C.cmdDrop },
    bake: { id: 'bake', frame: 4, label: 'ASSAR', color: C.cmdBake },
    beep: { id: 'beep', frame: 5, label: 'APITAR', color: C.cmdBeep },
}

/**
 * `commands` está na ordem em que a máquina executa. A plaquinha da esquerda é
 * o primeiro comando a acender.
 */
export const MACHINES: Record<MachineId, MachineDef> = {
    sweeper: {
        id: 'sweeper',
        name: 'Robô-Vassoura',
        frame: 0,
        actionFrame: 3,
        commands: ['turn', 'sweep'],
        color: C.sweeper,
        dark: C.sweeperDark,
    },
    drone: {
        id: 'drone',
        name: 'Drone',
        frame: 1,
        actionFrame: 4,
        commands: ['fly', 'drop'],
        color: C.drone,
        dark: C.droneDark,
    },
    oven: {
        id: 'oven',
        name: 'Forninho',
        frame: 2,
        actionFrame: 5,
        commands: ['bake', 'beep'],
        color: C.oven,
        dark: C.ovenDark,
    },
}

export const MACHINE_ORDER: MachineId[] = ['sweeper', 'drone', 'oven']

export function canRunStep(machine: MachineDef, step: MissionStep) {
    return step.requiredCommands.every(command => machine.commands.includes(command))
}
