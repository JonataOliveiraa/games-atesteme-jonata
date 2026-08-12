import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "C:/Users/teste123/Documents/Atesteme Jogos Fund 1/outputs/catalogo-revisao-resumida";
const outputPath = `${outputDir}/catalogo_revisao_resumida.xlsx`;

const prefixStyles = {
  EF01: { label: "Azul", dark: "#1D4ED8", light: "#DBEAFE", text: "#FFFFFF" },
  EF02: { label: "Verde", dark: "#16A34A", light: "#DCFCE7", text: "#FFFFFF" },
  EF03: { label: "Amarelo", dark: "#FACC15", light: "#FEF9C3", text: "#111827" },
  EF04: { label: "Roxo", dark: "#7E22CE", light: "#F3E8FF", text: "#FFFFFF" },
  EF05: { label: "Vermelho", dark: "#DC2626", light: "#FEE2E2", text: "#FFFFFF" },
  EF15: { label: "Cinza", dark: "#6B7280", light: "#F3F4F6", text: "#FFFFFF" },
};

const rows = [
  {
    prefixo: "EF15",
    codigo: "EF15CO01",
    jogo: "O Misterio do Arquivo Vivo",
    categoria: "Clones transversais",
    problema: "Mesmo formato point-and-click do EF02CO01; a crianca escolhe a estante sem comparar estruturas.",
    proposta: "Usar deslize horizontal para remontar a mesma informacao em fila, grade, ficha, teia ou valores soltos.",
    decisao: "Reformular",
    impacto: "Mostra quando uma estrutura facilita a busca e diferencia o jogo do EF02CO01.",
    prioridade: "Alta",
  },
  {
    prefixo: "EF15",
    codigo: "EF15CO02",
    jogo: "Maratona do Algoritmo",
    categoria: "Clones transversais",
    problema: "Replica o EF01CO03 com cartas novas e nao permite ver nem depurar o algoritmo completo.",
    proposta: "Separar montagem e execucao: arrastar comandos para slots, rodar tudo e voltar ao ponto de falha.",
    decisao: "Reformular",
    impacto: "Transforma resposta por impulso em construcao e simulacao de algoritmo.",
    prioridade: "Alta",
  },
  {
    prefixo: "EF15",
    codigo: "EF15CO03",
    jogo: "Trunfo da Logica",
    categoria: "Clones transversais",
    problema: "Duplica literalmente a habilidade do EF05CO03 e ainda fica restrito a apontar a frase verdadeira.",
    proposta: "Nao manter jogo separado; cobrir pelo EF05CO03 reformulado com combinacao de sentencas.",
    decisao: "Descartar / cobrir",
    impacto: "Evita duplicacao e concentra a mecanica correta no 5o ano.",
    prioridade: "Alta",
  },
  {
    prefixo: "EF15",
    codigo: "EF15CO04",
    jogo: "Canteiro de Obras",
    categoria: "Clones transversais",
    problema: "Repete corte em partes do EF03CO03 e nao pratica combinacao de solucoes.",
    proposta: "Comecar com sub-obras ja divididas e distribuir tarefas em duas trilhas paralelas com relogio vivo.",
    decisao: "Descartar / cobrir",
    impacto: "EF03CO03 fica com decomposicao; combinacao pode ser tratada sem jogo transversal duplicado.",
    prioridade: "Alta",
  },
  {
    prefixo: "EF02",
    codigo: "EF02CO05",
    jogo: "Corrida do Cotidiano",
    categoria: "Runners repetidos",
    problema: "Terceiriza comparacao para uma corrida de faixa; nao deixa explorar caracteristicas das tecnologias.",
    proposta: "Trocar por seletor circular de aparelhos com previa da cena e album lateral de tecnologias.",
    decisao: "Reformular",
    impacto: "Introduz gesto de girar e permite comparar usos dentro e fora da escola.",
    prioridade: "Media",
  },
  {
    prefixo: "EF04",
    codigo: "EF04CO04",
    jogo: "Pista Binaria",
    categoria: "Runners repetidos",
    problema: "O runner faz seguir instrucoes; nao evidencia codificacao binaria nem ASCII.",
    proposta: "Usar painel de sete interruptores para montar bits de letras, com visor decimal em tempo real.",
    decisao: "Reformular",
    impacto: "Codificacao passa a acontecer pela mao da crianca e deixa EF04CO05 com pixels/RGB.",
    prioridade: "Alta",
  },
  {
    prefixo: "EF04",
    codigo: "EF04CO03",
    jogo: "Danca Aninhada",
    categoria: "Jogos de ritmo",
    problema: "O aninhamento e narrado; a crianca bate no tempo e responde contagens, mas nao cria o algoritmo.",
    proposta: "Substituir por predio com contadores LAVAR/SUBIR e nivel final de montagem de lacos aninhados.",
    decisao: "Reformular",
    impacto: "Deixa visivel o laco interno zerando dentro do laco externo e inclui iteracoes definidas/indefinidas.",
    prioridade: "Alta",
  },
  {
    prefixo: "EF03",
    codigo: "EF03CO06",
    jogo: "Fase de Entrada e Saida",
    categoria: "Quiz de cartas",
    problema: "Escolher icone nao pratica o sentido entrada/saida; em duas opcoes ha muito acerto por acaso.",
    proposta: "Usar traco direcional: dispositivo para computador na entrada, computador para dispositivo na saida.",
    decisao: "Reformular",
    impacto: "A direcao do gesto vira a resposta e reduz ambiguidade pedagogica.",
    prioridade: "Media",
  },
  {
    prefixo: "EF05",
    codigo: "EF05CO03",
    jogo: "Portoes Logicos",
    categoria: "Quiz de cartas",
    problema: "Hoje julga verdadeiro/falso como no 3o ano, mas a habilidade pede operar e combinar sentencas.",
    proposta: "Arrastar frases umas sobre as outras com conectores E/OU e toque longo para aplicar NAO.",
    decisao: "Reformular",
    impacto: "Mostra parcelas e resultado da operacao logica, cobrindo tambem o EF15CO03.",
    prioridade: "Alta",
  },
  {
    prefixo: "EF05",
    codigo: "EF05CO04",
    jogo: "Robo Sorrateiro",
    categoria: "Quiz de cartas",
    problema: "Escolhe cartas condicionais prontas e regride frente ao Cidade das Decisoes ja implementado.",
    proposta: "Voltar a encaixar slots SE, ENTAO e SENAO; testar a mesma regra em cenarios diferentes.",
    decisao: "Reformular",
    impacto: "A crianca escreve uma regra geral em vez de decidir caso a caso.",
    prioridade: "Alta",
  },
  {
    prefixo: "EF05",
    codigo: "EF05CO09",
    jogo: "A Guilda dos Criadores",
    categoria: "Quiz de cartas",
    problema: "Tres cartas de atitude sao mais rasas que preencher credito e licenca de uma obra.",
    proposta: "Manter Curadoria com Creditos; garantir imagem, musica, video e texto com obras ficticias.",
    decisao: "Manter existente",
    impacto: "Sem custo de desenvolvimento e com melhor aplicacao de direitos autorais.",
    prioridade: "Media",
  },
  {
    prefixo: "EF05",
    codigo: "EF05CO011",
    jogo: "Kit do Solucionador",
    categoria: "Quiz de cartas",
    problema: "Uma carta certa nao explicita os diferentes criterios exigidos pela habilidade.",
    proposta: "Manter Escolha a Ferramenta Certa com balanca e chips de criterio.",
    decisao: "Manter existente",
    impacto: "Torna visivel a decisao multicriterio; padronizar internamente como EF05CO11 se desejado.",
    prioridade: "Media",
  },
  {
    prefixo: "EF05",
    codigo: "EF05CO06",
    jogo: "Arremesso na Nuvem",
    categoria: "Par binario",
    problema: "Duas cestas excluem armazenamento removivel e nao permitem backup em mais de um destino.",
    proposta: "Usar triagem direcional: esquerda local, cima removivel, direita nuvem; nivel 3 com dois destinos.",
    decisao: "Reformular",
    impacto: "Inclui as tres categorias oficiais e abre espaco para conceito de backup.",
    prioridade: "Alta",
  },
];

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Resumo");
const proposals = workbook.worksheets.add("Propostas");

