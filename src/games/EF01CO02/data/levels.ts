import { LevelConfig } from "../types";

export const LEVELS: LevelConfig[] = [
    {
        id: 1,
        name: "Montagem Básica",
        timeLimit: 30,
        steps: [
            { id: 1, label: "Cabeça ", assetKey: "robot_kbt_head" },
            { id: 2, label: "Tronco ", assetKey: "robot_kbt_torso" },
            { id: 3, label: "Pernas ", assetKey: "robot_kbt_legs" }
        ]
    },
    {
        id: 2,
        name: "Modelo KWG - Rokusho",
        timeLimit: 50, // Tempo aumentado devido à expansão de peças
        steps: [
            { id: 1, label: "Cabeça (Sensor)", assetKey: "robot_kwg_head" },
            { id: 2, label: "Ombro Esquerdo", assetKey: "robot_kwg_shoulder_l" },
            { id: 3, label: "Ombro Direito", assetKey: "robot_kwg_shoulder_r" },
            { id: 4, label: "Tronco (Blindagem)", assetKey: "robot_kwg_torso" },
            { id: 5, label: "Espada (Chanfrada)", assetKey: "robot_kwg_sword" },
            { id: 6, label: "Pernas (Agilidade)", assetKey: "robot_kwg_legs" }
        ]
    },
    {
        id: 3,
        name: "Modelo STG - Cyandog",
        timeLimit: 40,
        steps: [
            { id: 1, label: "Cabeça (Mira)", assetKey: "robot_stg_head" },
            { id: 2, label: "Tronco (Rifle)", assetKey: "robot_stg_torso" },
            { id: 3, label: "Pernas (Tanque)", assetKey: "robot_stg_legs" }
        ]
    }
];