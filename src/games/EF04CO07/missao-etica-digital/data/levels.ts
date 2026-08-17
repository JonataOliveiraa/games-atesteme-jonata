import type { DataCard, TriageLevel } from "../types";

// ── N1: 2 zonas (coletar | bloquear), casos óbvios ───────────────────────────

const N1_CARDS: DataCard[] = [
  {
    id: "n1-foto-propria",
    assetKey: "card-photo",
    label: "Sua Foto",
    context: "Você quer usar sua foto no perfil do projeto escolar.",
    correctZone: "coletar",
    explanation: "Sua própria foto pode ser coletada com sua permissão!",
  },
  {
    id: "n1-foto-colega",
    assetKey: "card-photo",
    label: "Foto de Colega",
    context: "Você encontrou uma foto de um colega no computador da escola.",
    correctZone: "bloquear",
    explanation: "Nunca colete fotos de outras pessoas sem permissão!",
  },
  {
    id: "n1-senha",
    assetKey: "card-senha",
    label: "Senha Encontrada",
    context: "Você viu acidentalmente a senha de acesso de um colega.",
    correctZone: "bloquear",
    explanation: "Senhas são dados privativos — nunca anote ou guarde senhas alheias!",
  },
  {
    id: "n1-endereco-proprio",
    assetKey: "card-endereco",
    label: "Seu Endereço",
    context: "Um site da escola pede seu endereço para enviar seu certificado.",
    correctZone: "coletar",
    explanation: "Seu endereço pode ser coletado com sua permissão e finalidade clara.",
  },
  {
    id: "n1-medico-colega",
    assetKey: "ard-medico",
    label: "Dado Médico",
    context: "Você encontrou um arquivo com informações médicas de um colega.",
    correctZone: "bloquear",
    explanation: "Dados médicos são sigilosos — nunca colete dados de saúde alheios!",
  },
  {
    id: "n1-endereco-colega",
    assetKey: "card-endereco",
    label: "Endereço de Colega",
    context: "Você quer anotar o endereço de um colega sem ele saber.",
    correctZone: "bloquear",
    explanation: "Coletar dados de alguém sem permissão é antiético!",
  },
];

// ── N2: 3 zonas (coletar | descartar | bloquear), com contexto ───────────────

const N2_CARDS: DataCard[] = [
  {
    id: "n2-foto-antiga",
    assetKey: "card-photo",
    label: "Fotos de Projeto",
    context: "Fotos de um projeto concluído há 2 anos, sem mais uso previsto.",
    correctZone: "descartar",
    explanation: "Dados sem finalidade ativa devem ser descartados com segurança!",
  },
  {
    id: "n2-foto-permissao",
    assetKey: "card-photo",
    label: "Foto com Permissão",
    context: "Um amigo pediu sua foto para colocar no convite de festa.",
    correctZone: "coletar",
    explanation: "Com sua permissão explícita e finalidade clara, a coleta é ética.",
  },
  {
    id: "n2-senha-vista",
    assetKey: "card-senha",
    label: "Senha Compartilhada",
    context: "Um colega digitou a senha dele na sua frente por engano.",
    correctZone: "bloquear",
    explanation: "Você não tem o direito de guardar essa senha — deve ignorá-la.",
  },
  {
    id: "n2-endereco-entrega",
    assetKey: "card-endereco",
    label: "Endereço para Entrega",
    context: "Você precisa do seu endereço para receber um kit escolar.",
    correctZone: "coletar",
    explanation: "Com consentimento próprio e finalidade clara, o dado pode ser coletado.",
  },
  {
    id: "n2-medico-corredor",
    assetKey: "ard-medico",
    label: "Ficha Médica",
    context: "Você achou uma ficha médica de um aluno caída no corredor.",
    correctZone: "bloquear",
    explanation: "Entregue ao responsável — nunca fotografe ou anote esses dados!",
  },
  {
    id: "n2-endereco-antigo",
    assetKey: "card-endereco",
    label: "Endereço Antigo",
    context: "Você tem o endereço de um ex-colega que mudou de escola.",
    correctZone: "descartar",
    explanation: "Dados de quem saiu do seu contexto devem ser excluídos.",
  },
  {
    id: "n2-senha-inativa",
    assetKey: "card-senha",
    label: "Senha de Sistema Antigo",
    context: "O professor deu uma senha de acesso a um sistema já desativado.",
    correctZone: "descartar",
    explanation: "Senhas de sistemas inativos são desnecessárias — descarte com segurança.",
  },
  {
    id: "n2-foto-grupo",
    assetKey: "card-photo",
    label: "Foto de Grupo",
    context: "A turma aprovou publicar a foto da viagem escolar no site da escola.",
    correctZone: "coletar",
    explanation: "Com permissão de todos e finalidade clara, a coleta é ética.",
  },
];

// ── N3: 3 zonas, 10 cartões, contextos nuançados ─────────────────────────────