summary.showGridLines = false;
proposals.showGridLines = false;

summary.getRange("A1:F1").merge();
summary.getRange("A1").values = [["Revisao resumida do catalogo v3"]];
summary.getRange("A2:F2").merge();
summary.getRange("A2").values = [["Jogos duplicados, problemas pedagogicos e propostas de substituicao por prefixo EF."]];

summary.getRange("A4:D4").values = [["Prefixo", "Cor", "Qtd.", "Encaminhamento principal"]];
const prefixOrder = ["EF01", "EF02", "EF03", "EF04", "EF05", "EF15"];
const summaryRows = prefixOrder.map((prefix) => [
  prefix,
  prefixStyles[prefix].label,
  null,
  {
    EF01: "Sem item alterado nesta revisao; aparece apenas como comparacao.",
    EF02: "Reformular o runner para comparacao exploratoria de tecnologias.",
    EF03: "Trocar escolha de icone por gesto direcional de entrada/saida.",
    EF04: "Remover repeticoes de runner/ritmo e alinhar binario, lacos e pixels.",
    EF05: "Concentrar logica, condicionais, direitos, criterios e armazenamento.",
    EF15: "Tratar como bloco consolidado; descartar duplicacoes literais quando couber.",
  }[prefix],
]);
summary.getRange(`A5:D${4 + summaryRows.length}`).values = summaryRows;
summary.getRange("C5:C10").formulas = prefixOrder.map((prefix) => [`=COUNTIF('Propostas'!$A$2:$A$14,"${prefix}")`]);

