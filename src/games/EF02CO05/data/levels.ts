import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    useMap: true,
    title: 'Tecnologias do dia a dia',
    objective: 'Toque em cada local do mapa e escolha a tecnologia certa.',
    tip: 'Pense em qual tecnologia resolve melhor a situação.',
    locations: [
      { id: 'house',  label: 'Casa',    textureKey: 'location-house',  x: 260, y: 250, situationId: 's-house' },
      { id: 'school', label: 'Escola',  textureKey: 'location-school', x: 640, y: 190, situationId: 's-school' },
      { id: 'street', label: 'Rua',     textureKey: 'location-street', x: 450, y: 440, situationId: 's-street' },
      { id: 'store',  label: 'Banco',   textureKey: 'location-store',  x: 980, y: 260, situationId: 's-store' },
    ],
    situations: [
      {
        id: 's-house',
        prompt: 'Sua família quer ver um filme juntos na sala. Qual tecnologia usar?',
        options: ['tv', 'radio', 'smartphone'],
        correctId: 'tv',
        justification: 'A TV tem tela grande, perfeita para assistir filmes em família na sala.',
      },
      {
        id: 's-school',
        prompt: 'A professora quer mostrar um vídeo educativo para toda a turma. Qual tecnologia usar?',
        options: ['computer', 'tablet', 'radio'],
        correctId: 'computer',
        justification: 'O computador pode ser conectado a um projetor para toda a turma ver o vídeo.',
      },
      {
        id: 's-street',
        prompt: 'Você está perdido e precisa saber o caminho até em casa. Qual tecnologia usar?',
        options: ['gps', 'radio', 'camera'],
        correctId: 'gps',
        justification: 'O GPS mostra o mapa e o caminho certo até o destino.',
      },
      {
        id: 's-store',
        prompt: 'Você precisa sacar dinheiro do banco sem precisar entrar na agência. Qual tecnologia usar?',
        options: ['atm', 'camera', 'tv'],
        correctId: 'atm',
        justification: 'O caixa eletrônico (ATM) fica na entrada dos bancos e permite sacar dinheiro a qualquer hora.',
      },
    ],
  },
  {
    level: 2,
    useMap: true,
    title: 'Tecnologias parecidas',
    objective: 'Compare as opções com cuidado antes de escolher.',
    tip: 'Algumas tecnologias parecem servir, mas só uma é a ideal!',
    locations: [
      { id: 'house1', label: 'Escola',  textureKey: 'location-school', x: 200, y: 250, situationId: 's-house1' },
      { id: 'house2', label: 'Casa',    textureKey: 'location-house',  x: 360, y: 320, situationId: 's-house2' },
      { id: 'school', label: 'Escola 2',textureKey: 'location-school', x: 640, y: 190, situationId: 's-school' },
      { id: 'park',   label: 'Parque',  textureKey: 'location-park',   x: 820, y: 420, situationId: 's-park' },
      { id: 'store',  label: 'Loja',    textureKey: 'location-store',  x: 980, y: 260, situationId: 's-store' },
      { id: 'street', label: 'Rua',     textureKey: 'location-street', x: 480, y: 480, situationId: 's-street' },
    ],
    situations: [
      {
        id: 's-house1',
        // Situação reescrita: remover smartphone das opções para não gerar empate
        prompt: 'O clube de fotografia da escola quer registrar os trabalhos dos alunos para uma exposição. Qual tecnologia usar?',
        options: ['camera', 'radio', 'gps', 'tv'],
        correctId: 'camera',
        justification: 'A câmera fotográfica produz imagens com muito mais qualidade, ideal para uma exposição.',
      },
      {
        id: 's-house2',
        prompt: 'Você quer fazer uma videochamada com a vovó que mora longe. Qual tecnologia usar?',
        options: ['tablet', 'radio', 'atm', 'tv'],
        correctId: 'tablet',
        justification: 'O tablet tem câmera frontal e internet, perfeito para chamadas de vídeo.',
      },
      {
        id: 's-school',
        prompt: 'A escola quer guardar a lista de presença dos alunos digitalmente. Qual tecnologia usar?',
        options: ['computer', 'radio', 'camera', 'gps'],
        correctId: 'computer',
        justification: 'O computador permite criar e organizar planilhas e listas digitalmente.',
      },
      {
        id: 's-park',
        // Situação reescrita: prompt pede localização + tempo real → exclui rádio como resposta válida
        prompt: 'Você quer saber agora mesmo, onde quer que esteja, se vai chover no seu bairro nas próximas horas. Qual tecnologia usar?',
        options: ['smartphone', 'atm', 'camera', 'gps'],
        correctId: 'smartphone',
        justification: 'O smartphone tem aplicativos de previsão do tempo que você acessa em qualquer lugar.',
      },
      {
        id: 's-store',
        prompt: 'Você está sem dinheiro e precisa sacar para pagar uma compra. Qual tecnologia usar?',
        options: ['atm', 'gps', 'tablet', 'tv'],
        correctId: 'atm',
        justification: 'O caixa eletrônico (ATM) permite sacar dinheiro a qualquer hora.',
      },
      {
        id: 's-street',
        prompt: 'Você quer ouvir notícias enquanto caminha, sem precisar olhar uma tela. Qual tecnologia usar?',
        options: ['radio', 'tv', 'computer', 'atm'],
        correctId: 'radio',
        justification: 'O rádio transmite notícias por áudio, sem precisar de tela.',
      },
    ],
  },
  {
    level: 3,
    useMap: false,
    perSituationTimer: 30,
    title: 'Decisão rápida',
    objective: 'Escolha a tecnologia certa antes que o tempo acabe.',
    tip: 'Você tem 30 segundos por situação — pense rápido!',
    situations: [
      {
        id: 'r1',
        prompt: 'Você quer registrar um momento especial em uma festa com a melhor qualidade de imagem. Qual tecnologia usar?',
        options: ['camera', 'radio', 'atm', 'gps'],
        correctId: 'camera',
        justification: 'A câmera fotográfica captura imagens com muito mais resolução e qualidade.',
      },
      {
        id: 'r2',
        prompt: 'Você precisa encontrar o caminho mais rápido até uma loja nova que nunca visitou. Qual tecnologia usar?',
        options: ['gps', 'radio', 'tv', 'atm'],
        correctId: 'gps',
        justification: 'O GPS calcula a rota mais rápida e mostra o caminho passo a passo.',
      },
      {
        // r3 reescrito: retirado o "rádio do carro" que tornava a resposta trivial
        id: 'r3',
        prompt: 'Você está viajando de carro e quer ouvir notícias sem tirar os olhos da estrada. Qual tecnologia usar?',
        options: ['radio', 'computer', 'camera', 'atm'],
        correctId: 'radio',
        justification: 'O rádio transmite áudio sem precisar de tela, perfeito para ouvir enquanto dirige.',
      },
      {
        id: 'r4',
        prompt: 'Sua turma vai apresentar slides para a escola toda. Qual tecnologia usar?',
        options: ['computer', 'tablet', 'radio', 'atm'],
        correctId: 'computer',
        justification: 'O computador pode exibir apresentações de slides em um projetor para toda a escola.',
      },
      {
        // r5 reescrito: "pagar conta sem ir ao banco" era ambíguo; reescrito para saque → ATM inequívoco
        id: 'r5',
        prompt: 'Você precisa sacar dinheiro com urgência e não quer esperar fila dentro do banco. Qual tecnologia usar?',
        options: ['atm', 'gps', 'camera', 'tv'],
        correctId: 'atm',
        justification: 'O caixa eletrônico (ATM) permite sacar dinheiro a qualquer hora sem entrar na agência.',
      },
      {
        id: 'r6',
        prompt: 'Você está em casa e quer assistir ao jogo de futebol com a família. Qual tecnologia usar?',
        options: ['tv', 'tablet', 'radio', 'gps'],
        correctId: 'tv',
        justification: 'A TV tem tela grande, ótima para assistir jogos em família.',
      },
      {
        // r7 reescrito: "saber se vai chover" podia ser TV; novo prompt favorece acesso móvel → smartphone inequívoco
        id: 'r7',
        prompt: 'Você está na rua e quer verificar agora mesmo se vai chover no seu bairro nas próximas 2 horas. Qual tecnologia usar?',
        options: ['smartphone', 'tv', 'atm', 'camera'],
        correctId: 'smartphone',
        justification: 'O smartphone tem aplicativos de previsão do tempo que funcionam em qualquer lugar.',
      },
      {
        id: 'r8',
        prompt: 'Você quer fazer uma videochamada rápida com um amigo que mudou de cidade. Qual tecnologia usar?',
        options: ['tablet', 'radio', 'gps', 'atm'],
        correctId: 'tablet',
        justification: 'O tablet tem câmera frontal e internet, perfeito para chamadas de vídeo.',
      },
    ],
  },
]
