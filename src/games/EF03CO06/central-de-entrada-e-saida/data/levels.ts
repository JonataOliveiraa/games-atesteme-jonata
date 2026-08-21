import type { Device, DeviceId, InfoId, InfoPiece, LevelConfig } from '../types'

export const DEVICE_INFO: Record<DeviceId, InfoId> = {
  teclado: 'texto',
  mouse: 'texto',
  microfone: 'voz',
  camera: 'foto',
  monitor: 'tela',
  'alto-falante': 'som',
  impressora: 'impresso',
}

export const DEVICES: Record<DeviceId, Device> = {
  teclado: { id: 'teclado', label: 'Teclado', kind: 'input', textureKey: 'dev-teclado', action: 'leva as letras para dentro' },
  mouse: { id: 'mouse', label: 'Mouse', kind: 'input', textureKey: 'dev-mouse', action: 'leva o clique para dentro' },
  microfone: { id: 'microfone', label: 'Microfone', kind: 'input', textureKey: 'dev-microfone', action: 'leva a voz para dentro' },
  camera: { id: 'camera', label: 'Câmera', kind: 'input', textureKey: 'dev-camera', action: 'leva a imagem para dentro' },
  monitor: { id: 'monitor', label: 'Monitor', kind: 'output', textureKey: 'dev-monitor', action: 'mostra o que sai do computador' },
  'alto-falante': { id: 'alto-falante', label: 'Alto-falante', kind: 'output', textureKey: 'dev-alto-falante', action: 'toca o som que sai do computador' },
  impressora: { id: 'impressora', label: 'Impressora', kind: 'output', textureKey: 'dev-impressora', action: 'imprime o que sai do computador' },
}

