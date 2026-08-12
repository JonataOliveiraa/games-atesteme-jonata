import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const inputPath = "C:/Users/teste123/Downloads/bncc_jogos_v3_fichas_dev.xlsx";
const outputDir = "C:/Users/teste123/Documents/Atesteme Jogos Fund 1/outputs/jonata-ajustes";
const outputPath = `${outputDir}/bncc_jogos_v3_fichas_dev_JONATA_filtrado.xlsx`;

const keepCodes = [
  "EF15CO01",
  "EF15CO02",
  "EF15CO03",
  "EF15CO04",
  "EF02CO05",
  "EF04CO04",
  "EF04CO03",
  "EF03CO06",
  "EF05CO04",
  "EF05CO09",
  "EF05CO06",
];

const suggestions = {
  EF15CO01: {
    title: "Trocar toque em alvo por deslize horizontal",
    current: "Point-and-click: a criança toca em uma pista e depois escolhe uma estante entre fila, grade, ficha, teia ou caixa livre.",
    similar: "Muito parecido com EF02CO01 - Detetive dos Modelos: procurar na cena e tocar no elemento correto.",
    adjustment: "Manter a informação da rodada fixa no centro e, a cada deslize horizontal, remontá-la em outra estrutura: fila, grade, ficha com campos, teia de conexões ou valores avulsos. Um toque em CONFIRMAR encerra a rodada.",
    why: "O gesto transforma o objeto em vez de só selecioná-lo. A criança compara estruturas e percebe quando cada forma serve para responder uma pergunta.",
  },
  EF15CO02: {
    title: "Separar montagem e execução do algoritmo",
    current: "Nos pontos de decisão, a criança escolhe uma carta entre duas ou três enquanto o corredor avança sozinho.",
    similar: "Duplicação declarada do EF01CO03 - Pulo Programado, com cartas novas.",
    adjustment: "Criar duas fases na mesma tela: montagem, com trilha vazia e slots numerados para arrastar cartas; execução, com botão JOGAR e corrida completa sem interrupção. Em caso de falha, parar no slot problemático e voltar à montagem preservada.",
    why: "Existe um plano completo antes da execução, o que permite simular e depurar o algoritmo.",
  },
  EF15CO03: {
    title: "Não manter como jogo separado; cobrir pela lógica do EF05CO03",
    current: "Jogo de cartas em que a criança escolhe a frase verdadeira para uma carta-cenário.",
    similar: "Duplica o EF05CO03 - Portões Lógicos, que trabalha a mesma habilidade oficial de negação, conjunção e disjunção.",
    adjustment: "Tratar a mecânica de combinação como território do EF05CO03: arrastar uma frase sobre outra para unir com E ou OU, e usar toque longo para aplicar NÃO. Um painel mostra o valor de cada parte e o resultado final.",
    why: "O painel transforma a atividade em operação lógica real, evitando que dois jogos façam apenas julgamento de verdadeiro/falso.",
  },
  EF15CO04: {
    title: "Retirar corte inicial e trabalhar combinação de soluções",
    current: "Construtor de cidades: tocar em linhas pontilhadas para dividir a praça e depois arrastar três peças por obra.",
    similar: "Muito próximo do EF03CO03 - Missão em Pedaços: cortar em partes e resolver cada parte.",
    adjustment: "Começar com sub-obras já divididas. A criança distribui cada sub-obra em duas trilhas paralelas, representando duas equipes. Um relógio no topo muda ao vivo conforme a distribuição melhora ou piora.",
    why: "A criança manipula agrupamento e ordem das partes e vê o custo total mudar, praticando a combinação de soluções.",
  },
  EF02CO05: {
    title: "Trocar runner por seletor circular de tecnologias",
    current: "A criança corre pelo bairro e desvia para o portão da tecnologia que resolve a situação.",
    similar: "Mesmo gesto de runner/faixa de EF01CO01 e EF04CO04.",
    adjustment: "Parar a rolagem. Deixar a situação estática no topo e criar um seletor circular de aparelhos na parte inferior. Ao girar o seletor, cada aparelho gera uma prévia na cena; um toque confirma. Um álbum lateral registra as tecnologias descobertas.",
    why: "Girar é um gesto novo no catálogo e permite explorar características e usos antes da decisão.",
  },
  EF04CO04: {
    title: "Trocar trilhos por painel de interruptores binários",
    current: "A criança alterna entre trilho 1 e trilho 0 seguindo um código pronto até entregar o pacote ao robô.",
    similar: "Terceiro runner de faixa do catálogo; o binário aparece como tema visual, não como codificação.",
    adjustment: "Usar sete lâmpadas em fila. A criança acende ou apaga cada bit para montar o código do caractere pedido; um visor mostra o número decimal em tempo real e a máquina aceita quando o padrão bate.",
    why: "Acender bits torna visível a ponte caractere, número decimal e binário, sem invadir a mecânica de pixels/RGB do EF04CO05.",
  },
  EF04CO03: {
    title: "Substituir ritmo por contadores de laços aninhados",
    current: "A criança toca no marcador de batida; molduras mostram o laço de fora e o de dentro, e no final ela responde quantas vezes cada um rodou.",
    similar: "Mesma pegada de ritmo de EF01CO02 e EF03CO08.",
    adjustment: "Criar dois botões grandes com contadores permanentes: LAVAR, laço interno, soma uma janela; SUBIR, laço externo, soma um andar e zera janelas. Se tentar subir com janela suja, o andar não libera e o contador pisca.",
    why: "Os contadores mostram o laço interno subindo e zerando dentro do laço externo, tornando o aninhamento observável.",
  },
  EF03CO06: {
    title: "Trocar escolha de carta por traço direcional",
    current: "Ao parar em um obstáculo, a criança toca em um dos dispositivos de entrada e o computador gera a saída.",
    similar: "Mesmo formato de carta grande em ponto de parada de EF01CO03 e EF01CO05.",
    adjustment: "Colocar dispositivos ao redor de um computador central. Para entrada, a criança desliza do dispositivo para o computador; para saída, do computador para o dispositivo. O fio acompanha o dedo e a informação viaja por ele.",
    why: "A direção do gesto passa a ser a resposta, alinhando ação e conceito de entrada/saída.",
  },
  EF05CO04: {
    title: "Voltar à montagem por encaixe de SE, ENTÃO e SENÃO",
    current: "Nos pontos de decisão, a criança escolhe uma carta condicional pronta e o robô executa sozinho.",
    similar: "Terceiro jogo com carta escolhida no ponto de parada, junto de EF01CO03 e EF15CO02.",
    adjustment: "Mostrar uma regra vazia com três slots: SE, ENTÃO e SENÃO. A criança arrasta a condição e as ações, toca em TESTAR e vê o personagem executar, com destaque para a condição lida e o ramo tomado.",
    why: "A mesma regra roda em estados diferentes do cenário, separando responder certo de programar uma regra geral.",
  },
  EF05CO09: {
    title: "Manter jogo existente e ajustar mídias/direitos",
    current: "RPG leve com toque em uma de três cartas de atitude para usar cada obra no mural.",
    similar: "Mesmo arquétipo de cartas de atitude de EF04CO07 e EF05CO011.",
    adjustment: "Manter Curadoria com Créditos. Garantir quatro mídias no mural - imagem, música, vídeo e texto - e usar obras fictícias para não reproduzir o problema de direito autoral.",
    why: "Preencher crédito/licença aplica a habilidade de direitos autorais melhor do que escolher uma atitude pronta, sem exigir novo desenvolvimento.",
  },
  EF05CO06: {
    title: "Trocar duas cestas por triagem direcional em três destinos",
    current: "A criança toca em LOCAL ou NUVEM para arremessar o arquivo.",
    similar: "Mesmo par de botões mutuamente exclusivos de EF03CO01.",
    adjustment: "Colocar o arquivo no centro e permitir deslizar para a esquerda, local; para cima, removível; ou para a direita, nuvem. No nível 3, alguns arquivos devem ir para dois destinos como backup.",
    why: "A solução recupera a categoria de armazenamento removível e permite representar backup em mais de um lugar.",
  },
};

