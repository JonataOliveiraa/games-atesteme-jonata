import type { RepeatLevel } from "../types"

export const LEVELS: RepeatLevel[] = [
    {
        level: 1,
        title: "Aquecimento",
        objective: "Leve o robô até o palco passando pela pegada.",
        timeLimit: 90,
        phases: [
            {
                goal: "Siga em frente até o palco.",
                gridSize: { cols: 5, rows: 4 },
                start: { x: 0, y: 3 }, direction: "right",
                target: { x: 4, y: 3 },
                checkpoint: { x: 2, y: 3 },
                obstacles: [],
                minBlocks: 4, maxBlocks: 6,
            },
            {
                goal: "Vá até o fim e depois suba.",
                gridSize: { cols: 5, rows: 4 },
                start: { x: 0, y: 3 }, direction: "right",
                target: { x: 4, y: 0 },
                checkpoint: { x: 4, y: 3 },
                obstacles: [{ x: 1, y: 1 }, { x: 3, y: 1 }],
                minBlocks: 7, maxBlocks: 10,
            },
            {
                goal: "Desça primeiro, depois atravesse.",
                gridSize: { cols: 5, rows: 4 },
                start: { x: 0, y: 0 }, direction: "down",
                target: { x: 4, y: 3 },
                checkpoint: { x: 0, y: 3 },
                obstacles: [{ x: 2, y: 0 }, { x: 2, y: 1 }],
                minBlocks: 7, maxBlocks: 10,
            },
        ],
    },
    {
        level: 2,
        title: "Desvios",
        objective: "Os cones bloqueiam o caminho reto. Contorne.",
        timeLimit: 110,
        phases: [
            {
                goal: "Suba para desviar dos cones.",
                gridSize: { cols: 6, rows: 5 },
                start: { x: 0, y: 4 }, direction: "up",
                target: { x: 5, y: 4 },
                checkpoint: { x: 2, y: 2 },
                obstacles: [{ x: 2, y: 4 }, { x: 3, y: 4 }, { x: 1, y: 1 }],
                minBlocks: 9, maxBlocks: 13,
            },
            {
                goal: "Contorne pelo topo e desça no fim.",
                gridSize: { cols: 6, rows: 5 },
                start: { x: 0, y: 0 }, direction: "right",
                target: { x: 5, y: 4 },
                checkpoint: { x: 5, y: 0 },
                obstacles: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 3 }],
                minBlocks: 9, maxBlocks: 13,
            },
            {
                goal: "O meio está fechado. Passe por cima.",
                gridSize: { cols: 6, rows: 5 },
                start: { x: 0, y: 2 }, direction: "up",
                target: { x: 5, y: 2 },
                checkpoint: { x: 3, y: 0 },
                obstacles: [
                    { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 2 },
                ],
                minBlocks: 9, maxBlocks: 13,
            },
        ],
    },
    {
        level: 3,
        title: "Desfile Completo",
        objective: "Caminhos longos. Use o menor número de comandos.",
        timeLimit: 140,
        phases: [
            {
                goal: "Suba, atravesse, suba de novo.",
                gridSize: { cols: 7, rows: 5 },
                start: { x: 0, y: 4 }, direction: "up",
                target: { x: 6, y: 0 },
                checkpoint: { x: 3, y: 2 },
                obstacles: [
                    { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 4, y: 2 }, { x: 2, y: 1 },
                ],
                minBlocks: 10, maxBlocks: 14,
            },
            {
                goal: "Volte pela pista e suba na ponta.",
                gridSize: { cols: 7, rows: 5 },
                start: { x: 6, y: 4 }, direction: "left",
                target: { x: 0, y: 0 },
                checkpoint: { x: 3, y: 4 },
                obstacles: [
                    { x: 5, y: 2 }, { x: 4, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 },
                ],
                minBlocks: 10, maxBlocks: 14,
            },
            {
                goal: "Desça tudo e siga até o palco.",
                gridSize: { cols: 7, rows: 5 },
                start: { x: 0, y: 0 }, direction: "down",
                target: { x: 6, y: 4 },
                checkpoint: { x: 0, y: 4 },
                obstacles: [
                    { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 1 },
                    { x: 4, y: 2 }, { x: 5, y: 1 },
                ],
                minBlocks: 10, maxBlocks: 14,
            },
        ],
    },
]