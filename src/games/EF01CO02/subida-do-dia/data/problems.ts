import type { Art, ProblemDef, ProblemId } from '../types'

export const PROBLEMS: Record<ProblemId, ProblemDef> = {
    wash: {
        id: 'wash',
        sheet: 'problemas-1',
        frames: {
            'wash-dirty': 0,
            'wash-tap': 1,
            'wash-soapy': 2,
            'wash-rinsed': 3,
            'wash-dry': 4,
            'wash-fail-towel': 5,
            'wash-fail-nowater': 6,
            'wash-fail-smear': 7,
        },
    },
    bean: {
        id: 'bean',
        sheet: 'problemas-1',
        frames: {
            'bean-fail-buried': 8,
            'bean-empty': 10,
            'bean-soil': 11,
            'bean-hole': 12,
            'bean-seed': 13,
            'bean-watered': 14,
            'bean-sprout': 15,
            'bean-fail-dry': 16,
            'bean-fail-nothing': 17,
            'bean-fail-washed': 18,
            'bean-fail-pool': 19,
        },
    },
    grandma: {
        id: 'grandma',
        sheet: 'problemas-3',
        frames: {
            'grandma-home': 0,
            'grandma-gate': 1,
            'grandma-bridge': 2,
            'grandma-door': 3,
            'grandma-fail-splash': 4,
            'grandma-fail-gate': 5,
        },
    },
    paint: {
        id: 'paint',
        sheet: 'problemas-4',
        frames: {
            'paint-table': 0,
            'paint-paper': 1,
            'paint-open': 2,
            'paint-dipped': 3,
            'paint-done': 4,
            'paint-fail-lid': 5,
            'paint-fail-dry': 6,
            'paint-fail-blob': 7,
        },
    },
    sandwich: {
        id: 'sandwich',
        sheet: 'problemas-4',
        frames: {
            'sandwich-plate': 10,
            'sandwich-plate-open': 11,
            'sandwich-slice': 12,
            'sandwich-slice-open': 13,
            'sandwich-spread': 14,
            'sandwich-done': 15,
            'sandwich-fail-outside': 16,
            'sandwich-fail-empty': 17,
            'sandwich-fail-lid': 18,
            'sandwich-fail-toomuch': 19,
        },
    },
}

export const hasFrame = (problem: ProblemId, id: string): boolean => id in PROBLEMS[problem].frames

export function frameArt(problem: ProblemId, id: string): Art {
    const def = PROBLEMS[problem]
    return { id, key: def.sheet, frame: def.frames[id] ?? 0 }
}
