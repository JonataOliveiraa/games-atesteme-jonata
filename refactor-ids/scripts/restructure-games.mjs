#!/usr/bin/env node
/**
 * Reestrutura as pastas dos jogos, aninhando o jogo dentro da habilidade:
 *
 *   src/games/EF01CO01/          -> src/games/EF01CO01/base-dos-classificadores/
 *   src/assets/games/EF01CO01/   -> src/assets/games/EF01CO01/base-dos-classificadores/
 *
 * Motivo: o código da habilidade virou TAG. Uma habilidade pode ter vários
 * jogos, então ela deixa de servir como nome da pasta do jogo — passa a ser
 * a pasta que AGRUPA os jogos daquela habilidade.
 *
 * ─── por que isto não é um find & replace ────────────────────────────────
 *
 * Ao descer um nível, TODO import relativo que sai da pasta do jogo precisa
 * de mais um "../". Não é só asset:
 *
 *   antes:  src/games/EF01CO01/scenes/GameScene.ts
 *           import { EventBus } from "../../../shared/EventBus"
 *
 *   depois: src/games/EF01CO01/base-dos-classificadores/scenes/GameScene.ts
 *           import { EventBus } from "../../../../shared/EventBus"
 *
 * Trocar string não resolve isso. O script resolve cada especificador
 * relativo até o caminho absoluto de destino, aplica o mapa de movimentação
 * nesse destino, e recalcula o caminho relativo a partir da nova posição do
 * arquivo. É correto por construção, independente da profundidade.
 *
 * ─── uso ─────────────────────────────────────────────────────────────────
 *
 *   node scripts/restructure-games.mjs --dry    # só mostra o que faria
 *   node scripts/restructure-games.mjs          # aplica
 *
 * Rode a partir da raiz do projeto, com a árvore do git limpa.
 * Se algo der errado:  git checkout . && git clean -fd
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry");
const ROOT = process.cwd();

/** habilidade -> slug do jogo (nome da subpasta nova) */
const MAP = {
  EF01CO01: "base-dos-classificadores",
  EF01CO02: "trilha-do-passo-a-passo",
  EF01CO03: "oficina-dos-algoritmos",
  EF01CO04: "correio-multimidia",
  EF01CO05: "pixel-secreto",
  EF01CO06: "desktop-digital-infantil",
  EF01CO07: "guardioes-dos-dados",
  EF02CO01: "hangar-dos-modelos",
  EF02CO02: "desfile-do-robo-repetidor",
  EF02CO03: "fabrica-de-maquinas",
  EF02CO04: "museu-vivo-do-computador",
  EF02CO05: "cidade-das-tecnologias",
  EF02CO06: "checklist-do-jogador-seguro",
  EF03CO01: "tribunal-do-verdadeiro-ou-falso",
  EF03CO02: "labirinto-do-enquanto",
  EF03CO03: "chef-dos-subproblemas",
  EF03CO04: "montador-de-informacoes",
  EF03CO05: "formato-certo",
  EF03CO06: "central-de-entrada-e-saida",
  EF03CO07: "detetives-da-busca",
  EF03CO08: "estudio-multiformato",
  EF03CO09: "investigacao-dados-risco",
  EF04CO01: "batalha-das-coordenadas",
  EF04CO02: "arquivo-dos-registros",
  EF04CO03: "predio-dos-lacos",
  EF04CO04: "tradutor-da-maquina",
  EF04CO05: "atelier-codigos-digitais",
  EF04CO06: "estudio-producao-digital",
  EF04CO07: "missao-etica-digital",
  EF04CO08: "caca-fonte-confiavel",
  EF05CO01: "baralho-das-listas",
  EF05CO02: "mapas-em-rede",
  EF05CO03: "arena-da-logica",
  EF05CO04: "cidade-das-decisoes",
  EF05CO05: "monte-seu-computador",
  EF05CO06: "missao-arquivo-seguro",
  EF05CO07: "sistema-operacional",
  EF05CO08: "radar-de-confiabilidade",
  EF05CO09: "curadoria-com-creditos",
  EF05CO10: "futuro-em-cena",
  EF05CO11: "escolha-a-ferramenta-certa",
  EF15CO01: "museu-das-estruturas",
  EF15CO02: "academia-dos-algoritmos",
  EF15CO03: "circuito-da-verdade",
  EF15CO04: "arquiteto-das-missoes",
};