const generalSuggestions = [
  "Avaliar quais jogos devem funcionar melhor em tela vertical, em vez de só paisagem.",
  "Globalizar ícones comuns do catálogo, como X, acerto e demais símbolos recorrentes.",
];

function colLetter(index) {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function trimMatrix(values) {
  let lastRow = values.length - 1;
  while (lastRow >= 0 && values[lastRow].every((cell) => cell === null || cell === "")) {
    lastRow -= 1;
  }
  const trimmed = values.slice(0, lastRow + 1);
  let lastCol = 0;
  for (const row of trimmed) {
    for (let i = row.length - 1; i >= 0; i -= 1) {
      if (row[i] !== null && row[i] !== "") {
        lastCol = Math.max(lastCol, i);
        break;
      }
    }
  }
  return trimmed.map((row) => row.slice(0, lastCol + 1));
}

function isSectionLabel(value) {
  if (!value || typeof value !== "string") return false;
  return [
    "HABILIDADE BNCC",
    "O JOGO EM 1 FRASE",
    "COMO A MECÂNICA",
    "CONTROLE",
    "TELA E LAYOUT",
    "REGRAS",
    "NÍVEIS",
    "FEEDBACK",
    "CONTEÚDO PEDAGÓGICO",
    "ASSETS",
    "AVALIAÇÃO",
    "PADRÕES",
    "SUGESTÕES",
  ].some((token) => value.includes(token));
}

function applyFichaStyle(sheet, totalRows) {
  sheet.showGridLines = false;
  sheet.getRange("A:A").format.columnWidthPx = 190;
  sheet.getRange("B:B").format.columnWidthPx = 720;
  sheet.getRange(`A1:B${totalRows}`).format = {
    wrapText: true,
    font: { name: "Aptos", size: 10, color: "#111827" },
  };
  sheet.getRange("A1:B1").merge();
  sheet.getRange("A1").format = { fill: "#111827", font: { bold: true, color: "#FFFFFF", size: 16 } };
  sheet.getRange("A2:B2").merge();
  sheet.getRange("A2").format = { fill: "#E5E7EB", font: { italic: true, color: "#374151" } };
  sheet.getRange("A3:B3").merge();
  sheet.getRange("A3").format = { font: { color: "#2563EB", bold: true } };

  for (let row = 1; row <= totalRows; row += 1) {
    const value = sheet.getRange(`A${row}`).values[0]?.[0];
    const right = sheet.getRange(`B${row}`).values[0]?.[0];
    if (isSectionLabel(value) && (right === null || right === "")) {
      sheet.getRange(`A${row}:B${row}`).merge();
      sheet.getRange(`A${row}`).format = {
        fill: "#374151",
        font: { bold: true, color: "#FFFFFF" },
      };
      sheet.getRange(`A${row}:B${row}`).format.rowHeightPx = 24;
    }
  }

  sheet.getRange(`A1:B${totalRows}`).format.borders = {
    insideHorizontal: { style: "thin", color: "#E5E7EB" },
    top: { style: "thin", color: "#D1D5DB" },
    bottom: { style: "thin", color: "#D1D5DB" },
  };
  sheet.freezePanes.freezeRows(3);
}

function addSuggestionBlock(sheet, startRow, code) {
  const s = suggestions[code];
  const block = [
    ["SUGESTÕES DE AJUSTES - JONATA", null],
    ["Encaminhamento", s.title],
    ["Como está", s.current],
    ["Com o que se parece", s.similar],
    ["Sugestão de ajuste", s.adjustment],
    ["Por que é melhor", s.why],
    ["Fonte", "JONATA - Sugestões de Ajustes (BNCC Jogos) (2).pdf"],
  ];
  const endRow = startRow + block.length - 1;
  sheet.getRange(`A${startRow}:B${endRow}`).values = block;
  sheet.getRange(`A${startRow}:B${startRow}`).merge();
  sheet.getRange(`A${startRow}`).format = {
    fill: "#EA580C",
    font: { bold: true, color: "#FFFFFF", size: 12 },
  };
  sheet.getRange(`A${startRow + 1}:A${endRow}`).format = {
    fill: "#FED7AA",
    font: { bold: true, color: "#7C2D12" },
  };
  sheet.getRange(`B${startRow + 1}:B${endRow}`).format = {
    fill: "#FFF7ED",
    font: { color: "#111827" },
    wrapText: true,
  };
  sheet.getRange(`A${startRow}:B${endRow}`).format.borders = {
    preset: "all",
    style: "thin",
    color: "#FDBA74",
  };
  sheet.getRange(`A${startRow + 1}:B${endRow}`).format.rowHeightPx = 48;
}

const sourceBlob = await FileBlob.load(inputPath);
const sourceWb = await SpreadsheetFile.importXlsx(sourceBlob);
const outputWb = Workbook.create();

const sourceIndex = sourceWb.worksheets.getItem("Índice");
const indexValues = trimMatrix(sourceIndex.getUsedRange(true).values);
const indexByCode = new Map();
for (const row of indexValues) {
  if (typeof row[0] === "string" && keepCodes.includes(row[0])) {
    indexByCode.set(row[0], row);
  }
}

const indexSheet = outputWb.worksheets.add("Índice");
const intro = [
  ["BNCC Computação - Catálogo de Jogos Digitais v3 filtrado por sugestões JONATA", null, null, null, null, null, null],
  ["Mantém apenas Índice e as 11 fichas numeradas no PDF JONATA - Sugestões de Ajustes (BNCC Jogos) (2).", null, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  ["Resumo do ajuste", null, null, null, null, null, null],
  ["Total de fichas mantidas", keepCodes.length, null, null, null, null, null],
  ["Fichas removidas", 45 - keepCodes.length, null, null, null, null, null],
  ["Critério", "Lista numerada do PDF JONATA; EF05CO03, EF04CO05 e EF05CO011 aparecem apenas como referências no texto e não foram mantidas como abas.", null, null, null, null, null],
  [null, null, null, null, null, null, null],
  ["Código", "Nome do jogo", "Ano/Etapa", "Eixo", "Gênero", "O jogo em 1 frase", "Ajuste JONATA"],
];
const indexRows = keepCodes.map((code) => {
  const base = indexByCode.get(code) || [code, "", "", "", "", ""];
  return [...base.slice(0, 6), suggestions[code].title];
});
const generalStart = intro.length + indexRows.length + 3;
indexSheet.getRange(`A1:G${intro.length}`).values = intro;
indexSheet.getRange(`A${intro.length + 1}:G${intro.length + indexRows.length}`).values = indexRows;
indexSheet.getRange(`A${generalStart}:G${generalStart}`).merge();
indexSheet.getRange(`A${generalStart}`).values = [["Outras sugestões gerais do PDF"]];
indexSheet.getRange(`A${generalStart + 1}:B${generalStart + generalSuggestions.length}`).values = generalSuggestions.map((text, i) => [`${i + 1}.`, text]);

indexSheet.showGridLines = false;
indexSheet.getRange("A:G").format = { wrapText: true, font: { name: "Aptos", size: 10 } };
indexSheet.getRange("A1:G1").merge();
indexSheet.getRange("A1").format = { fill: "#111827", font: { bold: true, color: "#FFFFFF", size: 16 } };
indexSheet.getRange("A2:G2").merge();
indexSheet.getRange("A2").format = { fill: "#E5E7EB", font: { italic: true, color: "#374151" } };
indexSheet.getRange("A4:G4").merge();
indexSheet.getRange("A4").format = { fill: "#374151", font: { bold: true, color: "#FFFFFF" } };
indexSheet.getRange("A9:G9").format = { fill: "#374151", font: { bold: true, color: "#FFFFFF" } };
indexSheet.getRange(`A10:G${9 + indexRows.length}`).format.borders = { preset: "all", style: "thin", color: "#D1D5DB" };
indexSheet.getRange(`A${generalStart}:G${generalStart}`).format = { fill: "#EA580C", font: { bold: true, color: "#FFFFFF" } };
indexSheet.getRange(`A${generalStart + 1}:B${generalStart + generalSuggestions.length}`).format = { fill: "#FFF7ED", wrapText: true };
indexSheet.getRange("A:A").format.columnWidthPx = 86;
indexSheet.getRange("B:B").format.columnWidthPx = 180;
indexSheet.getRange("C:C").format.columnWidthPx = 92;
indexSheet.getRange("D:D").format.columnWidthPx = 180;
indexSheet.getRange("E:E").format.columnWidthPx = 160;
indexSheet.getRange("F:F").format.columnWidthPx = 360;
indexSheet.getRange("G:G").format.columnWidthPx = 310;
indexSheet.freezePanes.freezeRows(9);

for (const code of keepCodes) {
  const sourceSheet = sourceWb.worksheets.getItem(code);
  const values = trimMatrix(sourceSheet.getUsedRange(true).values);
  const sheet = outputWb.worksheets.add(code);
  const rowCount = values.length;
  const colCount = Math.max(2, values[0]?.length || 2);
  sheet.getRange(`A1:${colLetter(colCount - 1)}${rowCount}`).values = values.map((row) => {
    const next = row.slice();
    while (next.length < colCount) next.push(null);
    return next;
  });
  const suggestionStart = rowCount + 2;
  addSuggestionBlock(sheet, suggestionStart, code);
  applyFichaStyle(sheet, suggestionStart + 6);
}

const sheetCheck = await outputWb.inspect({ kind: "sheet", include: "name", maxChars: 12000 });
console.log(sheetCheck.ndjson);

const indexCheck = await outputWb.inspect({
  kind: "table",
  sheetId: "Índice",
  range: `A9:G${9 + indexRows.length}`,
  include: "values,formulas",
  tableMaxRows: 14,
  tableMaxCols: 7,
  maxChars: 8000,
});
console.log(indexCheck.ndjson);

const errors = await outputWb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

for (const sheetName of ["Índice", ...keepCodes]) {
  const png = await outputWb.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(`${outputDir}/preview_${sheetName}.png`, new Uint8Array(await png.arrayBuffer()));
}

await fs.mkdir(outputDir, { recursive: true });
const xlsx = await SpreadsheetFile.exportXlsx(outputWb);
await xlsx.save(outputPath);
console.log(`SAVED ${outputPath}`);
