import type {
  ActionBlock,
  ActionId,
  ActionOption,
  AlgorithmBlock,
  ConditionBlock,
  ConditionId,
  RepeatBlock,
} from '../types'

export function actionBlock(
  id: string,
  label: string,
  action: ActionId,
  hint?: string,
): ActionBlock {
  return { id, kind: 'acao', label, action, hint }
}

export function repeatBlock(
  id: string,
  times: number,
  blocks: AlgorithmBlock[],
  label = `Repita ${times}x`,
): RepeatBlock {
  return { id, kind: 'repetir', label, times, blocks }
}

export function conditionBlock(
  id: string,
  label: string,
  condition: ConditionId,
  ifTrue: AlgorithmBlock[],
  ifFalse: AlgorithmBlock[] = [],
): ConditionBlock {
  return {
    id,
    kind: 'condicao',
    label,
    condition,
    ifTrue: { label: 'SIM', blocks: ifTrue },
    ifFalse: { label: 'NAO', blocks: ifFalse },
  }
}

const option = (id: string, block: AlgorithmBlock): ActionOption => ({ id, block })

export const BLOCK_OPTIONS = {
  pegarEscova: option('pegar-escova', actionBlock('pegar-escova', 'Pegar escova', 'pegar')),
  pegarPasta: option('pegar-pasta', actionBlock('pegar-pasta', 'Pegar pasta', 'pegar')),
  passarPasta: option('passar-pasta', actionBlock('passar-pasta', 'Passar pasta', 'encaixar')),
  escovar: option('escovar', actionBlock('escovar', 'Escovar dentes', 'misturar')),
  guardarEscova: option('guardar-escova', actionBlock('guardar-escova', 'Guardar escova', 'guardar')),

  pegarMochila: option('pegar-mochila', actionBlock('pegar-mochila', 'Pegar mochila', 'pegar')),
  pegarCaderno: option('pegar-caderno', actionBlock('pegar-caderno', 'Pegar caderno', 'pegar')),
  guardarCaderno: option('guardar-caderno', actionBlock('guardar-caderno', 'Guardar caderno', 'guardar')),
  guardarLanche: option('guardar-lanche', actionBlock('guardar-lanche', 'Guardar lanche', 'guardar')),
  fecharMochila: option('fechar-mochila', actionBlock('fechar-mochila', 'Fechar mochila', 'finalizar')),

  pegarPao: option('pegar-pao', actionBlock('pegar-pao', 'Pegar pao', 'pegar')),
  colocarRecheio: option('colocar-recheio', actionBlock('colocar-recheio', 'Colocar recheio', 'encaixar')),
  fecharLanche: option('fechar-lanche', actionBlock('fechar-lanche', 'Fechar lanche', 'finalizar')),
  guardarLancheira: option('guardar-lancheira', actionBlock('guardar-lancheira', 'Guardar na lancheira', 'guardar')),

  andar: option('andar', actionBlock('andar', 'Andar', 'andar')),
  virarEsquerda: option('virar-esquerda', actionBlock('virar-esquerda', 'Virar esquerda', 'virar-esquerda')),
  virarDireita: option('virar-direita', actionBlock('virar-direita', 'Virar direita', 'virar-direita')),
  desviar: option('desviar', actionBlock('desviar', 'Desviar', 'desviar')),

  pegarBloco: option('pegar-bloco', actionBlock('pegar-bloco', 'Pegar bloco', 'pegar')),
  encaixarBloco: option('encaixar-bloco', actionBlock('encaixar-bloco', 'Encaixar bloco', 'encaixar')),
  dobrarPeca: option('dobrar-peca', actionBlock('dobrar-peca', 'Dobrar peca', 'dobrar')),

  pegarRegador: option('pegar-regador', actionBlock('pegar-regador', 'Pegar regador', 'pegar')),
  regarPlanta: option('regar-planta', actionBlock('regar-planta', 'Regar planta', 'regar')),
  proximaPlanta: option('proxima-planta', actionBlock('proxima-planta', 'Ir para a proxima', 'andar')),

  pegarBrinquedo: option('pegar-brinquedo', actionBlock('pegar-brinquedo', 'Pegar brinquedo', 'pegar')),
  observarCor: option('observar-cor', actionBlock('observar-cor', 'Observar cor', 'observar')),
  guardarNaCaixa: option('guardar-na-caixa', actionBlock('guardar-na-caixa', 'Guardar na caixa', 'guardar')),

  observarCaminho: option('observar-caminho', actionBlock('observar-caminho', 'Observar caminho', 'observar')),
  esperar: option('esperar', actionBlock('esperar', 'Esperar', 'esperar')),
  avisarGrupo: option('avisar-grupo', actionBlock('avisar-grupo', 'Avisar o grupo', 'avisar')),
  finalizar: option('finalizar', actionBlock('finalizar', 'Finalizar', 'finalizar')),
} as const

export type BlockOptionId = keyof typeof BLOCK_OPTIONS