summary.getRange("A13:B17").values = [
  ["Indicador", "Valor"],
  ["Itens principais revisados", null],
  ["Reformular", null],
  ["Manter jogo existente", null],
  ["Descartar / cobrir por outro jogo", null],
];
summary.getRange("B14").formulas = [["=COUNTA('Propostas'!$B$2:$B$14)"]];
summary.getRange("B15").formulas = [["=COUNTIF('Propostas'!$G$2:$G$14,\"Reformular\")"]];
summary.getRange("B16").formulas = [["=COUNTIF('Propostas'!$G$2:$G$14,\"Manter existente\")"]];
summary.getRange("B17").formulas = [["=COUNTIF('Propostas'!$G$2:$G$14,\"Descartar / cobrir\")"]];

summary.getRange("A20:F20").merge();
summary.getRange("A20").values = [["Nota: EF05CO011 foi mantido como aparece no texto-fonte; a observacao da linha recomenda padronizar para EF05CO11 internamente se for melhor para catalogacao."]];

const headers = ["Prefixo", "Codigo", "Jogo", "Categoria", "Problema resumido", "Proposta resumida", "Decisao", "Impacto", "Prioridade"];
const data = rows.map((row) => [
  row.prefixo,
  row.codigo,
  row.jogo,
  row.categoria,
  row.problema,
  row.proposta,
  row.decisao,
  row.impacto,
  row.prioridade,
]);
proposals.getRange("A1:I1").values = [headers];
proposals.getRange(`A2:I${1 + data.length}`).values = data;

const headerFill = "#111827";
for (const sheet of [summary, proposals]) {
  sheet.getRange("A1:F1").format = {
    fill: headerFill,
    font: { bold: true, color: "#FFFFFF", size: 16 },
  };
  sheet.getRange("A2:F2").format = {
    fill: "#E5E7EB",
    font: { color: "#374151", italic: true },
  };
}

