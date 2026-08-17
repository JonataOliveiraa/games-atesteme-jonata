import type { CriterionId, NewsItem, TrustLevel } from '../types'

export const CRITERIA: Array<{ id: CriterionId; name: string; question: string }> = [
  { id: 'fonte', name: 'Fonte', question: 'Quem publicou é um lugar conhecido?' },
  { id: 'autoria', name: 'Autoria', question: 'Tem alguém assinando a notícia?' },
  { id: 'data', name: 'Data', question: 'A data combina com o assunto?' },
  { id: 'provas', name: 'Provas', question: 'A notícia mostra provas ou é só opinião?' },
]

export const TRUST_LABEL: Record<TrustLevel, string> = {
  confiavel: 'Confiável',
  cuidado: 'Cuidado',
  duvidoso: 'Não confiável',
}

export const TRUST_COLOR_KEY: Record<TrustLevel, 'green' | 'amber' | 'red'> = {
  confiavel: 'green',
  cuidado: 'amber',
  duvidoso: 'red',
}

export const NEWS: Record<string, NewsItem> = {
  chuvaOficial: {
    id: 'chuva-oficial',
    thumb: 'thumb-alerta-chuva',
    title: 'Chuva forte hoje à tarde: escolas orientam saída mais cedo',
    source: 'Defesa Civil da Cidade',
    signals: {
      fonte: { chip: 'Órgão oficial da cidade', detail: 'Quem publicou foi a Defesa Civil, o órgão que cuida dos alertas da cidade.', good: true },
      autoria: { chip: 'Assinado pela equipe de plantão', detail: 'A notícia é assinada pela equipe de plantão da Defesa Civil.', good: true },
      data: { chip: 'Publicado hoje, às 14h', detail: 'Foi publicado hoje às 14h, no mesmo dia da chuva anunciada.', good: true },
      provas: { chip: 'Mostra o boletim do tempo', detail: 'A notícia mostra o mapa e o boletim do tempo que provam o alerta.', good: true },
    },
  },
  chuvaBlog: {
    id: 'chuva-blog',
    thumb: 'thumb-alerta-chuva',
    title: 'ATENÇÃO! A cidade inteira vai alagar hoje!!!',
    source: 'Blog do Zé Furacão',
    signals: {
      fonte: { chip: 'Blog que ninguém conhece', detail: 'É um blog pessoal, sem nenhuma ligação com a prefeitura.', good: false },
      autoria: { chip: 'Sem autor', detail: 'Não aparece o nome de quem escreveu o texto.', good: false },
      data: { chip: 'Sem data', detail: 'A página não mostra quando o texto foi publicado.', good: false },
      provas: { chip: 'Só opinião, sem provas', detail: 'Não mostra mapa, boletim nem nenhuma fonte.', good: false },
    },
  },
  feiraJornal: {
    id: 'feira-jornal',
    thumb: 'thumb-feira-ciencias',
    title: 'Feira de Ciências acontece na quinta, no pátio da escola',
    source: 'Jornal da Escola',
    signals: {
      fonte: { chip: 'Jornal oficial da escola', detail: 'O jornal é feito pela própria escola.', good: true },
      autoria: { chip: 'Assinado pela professora Rita', detail: 'A professora Rita assina a notícia.', good: true },
      data: { chip: 'Publicado esta semana', detail: 'A publicação é desta semana, antes da feira.', good: true },
      provas: { chip: 'Traz o comunicado da direção', detail: 'A notícia mostra o comunicado com data e local.', good: true },
    },
  },
  feiraBoato: {
    id: 'feira-boato',
    thumb: 'thumb-feira-ciencias',
    title: 'Corre! A Feira de Ciências foi cancelada, passa adiante',
    source: 'Mensagem encaminhada',
    signals: {
      fonte: { chip: 'Mensagem encaminhada muitas vezes', detail: 'Chegou por mensagem repassada, sem origem conhecida.', good: false },
      autoria: { chip: 'Ninguém assina', detail: 'Não há nome de quem escreveu a mensagem.', good: false },
      data: { chip: 'Sem data', detail: 'A mensagem não mostra quando foi escrita.', good: false },
      provas: { chip: 'Nenhuma prova, só o aviso', detail: 'Não mostra comunicado nem confirmação da escola.', good: false },
    },
  },
  corujaRevista: {
    id: 'coruja-revista',
    thumb: 'thumb-curiosidade-animal',
    title: 'Estudo explica como a coruja gira tanto a cabeça',
    source: 'Revista Bicho Ciência',
    signals: {
      fonte: { chip: 'Revista de ciências conhecida', detail: 'A revista é conhecida por publicar estudos de biologia.', good: true },
      autoria: { chip: 'Assinado pelo biólogo Caio Lima', detail: 'O texto é assinado por um biólogo com nome completo.', good: true },
      data: { chip: 'Publicado no mês passado', detail: 'A publicação é recente, do mês passado.', good: true },
      provas: { chip: 'Cita o estudo e mostra fotos', detail: 'A notícia cita o estudo original e mostra as fotos dele.', good: true },
    },
  },
  corujaCorrente: {
    id: 'coruja-corrente',
    thumb: 'thumb-curiosidade-animal',
    title: 'A coruja gira a cabeça 360 graus e ainda voa de ré!',
    source: 'Corrente de grupo',
    signals: {
      fonte: { chip: 'Corrente de grupo', detail: 'Veio de uma corrente repassada em grupo de mensagens.', good: false },
      autoria: { chip: 'Sem autor', detail: 'Ninguém assina o texto.', good: false },
      data: { chip: 'Sem data', detail: 'Não dá para saber quando foi escrito.', good: false },
      provas: { chip: 'Nenhum estudo, só o texto', detail: 'Não mostra estudo nem especialista que confirme.', good: false },
    },
  },
  robotica: {
    id: 'robotica',
    thumb: 'thumb-competicao-robotica',
    title: 'Alunos da rede municipal vencem competição de robótica',
    source: 'Portal da Educação',
    signals: {
      fonte: { chip: 'Portal da Secretaria de Educação', detail: 'O portal pertence à Secretaria de Educação da cidade.', good: true },
      autoria: { chip: 'Assinado por Marina Alves', detail: 'A repórter Marina Alves assina a matéria.', good: true },
      data: { chip: 'Publicado ontem', detail: 'A matéria foi publicada ontem, logo após a competição.', good: true },
      provas: { chip: 'Mostra fotos e o nome da escola', detail: 'Traz fotos do evento e o nome da escola vencedora.', good: true },
    },
  },
  produto: {
    id: 'produto',
    thumb: 'thumb-produto-milagroso',
    title: 'Xarope deixa qualquer criança gênia em 3 dias',
    source: 'Loja Turbo Kids',
    signals: {
      fonte: { chip: 'É a loja que vende o produto', detail: 'Quem publicou é a própria loja que quer vender o xarope.', good: false },
      autoria: { chip: 'Sem autor', detail: 'Não há nome de quem escreveu o anúncio.', good: false },
      data: { chip: 'Publicado esta semana', detail: 'A página foi publicada esta semana.', good: true },
      provas: { chip: 'Promete demais e não mostra estudo', detail: 'Promete um resultado impossível e não mostra nenhum estudo.', good: false },
    },
  },
  campeonato: {
    id: 'campeonato',
    thumb: 'thumb-campeonato-antigo',
    title: 'Nossa escola é campeã do torneio de futsal!',
    source: 'Página de Esportes Escolares',
    signals: {
      fonte: { chip: 'Página conhecida da escola', detail: 'A página é da própria escola e já publicou outras notícias.', good: true },
      autoria: { chip: 'Assinado pelo professor Léo', detail: 'O professor de educação física assina o texto.', good: true },
      data: { chip: 'Publicado há quatro anos', detail: 'A notícia é verdadeira, mas foi publicada há quatro anos.', good: false },
      provas: { chip: 'Tem foto do time', detail: 'Mostra a foto do time daquele campeonato.', good: true },
    },
  },
  festa: {
    id: 'festa',
    thumb: 'thumb-evento-escolar',
    title: 'Festa junina será no dia 21, no pátio da escola',
    source: 'Site da Escola',
    signals: {
      fonte: { chip: 'Site oficial da escola', detail: 'O site é o canal oficial da escola.', good: true },
      autoria: { chip: 'Assinado pela direção', detail: 'A direção da escola assina o aviso.', good: true },
      data: { chip: 'Publicado esta semana', detail: 'O aviso foi publicado esta semana, antes da festa.', good: true },
      provas: { chip: 'Traz o convite e o horário', detail: 'Mostra o convite completo com data, hora e local.', good: true },
    },
  },
  lanche: {
    id: 'lanche',
    thumb: 'thumb-lanche-publicidade',
    title: 'Este é o lanche mais saudável do mundo, dizem as crianças',
    source: 'Canal Lanche Feliz',
    signals: {
      fonte: { chip: 'Canal da própria marca do lanche', detail: 'O canal pertence à marca que fabrica o lanche.', good: false },
      autoria: { chip: 'Assinado pelo apresentador', detail: 'O apresentador do canal assina o vídeo.', good: true },
      data: { chip: 'Publicado este mês', detail: 'A publicação é deste mês.', good: true },
      provas: { chip: 'Não mostra estudo, é propaganda', detail: 'Não apresenta estudo de nutrição: é uma propaganda.', good: false },
    },
  },
  foraContexto: {
    id: 'fora-contexto',
    thumb: 'thumb-imagem-fora-contexto',
    title: 'Foto mostra o alagamento da nossa rua hoje de manhã',
    source: 'Perfil Notícia Já',
    signals: {
      fonte: { chip: 'Perfil sem identificação', detail: 'O perfil não diz quem é nem de onde fala.', good: false },
      autoria: { chip: 'Sem autor', detail: 'Ninguém assina a publicação.', good: false },
      data: { chip: 'A foto é de outro ano', detail: 'A mesma foto já circulava há dois anos.', good: false },
      provas: { chip: 'A foto é de outra cidade', detail: 'A imagem foi tirada em outra cidade, em outro dia.', good: false },
    },
  },
  recreio: {
    id: 'recreio',
    thumb: 'thumb-recreio-escolar',
    title: 'Recreio ganha 10 minutos a mais a partir de segunda',
    source: 'Comunicado da Direção',
    signals: {
      fonte: { chip: 'Comunicado oficial da direção', detail: 'O aviso saiu no mural oficial da direção.', good: true },
      autoria: { chip: 'Assinado pela diretora Sônia', detail: 'A diretora assina o comunicado.', good: true },
      data: { chip: 'Publicado hoje', detail: 'O comunicado é de hoje, antes da mudança começar.', good: true },
      provas: { chip: 'Traz o novo horário completo', detail: 'Mostra o horário novo do recreio, minuto a minuto.', good: true },
    },
  },
}