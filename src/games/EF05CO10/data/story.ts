import type { CharacterDef, CharId, SceneryDef, SceneryId, ThemeDef, ThemeId, CriterionId } from '../types'

export const CRITERIA: Array<{ id: CriterionId; name: string; question: string }> = [
  { id: 'clareza', name: 'Clareza', question: 'Dá para saber qual tecnologia está em cena?' },
  { id: 'mudanca', name: 'Mudança', question: 'A história mostra o que mudou no jeito de fazer?' },
  { id: 'reflexao', name: 'Reflexão', question: 'A história fala de um ganho e também de um cuidado?' },
]

export const MOMENT_LABEL = {
  antes: 'ANTES',
  depois: 'DEPOIS',
  consequencia: 'O QUE MUDOU',
}

export const CHARACTERS: Record<CharId, CharacterDef> = {
  crianca: { id: 'crianca', texture: 'personagem-crianca', label: 'Criança', voice: 'Nina' },
  adulto: { id: 'adulto', texture: 'personagem-adulto', label: 'Adulto', voice: 'Beto' },
  idoso: { id: 'idoso', texture: 'personagem-idoso', label: 'Pessoa idosa', voice: 'Dona Zia' },
  robo: { id: 'robo', texture: 'personagem-robo', label: 'Robô', voice: 'Pip' },
}

export const SCENERIES: Record<SceneryId, SceneryDef> = {
  casa: { id: 'casa', texture: 'cenario-casa', label: 'Em casa' },
  escola: { id: 'escola', texture: 'cenario-escola', label: 'Na escola' },
  trabalho: { id: 'trabalho', texture: 'cenario-trabalho', label: 'No trabalho' },
  rua: { id: 'rua', texture: 'cenario-rua-cidade', label: 'Na rua' },
}

