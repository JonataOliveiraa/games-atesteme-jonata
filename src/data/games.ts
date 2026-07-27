import type { Game } from "../types/game";
import heroThumbnail from "../assets/hero.png";
import classificadoresThumbnail from "../assets/games/EF01CO01/cover-01.png";
import trilhaThumbnail from "../assets/games/EF01CO02/splash_art.png";
import algorithmsThumbnail from "../assets/games/EF01CO03/algorithm-game-cover.png";
import pixelSecretThumbnail from "../assets/games/EF01CO05/cover5.png";
import desktopThumbnail from "../assets/games/EF01CO06/cover.png";
import guardiansThumbnail from "../assets/games/EF01CO07/cover.png";
import hangarThumbnail from "../assets/games/EF02CO01/cover-hangar.png";
import robotParadeThumbnail from "../assets/games/EF02CO02/cover.png";
import machineFactoryThumbnail from "../assets/games/EF02CO03/cover.png";
import museumThumbnail from "../assets/games/EF02CO04/cover.png";
import cityThumbnail from "../assets/games/EF02CO05/cover.png";
import checklistThumbnail from "../assets/games/EF02CO06/cover.png";
import tribunalThumbnail from "../assets/games/EF03CO01/cover.png";
import mazeThumbnail from "../assets/games/EF03CO02/cover.png";
import chefThumbnail from "../assets/games/EF03CO03/cover.png";
import informationBuilderThumbnail from "../assets/games/EF03CO04/cover-montador-informacoes.png";
import correctFormatThumbnail from "../assets/games/EF03CO05/cover-formato-certo.png";
import inputOutputThumbnail from "../assets/games/EF03CO06/cover-central-entrada-saida.png";
import searchDetectivesThumbnail from "../assets/games/EF03CO07/cover-detetives-da-busca.png";
import multiFormatStudioThumbnail from "../assets/games/EF03CO08/cover-estudio-multiformato.png";
import investigationThumbnail from "../assets/games/EF03CO09/cover-investigacao-dados-risco.png";
import battleCoordsThumbnail from "../assets/games/EF04CO01/cover-batalha-coordenadas.png";
import archiveRecordsThumbnail from "../assets/games/EF04CO02/cover-arquivo-registros.png";
import buildingLoopsThumbnail from "../assets/games/EF04CO03/cover-predio-dos-lacos.png";
import machineTranslatorThumbnail from "../assets/games/EF04CO04/cover-tradutor-da-maquina.png";
import digitalAtelierThumbnail from "../assets/games/EF04CO05/cover-atelier-codigos-digitais.png";
import digitalStudioThumbnail from "../assets/games/EF04CO06/cover-estudio-producao-digital.png";
import ethicMissionThumbnail from "../assets/games/EF04CO07/cover-missao-etica-digital.png";
import sourceHuntThumbnail from "../assets/games/EF04CO08/cover-caca-fonte-confiavel.png";
import cardListThumbnail from "../assets/games/EF05CO01/cover-baralho-das-listas.png";
import correioThumbnail from "../assets/games/EF01CO04/cover-correio-multimidia.png";
import networkMapsThumbnail from "../assets/games/EF05CO02/cover-mapas-em-rede.png";
import coverLogicArena from "../assets/games/EF05CO03/cover-arena-da-logica.png";

const placeholderGame = (code: string, index: number): Game => ({
  id: index,
  title: code,
  description: "Jogo ainda não implementado nesta trilha.",
  category: "Em breve",
  points: 0,
  icon: "🎮",
  slug: code.toLowerCase(),
  thumbnail: heroThumbnail,
});