const N3_CARDS: DataCard[] = [
  {
    id: "n3-foto-combinada",
    assetKey: "card-photo",
    label: "Foto + Local + Data",
    context: "Foto de colega com localização e data — você quer guardar como referência.",
    correctZone: "bloquear",
    explanation: "Dados combinados revelam rotinas e localização — muito mais sensíveis juntos!",
  },
  {
    id: "n3-endereco-lista-antiga",
    assetKey: "card-endereco",
    label: "Lista de Endereços Antiga",
    context: "Lista de endereços de alunos de 3 anos atrás que já mudaram de turma.",
    correctZone: "descartar",
    explanation: "Dados desatualizados e sem uso atual devem ser descartados com segurança.",
  },
  {
    id: "n3-selfie-concurso",
    assetKey: "card-photo",
    label: "Selfie para Concurso",
    context: "Um concurso cultural pede sua foto com consentimento dos responsáveis.",
    correctZone: "coletar",
    explanation: "Com propósito claro e consentimento, a coleta da sua imagem é ética.",
  },
  {
    id: "n3-senha-quadro",
    assetKey: "card-senha",
    label: "Senha Vista no Quadro",
    context: "O professor escreveu uma senha no quadro por engano — você memorizou.",
    correctZone: "bloquear",
    explanation: "Mesmo sem querer, guardar essa informação é uma violação ética.",
  },
  {
    id: "n3-endereco-entrega-feita",
    assetKey: "card-endereco",
    label: "Endereço Já Usado",
    context: "Você tinha o endereço de um colega para uma entrega feita há meses.",
    correctZone: "descartar",
    explanation: "Finalidade cumprida? O dado deve ser excluído! Guardar sem motivo é antiético.",
  },
  {
    id: "n3-foto-engano",
    assetKey: "card-photo",
    label: "Foto Enviada por Engano",
    context: "Um colega enviou uma foto pessoal para você por engano e pediu para apagar.",
    correctZone: "bloquear",
    explanation: "Respeite o pedido: apague imediatamente. Guardar seria uma violação grave.",
  },
  {
    id: "n3-medico-autorizado",
    assetKey: "ard-medico",
    label: "Alergia Alimentar",
    context: "Um familiar autorizou a escola a registrar a alergia alimentar por segurança.",
    correctZone: "coletar",
    explanation: "Com autorização explícita e finalidade de segurança, dados médicos podem ser coletados.",
  },
  {
    id: "n3-endereco-cadastro",
    assetKey: "card-endereco",
    label: "Endereço para Cadastro",
    context: "Você cria uma conta educacional com autorização dos seus responsáveis.",
    correctZone: "coletar",
    explanation: "Com consentimento e propósito claro, seus dados podem ser fornecidos.",
  },
  {
    id: "n3-senha-sistema-antigo",
    assetKey: "card-senha",
    label: "Senha Anotada",
    context: "Você encontrou anotada a senha de um sistema que a escola parou de usar.",
    correctZone: "descartar",
    explanation: "Senhas de sistemas inativos são desnecessárias e devem ser descartadas.",
  },
  {
    id: "n3-medico-escaneado",
    assetKey: "ard-medico",
    label: "Relatório Escaneado",
    context: "Você escaneou por engano um documento médico de outro aluno com os seus.",
    correctZone: "bloquear",
    explanation: "Dados médicos alheios devem ser eliminados imediatamente — sem guardar!",
  },
];

// ── Níveis ────────────────────────────────────────────────────────────────────

export const LEVELS: TriageLevel[] = [
  {
    level: 1,
    title: "Triagem Digital",
    objective: "Arraste cada dado para a zona correta: Coletar ou Bloquear!",
    detail: "Alguns dados podem ser coletados com permissão. Outros NUNCA devem ser coletados.",
    tip: "Só colete dados com permissão e quando há uma razão clara!",
    timeLimit: 50,
    cards: N1_CARDS,
    activeZones: ["coletar", "bloquear"],
  },
  {
    level: 2,
    title: "Triagem Digital",
    objective: "Agora há 3 zonas: Coletar, Descartar ou Bloquear!",
    detail: "Dados antigos sem uso devem ser descartados. Dados de outros sem permissão devem ser bloqueados.",
    tip: "Guarde só o que for necessário! Dado desnecessário deve ser descartado com segurança.",
    timeLimit: 65,
    cards: N2_CARDS,
    activeZones: ["coletar", "descartar", "bloquear"],
  },
  {
    level: 3,
    title: "Triagem Digital",
    objective: "Dados combinados podem ser mais sensíveis — leia o contexto com atenção!",
    detail: "No nível 3, o contexto muda tudo. Um mesmo tipo de dado pode exigir ações diferentes.",
    tip: "Leia o contexto com atenção — o tipo do dado sozinho não basta para decidir!",
    timeLimit: 80,
    cards: N3_CARDS,
    activeZones: ["coletar", "descartar", "bloquear"],
  },
];
