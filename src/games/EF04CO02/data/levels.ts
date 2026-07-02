import type { PersonRecord, ArchiveLevel } from "../types";

export const RECORDS: PersonRecord[] = [
  { id: "1", emoji: "👦", Nome: "Lucas",   Cidade: "São Paulo",     Hobby: "Futebol", Idade: "9",  Animal: "Cachorro" },
  { id: "2", emoji: "👧", Nome: "Beatriz", Cidade: "Rio de Janeiro", Hobby: "Dança",   Idade: "10", Animal: "Gato"     },
  { id: "3", emoji: "👦", Nome: "Miguel",  Cidade: "São Paulo",     Hobby: "Xadrez",  Idade: "9",  Animal: "Peixe"    },
  { id: "4", emoji: "👧", Nome: "Sofia",   Cidade: "Curitiba",      Hobby: "Futebol", Idade: "11", Animal: "Cachorro" },
  { id: "5", emoji: "👦", Nome: "Pedro",   Cidade: "Salvador",      Hobby: "Leitura", Idade: "10", Animal: "Gato"     },
  { id: "6", emoji: "👧", Nome: "Ana",     Cidade: "Rio de Janeiro", Hobby: "Desenho", Idade: "9",  Animal: "Pássaro"  },
  { id: "7", emoji: "👦", Nome: "Rafael",  Cidade: "Curitiba",      Hobby: "Leitura", Idade: "11", Animal: "Cachorro" },
  { id: "8", emoji: "👧", Nome: "Julia",   Cidade: "São Paulo",     Hobby: "Dança",   Idade: "10", Animal: "Gato"     },
];

export const LEVELS: ArchiveLevel[] = [
  {
    level: 1,
    title: "Encontre o Registro",
    objective: "Leia a ficha e toque no estudante correto!",
    detail: "Cada cartão mostra informações de um estudante. Leia a pergunta e toque na ficha que corresponde.",
    tip: "Procure o campo pedido em cada cartão para encontrar a resposta certa.",
    timeLimit: 35,
    n1Questions: [
      { field: "Hobby",  value: "Futebol",        recordIds: ["1","2","3","4"], correctId: "1" },
      { field: "Cidade", value: "São Paulo",       recordIds: ["1","2","3","4"], correctId: "1" },
      { field: "Animal", value: "Gato",            recordIds: ["5","6","7","8"], correctId: "5" },
      { field: "Idade",  value: "11",              recordIds: ["5","6","7","8"], correctId: "7" },
    ],
  },
  {
    level: 2,
    title: "Qual é o Valor do Campo?",
    objective: "Leia a ficha completa e responda a pergunta!",
    detail: "Uma ficha com todos os campos será exibida. Escolha a resposta correta entre as quatro opções.",
    tip: "Leia com atenção — as opções são parecidas!",
    timeLimit: 45,
    n2Questions: [
      { recordId: "2", field: "Hobby",  question: "Qual o Hobby de Beatriz?",                              correct: "Dança",                          options: ["Dança","Futebol","Xadrez","Leitura"]                                          },
      { recordId: "3", field: "Cidade", question: "Qual a Cidade de Miguel?",                              correct: "São Paulo",                       options: ["São Paulo","Curitiba","Salvador","Rio de Janeiro"]                             },
      { recordId: "5", field: "Animal", question: "Qual o Animal de Pedro?",                               correct: "Gato",                           options: ["Gato","Cachorro","Peixe","Pássaro"]                                           },
      { recordId: "7", field: "Idade",  question: "Qual a Idade de Rafael?",                               correct: "11",                             options: ["9","10","11","8"]                                                             },
      { recordId: "6", field: "Nome",   question: "Qual o Nome de quem mora no Rio e tem Pássaro?",        correct: "Ana",                            options: ["Ana","Julia","Beatriz","Sofia"]                                               },
    ],
  },
  {
    level: 3,
    title: "Filtro de Registros",
    objective: "Analise todos os registros e responda!",
    detail: "Todos os 8 estudantes aparecem em cards. Leia os registros com atenção para contar ou filtrar.",
    tip: "Veja todos os cards antes de responder — cada detalhe conta!",
    timeLimit: 55,
    n3Questions: [
      { question: "Quantos estudantes moram em São Paulo?",             correct: "3",                               options: ["2","3","4","5"],                                    explanation: "Lucas, Miguel e Julia moram em São Paulo"               },
      { question: "Quantos estudantes têm Cachorro como animal?",       correct: "3",                               options: ["2","3","4","1"],                                    explanation: "Lucas, Sofia e Rafael têm Cachorro"                     },
      { question: "Qual é o Hobby mais comum entre os registros?",      correct: "Empate: Futebol, Dança e Leitura", options: ["Futebol","Empate: Futebol, Dança e Leitura","Xadrez","Leitura"], explanation: "Futebol, Dança e Leitura aparecem 2x cada" },
    ],
  },
];