const PARENTS = ["src/games", "src/assets/games"];
const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".json", ".html"]);

/* ─────────────────────────────────── mapa de movimentação ────────── */

/** [{ from: abs, to: abs }] — from é sempre a pasta ANTIGA (pré-move) */
const moves = [];

for (const parent of PARENTS) {
  for (const [skill, slug] of Object.entries(MAP)) {
    const from = path.join(ROOT, parent, skill);
    if (!existsSync(from)) continue;
    moves.push({ from, to: path.join(from, slug) });
  }
}

/** caminho absoluto ANTIGO -> caminho absoluto NOVO */
function toNew(absOld) {
  for (const { from, to } of moves) {
    if (absOld === from) return to;
    if (absOld.startsWith(from + path.sep)) {
      return to + absOld.slice(from.length);
    }
  }
  return absOld;
}

/** caminho absoluto NOVO -> caminho absoluto ANTIGO */
function toOld(absNew) {
  for (const { from, to } of moves) {
    if (absNew === to) return from;
    if (absNew.startsWith(to + path.sep)) {
      return from + absNew.slice(to.length);
    }
  }
  return absNew;
}

/* ──────────────────────────────────────── 1. mover pastas ────────── */

console.log(DRY ? "\n[DRY RUN] 1/2 movendo pastas\n" : "\n1/2 movendo pastas\n");

let movedCount = 0;

for (const { from, to } of moves) {
  const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");

  if (existsSync(to)) {
    console.warn(`  ! já aninhado, pulando: ${rel(to)}`);
    continue;
  }

  console.log(`  ${rel(from)}/  ->  ${rel(to)}/`);
  movedCount++;

  if (DRY) continue;

  // git mv não move uma pasta para dentro dela mesma; passa pelo temporário.
  const tmp = path.join(path.dirname(from), `__tmp__${path.basename(from)}`);

  execFileSync("git", ["mv", rel(from), rel(tmp)], { stdio: "inherit", cwd: ROOT });
  mkdirSync(from, { recursive: true });
  execFileSync("git", ["mv", rel(tmp), rel(to)], { stdio: "inherit", cwd: ROOT });
}

/* ───────────────────────────── 2. recalcular os imports ──────────── */

console.log(DRY ? "\n[DRY RUN] 2/2 recalculando imports\n" : "\n2/2 recalculando imports\n");

