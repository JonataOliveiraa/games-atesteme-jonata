import type { Attribute, Color, Shape, Size } from '../types' // Se precisar herdar tipos genéricos

// Representa uma ação individual em um passo
export interface StepAction {
  id: string;          // Ex: 'pegar-panela', 'ligar-fogao'
  description: string; // Ex: 'Pegue a panela'
  targetObjectId: string; // ID do objeto interativo no cenário (ex: 'pan')
  // Pode incluir outros critérios se necessário (ex: usar um item X em Y)
}

// Representa um único passo da sequência
export interface GameStep {
  stepNumber: number;
  action: StepAction;
  // Pode incluir dicas ou áudio específico
  hintKey?: string; // Chave para texto de dica
  audioKey?: string; // Chave para narração do passo
}

// Representa um objeto interativo no cenário
export interface InteractiveObject {
  id: string; // Ex: 'pan', 'fire'
  x: number;
  y: number;
  frame: string; // Frame do atlas ou chave da textura gerada
  state: 'initial' | 'active' | 'completed'; // Estado do objeto
  // Pode ter outras propriedades relevantes
}

// Representa uma missão (ex: Receita de ovo frito)
export interface MissionConfig {
  id: string; // Ex: 'mission-fry-egg'
  name: string; // Nome da missão
  description: string; // Descrição
  theme: 'cozinha' | 'origami' | 'tabuleiro'; // Cenário temático
  steps: GameStep[]; // Sequência de passos
  objects: InteractiveObject[]; // Objetos necessários no cenário
  timeLimit?: number; // Opcional, como no EF01CO01
  lives?: number;    // Opcional, como no EF01CO01
}

// Configuração do Nível (semelhante ao LevelConfig do outro jogo)
// Aqui, um "nível" pode corresponder a uma "missão"
export interface LevelConfig {
  level: number;
  mission: MissionConfig;
  // Outras configurações específicas do nível, se necessário
}
