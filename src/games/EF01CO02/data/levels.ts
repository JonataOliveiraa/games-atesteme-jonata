import { LevelConfig } from "../types";

export const LEVELS: LevelConfig[] = [
    {
        id: 1,
        name: "Modelo STG - Cyandog",
        timeLimit: 40,
        layoutMode: "stg",
        steps: [
            { id: 1, label: "Cabeça (Mira)", assetKey: "robot_stg_head" },
            { id: 2, label: "Tronco (Rifle)", assetKey: "robot_stg_torso" },
            { id: 3, label: "Pernas (Tanque)", assetKey: "robot_stg_legs" }
        ]
    },
    {
        id: 2,
        name: "Montagem Básica",
        timeLimit: 30,
        layoutMode: "regular",
        steps: [
         ]
    },
    {
        id: 3,
        name: "Modelo MetaBee 2",
        timeLimit: 50,
        layoutMode: "compact",
        steps: [
            { id: 1, label: "Cabeça", assetKey: "robot_metabee2_head" },
            { id: 2, label: "Braço Esquerdo", assetKey: "robot_metabee2_arm_l" },
            { id: 3, label: "Braço Direito", assetKey: "robot_metabee2_arm_r" },
            { id: 4, label: "Abdômen", assetKey: "robot_metabee2_abdomen" },
            { id: 5, label: "Cintura", assetKey: "robot_metabee2_waist" },
            { id: 6, label: "Perna Direita", assetKey: "robot_metabee2_leg_r" }
        ]
    }
];