export const THEMES: Record<ThemeId, ThemeDef> = {
  audio: {
    id: 'audio',
    label: 'Áudio no lugar da ligação',
    tech: 'celular',
    techLabel: 'Celular',
    headline: 'Antes se ligava. Agora se manda áudio.',
    lines: {
      depois: [
        {
          id: 'audio-d1',
          chip: 'Mando áudio',
          text: 'Antes eu ligava. Agora eu mando um áudio quando dá.',
          score: { clareza: 2, mudanca: 2, reflexao: 0 },
          why: 'A fala diz a tecnologia e mostra o que mudou no jeito de falar com alguém.',
        },
        {
          id: 'audio-d2',
          chip: 'Áudio, mas demora',
          text: 'Mando áudio e ele espera. É prático, mas a resposta pode demorar.',
          score: { clareza: 2, mudanca: 2, reflexao: 2 },
          why: 'Mostra a mudança e ainda aponta um limite dela. É uma opinião completa.',
        },
        {
          id: 'audio-d3',
          chip: 'Adoro meu celular',
          text: 'Eu adoro o meu celular!',
          score: { clareza: 1, mudanca: 0, reflexao: 0 },
          why: 'Aparece a tecnologia, mas não dá para saber o que mudou no cotidiano.',
        },
      ],
    },
  },
  gps: {
    id: 'gps',
    label: 'Mapa do celular na rua',
    tech: 'gps',
    techLabel: 'Mapa e localização',
    headline: 'Antes se perguntava o caminho. Agora se olha o mapa.',
    lines: {
      depois: [
        {
          id: 'gps-d1',
          chip: 'Sigo o mapa',
          text: 'Antes eu perguntava o caminho. Agora eu sigo o mapa do celular.',
          score: { clareza: 2, mudanca: 2, reflexao: 0 },
          why: 'Fica claro qual tecnologia entrou e o que ela substituiu.',
        },
        {
          id: 'gps-d2',
          chip: 'Mapa e vizinhos',
          text: 'O mapa me guia rápido, mas eu já não converso com os vizinhos da rua.',
          score: { clareza: 2, mudanca: 2, reflexao: 2 },
          why: 'Mostra o ganho de tempo e também o que se perdeu junto.',
        },
        {
          id: 'gps-d3',
          chip: 'Estou na rua',
          text: 'Hoje eu saí para andar na rua.',
          score: { clareza: 0, mudanca: 0, reflexao: 0 },
          why: 'A fala não cita a tecnologia nem mostra mudança nenhuma.',
        },
      ],
    },
  },
  aulasOnline: {
    id: 'aulasOnline',
    label: 'Aula por videochamada',
    tech: 'videochamada',
    techLabel: 'Videochamada',
    headline: 'A aula também acontece pela tela.',
    lines: {
      depois: [
        {
          id: 'aula-d1',
          chip: 'Aula pela tela',
          text: 'Antes a aula era só na sala. Agora eu assisto pela videochamada.',
          score: { clareza: 2, mudanca: 2, reflexao: 0 },
          why: 'A tecnologia aparece e a mudança no jeito de estudar fica visível.',
        },
        {
          id: 'aula-d2',
          chip: 'Tela e internet',
          text: 'A aula na tela ajuda quem mora longe, mas quem não tem internet fica de fora.',
          score: { clareza: 2, mudanca: 2, reflexao: 2 },
          why: 'Fala de quem ganha e de quem fica de fora: é uma opinião crítica.',
        },
        {
          id: 'aula-d3',
          chip: 'Gosto de estudar',
          text: 'Eu gosto muito de estudar.',
          score: { clareza: 0, mudanca: 0, reflexao: 0 },
          why: 'Sem a tecnologia na fala, ninguém entende qual é a mudança.',
        },
      ],
    },
  },
  comprasApp: {
    id: 'comprasApp',
    label: 'Compras pelo aplicativo',
    tech: 'celular',
    techLabel: 'Aplicativo de entrega',
    headline: 'A feira que era na esquina agora chega na porta.',
    lines: {
      antes: [
        {
          id: 'compra-a1',
          chip: 'Ia à feira',
          text: 'Toda semana eu ia até a feira e voltava com as sacolas.',
          score: { clareza: 1, mudanca: 2, reflexao: 0 },
          why: 'Um bom quadro de antes: mostra como era feito sem a tecnologia.',
        },
        {
          id: 'compra-a2',
          chip: 'Lista no papel',
          text: 'Eu anotava a lista no papel e ia comprando de banca em banca.',
          score: { clareza: 1, mudanca: 2, reflexao: 0 },
          why: 'Mostra o jeito antigo com detalhe, e isso ajuda a comparar depois.',
        },
        {
          id: 'compra-a3',
          chip: 'Peço no app',
          text: 'Eu peço tudo pelo aplicativo.',
          score: { clareza: 2, mudanca: 0, reflexao: 0 },
          why: 'Essa fala é do depois. No quadro do antes, ela apaga a comparação.',
        },
      ],
      depois: [
        {
          id: 'compra-d1',
          chip: 'Peço pelo app',
          text: 'Agora eu escolho tudo pelo aplicativo e a entrega chega em casa.',
          score: { clareza: 2, mudanca: 2, reflexao: 0 },
          why: 'A tecnologia aparece e a diferença em relação ao quadro anterior fica clara.',
        },
        {
          id: 'compra-d2',
          chip: 'Chega na porta',
          text: 'O pedido sai do celular e chega na porta com um entregador.',
          score: { clareza: 2, mudanca: 2, reflexao: 1 },
          why: 'Além da mudança, lembra que existe alguém trabalhando na entrega.',
        },
        {
          id: 'compra-d3',
          chip: 'Continuo indo',
          text: 'Eu continuo indo à feira toda semana.',
          score: { clareza: 0, mudanca: 0, reflexao: 0 },
          why: 'Repete o quadro do antes, então a história não mostra transformação.',
        },
      ],
      consequencia: [
        {
          id: 'compra-c1',
          chip: 'Rápido, mas...',
          text: 'Ficou mais rápido, mas eu deixei de conhecer quem vende na minha rua.',
          score: { clareza: 1, mudanca: 2, reflexao: 2 },
          why: 'Aponta o ganho e o que se perdeu: é exatamente uma reflexão crítica.',
        },
        {
          id: 'compra-c2',
          chip: 'Nem todos têm',
          text: 'É prático para mim, mas nem todo mundo tem celular para pedir.',
          score: { clareza: 1, mudanca: 2, reflexao: 2 },
          why: 'Lembra de quem fica de fora da mudança. Isso é olhar a sociedade.',
        },
        {
          id: 'compra-c3',
          chip: 'Tudo perfeito',
          text: 'Agora está tudo perfeito, sem nenhum problema.',
          score: { clareza: 0, mudanca: 1, reflexao: 0 },
          why: 'Toda mudança tem dois lados. Sem cuidado nenhum, falta reflexão.',
        },
      ],
    },
  },
  roboFabrica: {
    id: 'roboFabrica',
    label: 'Robô ajudando no serviço',
    tech: 'ia',
    techLabel: 'Robô e automação',
    headline: 'A máquina assumiu a parte pesada do serviço.',
    lines: {
      antes: [
        {
          id: 'robo-a1',
          chip: 'Tudo na mão',
          text: 'A gente carregava e empilhava tudo na mão, o dia inteiro.',
          score: { clareza: 1, mudanca: 2, reflexao: 0 },
          why: 'Mostra bem como era o trabalho antes da máquina chegar.',
        },
        {
          id: 'robo-a2',
          chip: 'Equipe grande',
          text: 'Éramos muitos para dar conta da parte mais pesada.',
          score: { clareza: 1, mudanca: 2, reflexao: 1 },
          why: 'Mostra o antes e já prepara a discussão sobre as pessoas do lugar.',
        },
        {
          id: 'robo-a3',
          chip: 'Robô trabalha',
          text: 'O robô faz o trabalho pesado por nós.',
          score: { clareza: 2, mudanca: 0, reflexao: 0 },
          why: 'É a fala do depois. Aqui ela some com o quadro do antes.',
        },
      ],
      depois: [
        {
          id: 'robo-d1',
          chip: 'Robô assumiu',
          text: 'Agora o robô carrega o peso e eu opero o painel.',
          score: { clareza: 2, mudanca: 2, reflexao: 1 },
          why: 'A tecnologia aparece e mostra que o trabalho mudou de tipo, não sumiu.',
        },
        {
          id: 'robo-d2',
          chip: 'Aprendi a operar',
          text: 'Tive que aprender a programar a máquina para continuar no serviço.',
          score: { clareza: 2, mudanca: 2, reflexao: 2 },
          why: 'Mostra que a tecnologia também exige aprender coisas novas.',
        },
        {
          id: 'robo-d3',
          chip: 'Máquina bonita',
          text: 'A máquina nova é bem bonita.',
          score: { clareza: 1, mudanca: 0, reflexao: 0 },
          why: 'Descreve a máquina, mas não conta o que mudou no trabalho.',
        },
      ],
      consequencia: [
        {
          id: 'robo-c1',
          chip: 'Menos peso, novas funções',
          text: 'Ninguém mais machuca as costas, mas foi preciso aprender funções novas.',
          score: { clareza: 1, mudanca: 2, reflexao: 2 },
          why: 'Ganho e cuidado juntos: é assim que se fala de mudança no trabalho.',
        },
        {
          id: 'robo-c2',
          chip: 'Quem não aprendeu',
          text: 'O serviço ficou mais seguro, mas quem não teve curso ficou para trás.',
          score: { clareza: 1, mudanca: 2, reflexao: 2 },
          why: 'Lembra que a mudança não chega igual para todas as pessoas.',
        },
        {
          id: 'robo-c3',
          chip: 'Robô é melhor',
          text: 'O robô é melhor que as pessoas em tudo.',
          score: { clareza: 1, mudanca: 0, reflexao: 0 },
          why: 'Não é uma consequência social, e ignora o que as pessoas fazem ali.',
        },
      ],
    },
  },
  trabalhoRemoto: {
    id: 'trabalhoRemoto',
    label: 'Trabalhar de casa',
    tech: 'computador',
    techLabel: 'Computador e internet',
    headline: 'O escritório agora cabe dentro de casa.',
    lines: {
      antes: [
        {
          id: 'remoto-a1',
          chip: 'Duas horas de ônibus',
          text: 'Eu saía cedo e passava duas horas no ônibus para chegar ao escritório.',
          score: { clareza: 1, mudanca: 2, reflexao: 0 },
          why: 'Mostra com clareza como era a rotina antes da mudança.',
        },
        {
          id: 'remoto-a2',
          chip: 'Time na mesma sala',
          text: 'A equipe toda ficava na mesma sala, resolvendo tudo na hora.',
          score: { clareza: 1, mudanca: 2, reflexao: 1 },
          why: 'Guarda o que existia antes e que pode fazer falta depois.',
        },
        {
          id: 'remoto-a3',
          chip: 'Trabalho de casa',
          text: 'Eu trabalho de casa pelo computador.',
          score: { clareza: 2, mudanca: 0, reflexao: 0 },
          why: 'Essa é a cena do depois. No antes, ela quebra a comparação.',
        },
      ],
      depois: [
        {
          id: 'remoto-d1',
          chip: 'Reunião pela tela',
          text: 'Agora eu abro o computador em casa e a reunião acontece pela tela.',
          score: { clareza: 2, mudanca: 2, reflexao: 0 },
          why: 'A tecnologia aparece e a rotina de trabalho mudou de lugar.',
        },
        {
          id: 'remoto-d2',
          chip: 'Ganhei o tempo',
          text: 'O tempo do ônibus virou tempo com a minha família.',
          score: { clareza: 1, mudanca: 2, reflexao: 2 },
          why: 'Mostra a mudança social que a tecnologia trouxe para o dia dela.',
        },
        {
          id: 'remoto-d3',
          chip: 'Sinto falta do time',
          text: 'Trabalho de casa todo dia, mas sinto falta de conversar com a equipe.',
          score: { clareza: 2, mudanca: 2, reflexao: 2 },
          why: 'Traz o outro ponto de vista sobre a mesma mudança.',
        },
      ],
      consequencia: [
        {
          id: 'remoto-c1',
          chip: 'Casa e trabalho juntos',
          text: 'Ninguém mais perde tempo no trânsito, mas o trabalho invadiu o horário de casa.',
          score: { clareza: 1, mudanca: 2, reflexao: 2 },
          why: 'Uma consequência real: o que melhorou e o que passou a exigir cuidado.',
        },
        {
          id: 'remoto-c2',
          chip: 'Nem todo serviço',
          text: 'Funciona para quem usa computador, mas nem todo serviço pode ser feito de casa.',
          score: { clareza: 1, mudanca: 2, reflexao: 2 },
          why: 'Lembra que a mudança no trabalho não alcança todas as profissões.',
        },
        {
          id: 'remoto-c3',
          chip: 'É melhor assim',
          text: 'De casa é melhor, e pronto.',
          score: { clareza: 0, mudanca: 1, reflexao: 0 },
          why: 'É só uma preferência. Não mostra consequência para as pessoas.',
        },
      ],
    },
    messages: [
      {
        id: 'remoto-m1',
        chip: 'Só vantagem',
        text: 'A tecnologia resolveu tudo no trabalho.',
        score: { clareza: 1, mudanca: 1, reflexao: 0 },
        why: 'Fecha a história com um lado só. As duas personagens mostraram mais que isso.',
      },
      {
        id: 'remoto-m2',
        chip: 'Só problema',
        text: 'Trabalhar com tecnologia só atrapalha as pessoas.',
        score: { clareza: 1, mudanca: 1, reflexao: 0 },
        why: 'Também é um lado só. A história mostrou ganhos reais que ficaram de fora.',
      },
      {
        id: 'remoto-m3',
        chip: 'Ajuda e exige equilíbrio',
        text: 'A tecnologia ajuda, mas é preciso equilibrar convivência e bem-estar.',
        score: { clareza: 2, mudanca: 2, reflexao: 2 },
        why: 'Junta os dois pontos de vista da sua história em uma opinião própria.',
      },
      {
        id: 'remoto-m4',
        chip: 'Computador é rápido',
        text: 'O computador é uma máquina muito rápida.',
        score: { clareza: 1, mudanca: 0, reflexao: 0 },
        why: 'Fala da máquina, não do que ela mudou na vida de quem trabalha.',
      },
    ],
  },
}