const gameByCode: Partial<Record<string, Omit<Game, "id">>> = {
  EF01CO01: {
    title: "Base dos Classificadores",
    description: "Arraste figuras e personagens para as bases certas, separando por cor, forma ou tamanho.",
    category: "Pensamento Computacional",
    points: 60,
    icon: "🗂️",
    slug: "base-dos-classificadores",
    thumbnail: classificadoresThumbnail,
  },
  EF01CO02: {
    title: "Trilha do Passo a Passo",
    description: "Teste seus conhecimentos com perguntas de diversas categorias.",
    category: "Pensamento Computacional",
    points: 50,
    icon: "👣",
    slug: "trilha-do-passo-a-passo",
    thumbnail: trilhaThumbnail,
  },
  EF01CO04: {
    title: "Correio Multimídia",
    description: "Envie mensagens por áudio, texto ou desenho e descubra que a informação continua a mesma, não importa o formato!",
    category: "Mundo Digital",
    points: 50,
    icon: "📬",
    slug: "correio-multimidia",
    thumbnail: correioThumbnail,
  },
  EF01CO03: {
    title: "Oficina dos Algoritmos",
    description: "Monte a ordem correta dos passos e teste o algoritmo para ver a sequência funcionando.",
    category: "Pensamento Computacional",
    points: 50,
    icon: "🛠️",
    slug: "oficina-dos-algoritmos",
    thumbnail: algorithmsThumbnail,
  },
  EF01CO05: {
    title: "Pixel Secreto",
    description: "Descubra imagens escondidas preenchendo grades com códigos de cor.",
    category: "Pensamento Computacional",
    points: 50,
    icon: "🎨",
    slug: "pixel-secreto",
    thumbnail: pixelSecretThumbnail,
  },
  EF01CO06: {
    title: "Desktop Digital Infantil",
    description: "Explore apps de um desktop infantil e complete missões usando câmera, calculadora, gravador e muito mais.",
    category: "Cultura Digital",
    points: 60,
    icon: "🖥️",
    slug: "desktop-digital-infantil",
    thumbnail: desktopThumbnail,
  },
  EF01CO07: {
    title: "Guardiões dos Dados",
    description: "Escolha atitudes seguras em situações com celular, tablet, computador, jogos e aplicativos.",
    category: "Pensamento Computacional",
    points: 50,
    icon: "🛡️",
    slug: "guardioes-dos-dados",
    thumbnail: guardiansThumbnail,
  },
  EF02CO01: {
    title: "Hangar dos Modelos",
    description: "Filtre, compare e agrupe meios de transporte por atributos como meio, motor e rodas.",
    category: "Pensamento Computacional",
    points: 55,
    icon: "✈️",
    slug: "hangar-dos-modelos",
    thumbnail: hangarThumbnail,
  },
  EF02CO02: {
    title: "Desfile do Robô Repetidor",
    description: "Monte um caminho com setas para guiar o robô até o palco.",
    category: "Pensamento Computacional",
    points: 55,
    icon: "🤖",
    slug: "desfile-do-robo-repetidor",
    thumbnail: robotParadeThumbnail,
  },
  EF02CO03: {
    title: "Fábrica de Máquinas",
    description: "Organize máquinas na ordem correta para completar a linha de produção.",
    category: "Mundo Digital",
    points: 60,
    icon: "🏭",
    slug: "fabrica-de-maquinas",
    thumbnail: machineFactoryThumbnail,
  },
  EF02CO04: {
    title: "Museu Vivo do Computador",
    description: "Explore peças de computador e descubra qual é hardware, qual é software e como elas funcionam juntas.",
    category: "Mundo Digital",
    points: 60,
    icon: "🏛️",
    slug: "museu-vivo-do-computador",
    thumbnail: museumThumbnail,
  },
  EF02CO05: {
    title: "Cidade das Tecnologias",
    description: "Explore o mapa da cidade e escolha a tecnologia certa para cada situação do dia a dia.",
    category: "Cultura Digital",
    points: 55,
    icon: "🏙️",
    slug: "cidade-das-tecnologias",
    thumbnail: cityThumbnail,
  },
  EF02CO06: {
    title: "Checklist do Jogador Seguro",
    description: "Configure as proteções do dispositivo e reaja a riscos antes de entrar no jogo online.",
    category: "Cultura Digital",
    points: 60,
    icon: "🛡️",
    slug: "checklist-do-jogador-seguro",
    thumbnail: checklistThumbnail,
  },
  EF03CO01: {
    title: "Tribunal do Verdadeiro ou Falso",
    description: "Julgue sentenças do dia a dia e fique atento à palavra NÃO antes de decidir.",
    category: "Pensamento Computacional",
    points: 55,
    icon: "⚖️",
    slug: "tribunal-do-verdadeiro-ou-falso",
    thumbnail: tribunalThumbnail,
  },
  EF03CO02: {
    title: "Labirinto do Enquanto",
    description: "Monte o laço enquanto, escolha a condição certa e preveja onde o robô vai parar.",
    category: "Pensamento Computacional",
    points: 60,
    icon: "🤖",
    slug: "labirinto-do-enquanto",
    thumbnail: mazeThumbnail,
  },
  EF03CO03: {
    title: "Chef dos Subproblemas",
    description: "Decomponha missões da cozinha em subtarefas e monte o plano certo na linha do tempo.",
    category: "Pensamento Computacional",
    points: 60,
    icon: "👨‍🍳",
    slug: "chef-dos-subproblemas",
    thumbnail: chefThumbnail,
  },
  EF03CO04: {
    title: "Montador de Informações",
    description: "Combine dados soltos em campos corretos para formar datas, endereços e imagens.",
    category: "Mundo Digital",
    points: 60,
    icon: "🧩",
    slug: "montador-de-informacoes",
    thumbnail: informationBuilderThumbnail,
  },
  EF03CO05: {
    title: "Formato Certo",
    description: "Escolha a estrutura certa para guardar datas, pixels e sequências de caracteres.",
    category: "Mundo Digital",
    points: 60,
    icon: "[]",
    slug: "formato-certo",
    thumbnail: correctFormatThumbnail,
  },
  EF03CO06: {
    title: "Central de Entrada e Saída",
    description: "Conecte dispositivos de entrada e saída para o computador se comunicar com o mundo.",
    category: "Mundo Digital",
    points: 60,
    icon: "🔌",
    slug: "central-de-entrada-e-saida",
    thumbnail: inputOutputThumbnail,
  },
  EF03CO07: {
    title: "Detetives da Busca",
    description: "Use palavras-chave, filtros e comparação de resultados em um navegador seguro.",
    category: "Cultura Digital",
    points: 60,
    icon: "🔍",
    slug: "detetives-da-busca",
    thumbnail: searchDetectivesThumbnail,
  },
  EF03CO08: {
    title: "Estúdio Multiformato",
    description: "Escolha a ferramenta digital certa e crie produções em diferentes formatos para o mural da turma.",
    category: "Cultura Digital",
    points: 60,
    icon: "🎨",
    slug: "estudio-multiformato",
    thumbnail: multiFormatStudioThumbnail,
  },
  EF03CO09: {
    title: "Investigação: Dados em Risco",
    description: "Identifique dados pessoais perigosos, descubra consequências do compartilhamento e investigue incidentes de privacidade online.",
    category: "Cultura Digital",
    points: 60,
    icon: "🔍",
    slug: "investigacao-dados-risco",
    thumbnail: investigationThumbnail,
  },
  EF04CO01: {
    title: "Batalha das Coordenadas",
    description: "Localize células em grades matriciais usando coordenadas (linha, coluna) e afunde navios escondidos no mapa.",
    category: "Pensamento Computacional",
    points: 65,
    icon: "🗺️",
    slug: "batalha-das-coordenadas",
    thumbnail: battleCoordsThumbnail,
  },
  EF04CO02: {
    title: "Arquivo dos Registros",
    description: "Leia fichas com campos nomeados, filtre registros por campo e responda perguntas sobre o conjunto de dados.",
    category: "Pensamento Computacional",
    points: 65,
    icon: "🗂️",
    slug: "arquivo-dos-registros",
    thumbnail: archiveRecordsThumbnail,
  },
  EF04CO03: {
    title: "Prédio dos Laços",
    description: "Configure laços simples e aninhados para guiar o limpador de janelas pelo prédio e limpar todos os andares.",
    category: "Pensamento Computacional",
    points: 65,
    icon: "🔁",
    slug: "predio-dos-lacos",
    thumbnail: buildingLoopsThumbnail,
  },
  EF04CO04: {
    title: "Tradutor da Máquina",
    description: "Traduza letras para código binário e vice-versa usando a tabela ASCII simplificada.",
    category: "Mundo Digital",
    points: 60,
    icon: "💻",
    slug: "tradutor-da-maquina",
    thumbnail: machineTranslatorThumbnail,
  },
  EF04CO05: {
    title: "Ateliê de Códigos Digitais",
    description: "Explore três oficinas: reproduza padrões binários, decodifique ASCII e misture cores RGB.",
    category: "Mundo Digital",
    points: 65,
    icon: "🎨",
    slug: "atelier-codigos-digitais",
    thumbnail: digitalAtelierThumbnail,
  },
  EF04CO06: {
    title: "Estúdio de Produção Digital",
    description: "Escolha o formato certo para cada missão, produza conteúdo em texto, slides ou vídeo e publique após revisão.",
    category: "Cultura Digital",
    points: 65,
    icon: "🎬",
    slug: "estudio-producao-digital",
    thumbnail: digitalStudioThumbnail,
  },
  EF04CO07: {
    title: "Missão Ética Digital",
    description: "Tome decisões éticas ao lidar com arquivos digitais alheios e mantenha sua reputação digital em alta.",
    category: "Cultura Digital",
    points: 65,
    icon: "⚖️",
    slug: "missao-etica-digital",
    thumbnail: ethicMissionThumbnail,
  },
  EF04CO08: {
    title: "Caça à Fonte Confiável",
    description: "Avalie critérios de confiabilidade em páginas simuladas, compare fontes e classifique as mais confiáveis.",
    category: "Cultura Digital",
    points: 65,
    icon: "🔍",
    slug: "caca-fonte-confiavel",
    thumbnail: sourceHuntThumbnail,
  },
  EF05CO01: {
    title: "Baralho das Listas",
    description: "Insira, remova, substitua e busque cartas mantendo a lista em ordem.",
    category: "Pensamento Computacional",
    points: 65,
    icon: "🃏",
    slug: "baralho-das-listas",
    thumbnail: cardListThumbnail,
  },
  EF05CO02: {
    title: "Mapas em Rede",
    "description": "Explore o mapa e trace caminhos entre dispositivos.",
    category: "Pensamento Computacional",
    points: 65,
    icon: "🗺️",
    slug: "mapas-em-rede",
    thumbnail: networkMapsThumbnail,
  },
  EF05CO03: {
    title: "Arena da Lógica",
    "description": "Resolva desafios de lógica com portões lógicos e circuitos digitais",
    category: "Pensamento Computacional",
    points: 65,
    icon: "🧠",
    slug: "arena-da-lógica",
    thumbnail: coverLogicArena,
  }
};