const PATTERNS = [
  /(\bfrom\s*)(['"])(\.\.?\/[^'"]*)(\2)/g,          // import x from "../y"
  /(\bimport\s*\(\s*)(['"])(\.\.?\/[^'"]*)(\2)/g,   // import("../y")
  /(\brequire\s*\(\s*)(['"])(\.\.?\/[^'"]*)(\2)/g,  // require("../y")
  /(\bimport\s+)(['"])(\.\.?\/[^'"]*)(\2)/g,        // import "../y.css"
  /(\burl\(\s*)(['"]?)(\.\.?\/[^'")]*)(\2)/g,       // css: url("../y.png")
];

function* walk(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git") continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

function rewriteSpecifier(spec, oldFileDir, newFileDir) {
  // 1. onde esse import apontava, em absoluto, ANTES do move
  const oldTarget = path.resolve(oldFileDir, spec);
  // 2. para onde esse alvo foi
  const newTarget = toNew(oldTarget);
  // 3. como chegar lá a partir da nova posição do arquivo
  let next = path.relative(newFileDir, newTarget).split(path.sep).join("/");
  if (!next.startsWith(".")) next = "./" + next;
  return next;
}

/**
 * Intervalos [início, fim) que são comentário.
 *
 * Sem isto o script reescreve caminhos citados em comentário e JSDoc, do tipo
 *   // import { games } from "../data/games"
 * O que não quebra o build, mas suja documentação — e um script de migração
 * que mexe onde não devia não merece confiança.
 *
 * Scanner simples de estado: código / string / template / comentário.
 * Não é um parser de verdade, mas cobre TS, JS e CSS com folga.
 */
function commentRanges(src) {
  const ranges = [];
  let i = 0;
  const n = src.length;

  while (i < n) {
    const c = src[i];
    const next = src[i + 1];

    // comentário de linha
    if (c === "/" && next === "/") {
      const start = i;
      while (i < n && src[i] !== "\n") i++;
      ranges.push([start, i]);
      continue;
    }

    // comentário de bloco (cobre /* */ e /** */ do JSDoc, e o de CSS)
    if (c === "/" && next === "*") {
      const start = i;
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i = Math.min(i + 2, n);
      ranges.push([start, i]);
      continue;
    }

    // string ou template: pular inteira, para não confundir // dentro de "http://"
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      i++;
      while (i < n) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === quote) { i++; break; }
        if (quote !== "`" && src[i] === "\n") break; // string não fechada
        i++;
      }
      continue;
    }

    i++;
  }

  return ranges;
}

function makeIsInComment(src) {
  const ranges = commentRanges(src);
  return (offset) => ranges.some(([a, b]) => offset >= a && offset < b);
}

let touched = 0;

for (const newFile of walk(path.join(ROOT, "src"))) {
  if (!TEXT_EXT.has(path.extname(newFile))) continue;

  const oldFile = toOld(newFile);
  const oldDir = path.dirname(oldFile);
  const newDir = path.dirname(newFile);

  const before = readFileSync(newFile, "utf8");
  const isInComment = makeIsInComment(before);

  /* Coleta TODAS as edições sobre o texto original, e só depois aplica,
     de trás para frente. Fazer 5 passes encadeados de .replace() invalidaria
     os offsets: a partir do segundo pass, a posição informada seria relativa
     ao texto já alterado, e a checagem de comentário apontaria para o lugar
     errado. Aplicar em ordem decrescente mantém todo offset válido. */
  const edits = [];

  for (const pattern of PATTERNS) {
    for (const m of before.matchAll(pattern)) {
      const [, head, q1, spec] = m;
      const matchStart = m.index;

      if (isInComment(matchStart)) continue;

      const next = rewriteSpecifier(spec, oldDir, newDir);
      if (next === spec) continue;

      const specStart = matchStart + head.length + q1.length;
      edits.push({ start: specStart, end: specStart + spec.length, next });
    }
  }

  if (edits.length === 0) continue;

  edits.sort((a, b) => b.start - a.start);

  let after = before;
  let lastStart = Infinity;

  for (const { start, end, next } of edits) {
    if (end > lastStart) continue; // sobreposição entre padrões: ignora a 2ª
    after = after.slice(0, start) + next + after.slice(end);
    lastStart = start;
  }

  if (after !== before) {
    const rel = path.relative(ROOT, newFile).split(path.sep).join("/");
    console.log(`  ${rel}  (${edits.length} import${edits.length > 1 ? "s" : ""})`);
    if (!DRY) writeFileSync(newFile, after, "utf8");
    touched++;
  }
}

/* ────────────────────────────────────────────── resumo ───────────── */

console.log(
  `\n${DRY ? "[DRY RUN] " : ""}${movedCount} pasta(s) movida(s), ` +
    `${touched} arquivo(s) reescrito(s).\n`
);

if (DRY) {
  console.log("Nada foi alterado. Rode sem --dry para aplicar.\n");
} else {
  console.log("Confira antes de commitar:");
  console.log("  git status");
  console.log("  npx tsc --noEmit");
  console.log("  npm run dev\n");
  console.log("As habilidades EF01CO01... continuam sendo o nome da pasta-mãe,");
  console.log("e agora agrupam os jogos em vez de identificá-los.\n");
}
