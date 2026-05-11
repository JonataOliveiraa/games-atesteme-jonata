import { LevelConfig } from "../types";

export const LEVELS: LevelConfig[] = [
    {
        id: 1,
        name: "Barco de Papel",
        timeLimit: 20,
        steps: [
            { id: 1, label: "Base", assetKey: "origami_base" },
            { id: 2, label: "Dobra Central", assetKey: "origami_center" },
            { id: 3, label: "Pontas", assetKey: "origami_tips" },
            { id: 4, label: "Finalização", assetKey: "origami_boat" }
        ]
    },
    {
        id: 2,
        name: "Avião de Papel",
        timeLimit: 30,
        steps: [
            { id: 1, label: "Folha Reta", assetKey: "plane_step_1" },
            { id: 2, label: "Triângulo", assetKey: "plane_step_2" },
            { id: 3, label: "Dobrar Meio", assetKey: "plane_step_3" },
            { id: 4, label: "Asa Esquerda", assetKey: "plane_step_4" },
            { id: 5, label: "Asa Direita", assetKey: "plane_step_5" },
            { id: 6, label: "Voo Pronto", assetKey: "plane_step_6" }
        ]
    },
    {
        id: 3,
        name: "Rosto de Cachorro",
        timeLimit: 40,
        steps: [
            { id: 1, label: "Papel Quadrado", assetKey: "dog_step_1" },
            { id: 2, label: "Dobrar Triângulo", assetKey: "dog_step_2" },
            { id: 3, label: "Orelha Direita", assetKey: "dog_step_3" },
            { id: 4, label: "Orelha Esquerda", assetKey: "dog_step_4" },
            { id: 5, label: "Dobrar Queixo", assetKey: "dog_step_5" },
            { id: 6, label: "Rosto Pronto", assetKey: "dog_step_6" }
        ]
    }
];