const gameOrder = [
  "EF01CO01",
  "EF01CO02",
  "EF01CO03",
  "EF01CO04",
  "EF01CO05",
  "EF01CO06",
  "EF01CO07",
  "EF02CO01",
  "EF02CO02",
  "EF02CO03",
  "EF02CO04",
  "EF02CO05",
  "EF02CO06",
  "EF03CO01",
  "EF03CO02",
  "EF03CO03",
  "EF03CO04",
  "EF03CO05",
  "EF03CO06",
  "EF03CO07",
  "EF03CO08",
  "EF03CO09",
  "EF04CO01",
  "EF04CO02",
  "EF04CO03",
  "EF04CO04",
  "EF04CO05",
  "EF04CO06",
  "EF04CO07",
  "EF04CO08",
  "EF05CO01",
  "EF05CO02",
  "EF05CO03",
  "EF05CO04",
  "EF05CO05",
  "EF05CO06",
  "EF05CO07",
  "EF05CO08",
  "EF05CO09",
  "EF05CO10",
  "EF05CO011",
  "EF15CO01",
  "EF15CO02",
  "EF15CO03",
  "EF15CO04",
];

export const games: Game[] = gameOrder.map((code, index) => {
  const game = gameByCode[code];
  return game ? { id: index, ...game } : placeholderGame(code, index);
});