summary.getRange("A4:D4").format = { fill: "#374151", font: { bold: true, color: "#FFFFFF" } };
summary.getRange("A13:B13").format = { fill: "#374151", font: { bold: true, color: "#FFFFFF" } };
summary.getRange("A20:F20").format = { fill: "#FEF3C7", font: { color: "#78350F" }, wrapText: true };
summary.getRange("A4:D17").format.borders = { preset: "all", style: "thin", color: "#D1D5DB" };

for (let i = 0; i < prefixOrder.length; i += 1) {
  const rowIndex = 5 + i;
  const prefix = prefixOrder[i];
  const style = prefixStyles[prefix];
  summary.getRange(`A${rowIndex}:D${rowIndex}`).format = { fill: style.light, wrapText: true };
  summary.getRange(`A${rowIndex}:B${rowIndex}`).format = {
    fill: style.dark,
    font: { bold: true, color: style.text },
  };
}

proposals.getRange("A1:I1").format = { fill: headerFill, font: { bold: true, color: "#FFFFFF" } };
proposals.getRange(`A1:I${1 + data.length}`).format.borders = { preset: "all", style: "thin", color: "#D1D5DB" };
proposals.getRange(`A2:I${1 + data.length}`).format = { wrapText: true };

for (let i = 0; i < rows.length; i += 1) {
  const rowNumber = i + 2;
  const style = prefixStyles[rows[i].prefixo];
  proposals.getRange(`A${rowNumber}:I${rowNumber}`).format = { fill: style.light, wrapText: true };
  proposals.getRange(`A${rowNumber}:B${rowNumber}`).format = {
    fill: style.dark,
    font: { bold: true, color: style.text },
  };
  if (rows[i].prioridade === "Alta") {
    proposals.getRange(`I${rowNumber}`).format = { fill: "#F97316", font: { bold: true, color: "#FFFFFF" } };
  }
}

proposals.getRange("A1:I1").format.rowHeightPx = 28;
proposals.getRange("A2:I14").format.rowHeightPx = 68;
summary.getRange("A1:F1").format.rowHeightPx = 30;
summary.getRange("A5:D10").format.rowHeightPx = 42;
summary.getRange("A20:F20").format.rowHeightPx = 48;

summary.getRange("A:A").format.columnWidthPx = 86;
summary.getRange("B:B").format.columnWidthPx = 90;
summary.getRange("C:C").format.columnWidthPx = 60;
summary.getRange("D:D").format.columnWidthPx = 430;
summary.getRange("E:F").format.columnWidthPx = 80;

proposals.getRange("A:A").format.columnWidthPx = 72;
proposals.getRange("B:B").format.columnWidthPx = 86;
proposals.getRange("C:C").format.columnWidthPx = 150;
proposals.getRange("D:D").format.columnWidthPx = 126;
proposals.getRange("E:E").format.columnWidthPx = 255;
proposals.getRange("F:F").format.columnWidthPx = 270;
proposals.getRange("G:G").format.columnWidthPx = 120;
proposals.getRange("H:H").format.columnWidthPx = 245;
proposals.getRange("I:I").format.columnWidthPx = 84;

summary.freezePanes.freezeRows(4);
proposals.freezePanes.freezeRows(1);

proposals.tables.add(`A1:I${1 + data.length}`, true, "TabelaPropostas");

const inspectProposals = await workbook.inspect({
  kind: "table",
  range: "Propostas!A1:I14",
  include: "values,formulas",
  tableMaxRows: 14,
  tableMaxCols: 9,
  maxChars: 6000,
});
console.log(inspectProposals.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const previewSummary = await workbook.render({ sheetName: "Resumo", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(`${outputDir}/preview_resumo.png`, new Uint8Array(await previewSummary.arrayBuffer()));

const previewProposals = await workbook.render({ sheetName: "Propostas", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(`${outputDir}/preview_propostas.png`, new Uint8Array(await previewProposals.arrayBuffer()));

await fs.mkdir(outputDir, { recursive: true });
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(`SAVED ${outputPath}`);