export const INFOS: Record<InfoId, InfoPiece> = {
  voz: { id: 'voz', label: 'Voz', textureKey: 'ic-voz' },
  som: { id: 'som', label: 'Som', textureKey: 'ic-som' },
  foto: { id: 'foto', label: 'Foto', textureKey: 'ic-foto' },
  tela: { id: 'tela', label: 'Imagem na tela', textureKey: 'ic-tela' },
  texto: { id: 'texto', label: 'Texto', textureKey: 'ic-texto' },
  impresso: { id: 'impresso', label: 'Papel impresso', textureKey: 'ic-impresso' },
}

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Entra ou sai?',
    helper: 'Toque na porta certa.',
    opening: [
      'Oi! Eu sou o Vico, da central.',
      'Aqui a informação entra no computador e depois sai dele.',
      'Olhe o aparelho e toque na porta certa.',
    ],
    successMessage: 'Você separou todos os aparelhos!',
    /*
     * A ordem alterna entrada e saída de propósito, e é por isso que ela
     * mudou quando a câmera saiu: sem o remanejo, `alto-falante` e `monitor`
     * ficavam colados e a criança acertava dois seguidos por inércia, sem
     * olhar o aparelho.
     */
    sortRounds: [
      { deviceId: 'microfone', successLine: 'Isso! O microfone leva a sua voz para dentro.', wrongLine: 'Por ali a informação sai. O microfone leva a voz para dentro.' },
      { deviceId: 'alto-falante', successLine: 'Isso! O som sai do computador e você ouve.', wrongLine: 'Por ali a informação entra. O alto-falante deixa o som sair.' },
      { deviceId: 'teclado', successLine: 'Isso! As letras entram no computador.', wrongLine: 'Por ali a informação sai. O teclado leva as letras para dentro.' },
      { deviceId: 'monitor', successLine: 'Isso! O monitor mostra o que sai do computador.', wrongLine: 'Por ali a informação entra. O monitor mostra o que sai.' },
      { deviceId: 'mouse', successLine: 'Isso! O clique entra no computador.', wrongLine: 'Por ali a informação sai. O mouse leva o clique para dentro.' },
      { deviceId: 'impressora', successLine: 'Isso! O papel sai do computador.', wrongLine: 'Por ali a informação entra. A impressora deixa o papel sair.' },
    ],
  },

  {
    level: 2,
    title: 'Qual aparelho faz isso?',
    helper: 'Toque no aparelho do pedido.',
    opening: [
      'Chegaram pedidos na central.',
      'Cada pedido precisa de um aparelho.',
      'Toque no que faz o trabalho.',
    ],
    successMessage: 'Todos os pedidos foram atendidos!',
    pickRounds: [
      {
        taskId: 'p1', taskLabel: 'Gravar a voz da professora', taskInfoId: 'voz',
        answerId: 'microfone', options: ['microfone', 'monitor', 'impressora', 'mouse'],
        successLine: 'O microfone pega a voz e leva para dentro.',
      },
      {
        taskId: 'p2', taskLabel: 'Ouvir uma música na sala', taskInfoId: 'som',
        answerId: 'alto-falante', options: ['teclado', 'alto-falante', 'camera', 'monitor'],
        successLine: 'O som sai pelo alto-falante.',
      },
      {
        taskId: 'p3', taskLabel: 'Tirar uma foto da turma', taskInfoId: 'foto',
        answerId: 'camera', options: ['impressora', 'camera', 'alto-falante', 'teclado'],
        successLine: 'A câmera pega a foto e leva para dentro.',
      },
      {
        taskId: 'p4', taskLabel: 'Escrever um bilhete', taskInfoId: 'texto',
        answerId: 'teclado', options: ['monitor', 'microfone', 'teclado', 'impressora'],
        successLine: 'O teclado leva as letras para dentro.',
      },
      {
        taskId: 'p5', taskLabel: 'Ver o desenho na tela', taskInfoId: 'tela',
        answerId: 'monitor', options: ['camera', 'monitor', 'mouse', 'microfone'],
        successLine: 'O monitor mostra o que sai do computador.',
      },
      {
        taskId: 'p6', taskLabel: 'Levar o desenho no papel', taskInfoId: 'impresso',
        answerId: 'impressora', options: ['impressora', 'teclado', 'monitor', 'camera'],
        successLine: 'A impressora deixa o papel sair.',
      },
    ],
  },

  {
    level: 3,
    title: 'Monte o caminho',
    /*
     * Sem linha de apoio.
     *
     * "Uma entrada, o computador, uma saída" é exatamente o que os dois
     * encaixes rotulados e as setas entre eles já mostram, e o Vico repete a
     * mesma ideia na abertura. O `drawBoard` pula o cabeçalho quando a string
     * está vazia.
     */
    helper: '',
    opening: [
      'Agora vem o caminho completo.',
      'A informação entra, o computador trabalha e ela sai mudada.',
      'Escolha um aparelho de cada lado e ligue a central.',
    ],
    successMessage: 'A central está funcionando inteira!',
    /*
     * Sem a câmera e sem a impressora sobram cinco aparelhos: teclado, mouse e
     * microfone de um lado; monitor e alto-falante do outro.
     *
     * Isso apagou duas das três cadeias antigas — a câmera ERA a resposta de
     * uma e a impressora a de outra, então não bastava tirá-las da lista de
     * opções. As três de agora nascem das combinações que sobraram, e cada uma
     * mostra uma transformação diferente: voz->som, texto->tela e texto->som.
     * As duas últimas dividem a mesma entrada de propósito: é o teclado que
     * muda de destino, e a criança precisa ler o pedido para saber qual.
     */
    chainRounds: [
      {
        id: 'c1', taskLabel: 'A voz da professora vira som na sala',
        inputId: 'microfone', outputId: 'alto-falante',
        inInfoId: 'voz', outInfoId: 'som',
        options: ['microfone', 'teclado', 'alto-falante', 'monitor'],
        successLine: 'A voz entrou e saiu como som!',
      },
      {
        id: 'c2', taskLabel: 'O bilhete aparece na tela',
        inputId: 'teclado', outputId: 'monitor',
        inInfoId: 'texto', outInfoId: 'tela',
        options: ['teclado', 'microfone', 'monitor', 'alto-falante'],
        successLine: 'O texto entrou e apareceu na tela!',
      },
      {
        id: 'c3', taskLabel: 'O computador lê o bilhete em voz alta',
        inputId: 'teclado', outputId: 'alto-falante',
        inInfoId: 'texto', outInfoId: 'som',
        options: ['teclado', 'mouse', 'alto-falante', 'monitor'],
        successLine: 'O mesmo texto entrou, e desta vez saiu como som!',
      },
    ],
  },
]