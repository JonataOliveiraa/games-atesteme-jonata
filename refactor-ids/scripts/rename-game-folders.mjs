#!/usr/bin/env node
/**
 * Renomeia as pastas dos jogos de <CODIGO_DA_SKILL> para <id>-<slug>.
 *
 *   src/games/EF01CO01/         -> src/games/001-base-dos-classificadores/
 *   src/assets/games/EF01CO01/  -> src/assets/games/001-base-dos-classificadores/
 *
 * Motivo: o código da skill virou TAG. Vários jogos podem ter a mesma tag,
 * então ele não serve mais de nome de pasta — nome de pasta precisa ser
 * único por jogo.
 *
 * O script faz três coisas:
 *   1. git mv das pastas em src/games e src/assets/games
 *   2. reescreve todo caminho "games/<CODIGO>" em src/**
 *   3. reescreve todo module: "<CODIGO>" em src/**
 *
 * Uso:
 *   node scripts/rename-game-folders.mjs --dry    # só mostra o que faria
 *   node scripts/rename-game-folders.mjs          # aplica
 *
 * Rode com a árvore de git limpa. Se algo der errado: git checkout .
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const DRY = process.argv.includes("--dry");

const MAP = {
  EF01CO01: "001-base-dos-classificadores",
  EF01CO02: "002-trilha-do-passo-a-passo",
  EF01CO03: "003-oficina-dos-algoritmos",
  EF01CO04: "004-correio-multimidia",
  EF01CO05: "005-pixel-secreto",
  EF01CO06: "006-desktop-digital-infantil",
  EF01CO07: "007-guardioes-dos-dados",
  EF02CO01: "008-hangar-dos-modelos",
  EF02CO02: "009-desfile-do-robo-repetidor",
  EF02CO03: "010-fabrica-de-maquinas",
  EF02CO04: "011-museu-vivo-do-computador",
  EF02CO05: "012-cidade-das-tecnologias",
  EF02CO06: "013-checklist-do-jogador-seguro",
  EF03CO01: "014-tribunal-do-verdadeiro-ou-falso",
  EF03CO02: "015-labirinto-do-enquanto",
  EF03CO03: "016-chef-dos-subproblemas",
  EF03CO04: "017-montador-de-informacoes",
  EF03CO05: "018-formato-certo",
  EF03CO06: "019-central-de-entrada-e-saida",
  EF03CO07: "020-detetives-da-busca",
  EF03CO08: "021-estudio-multiformato",
  EF03CO09: "022-investigacao-dados-risco",
  EF04CO01: "023-batalha-das-coordenadas",
  EF04CO02: "024-arquivo-dos-registros",
  EF04CO03: "025-predio-dos-lacos",
  EF04CO04: "026-tradutor-da-maquina",
  EF04CO05: "027-atelier-codigos-digitais",
  EF04CO06: "028-estudio-producao-digital",
  EF04CO07: "029-missao-etica-digital",
  EF04CO08: "030-caca-fonte-confiavel",
  EF05CO01: "031-baralho-das-listas",
  EF05CO02: "032-mapas-em-rede",
  EF05CO03: "033-arena-da-logica",
  EF05CO04: "034-cidade-das-decisoes",
  EF05CO05: "035-monte-seu-computador",
  EF05CO06: "036-missao-arquivo-seguro",
  EF05CO07: "037-sistema-operacional",
  EF05CO08: "038-radar-de-confiabilidade",
  EF05CO09: "039-curadoria-com-creditos",
  EF05CO10: "040-futuro-em-cena",
  EF05CO11: "041-escolha-a-ferramenta-certa",
  EF15CO01: "042-museu-das-estruturas",
  EF15CO02: "043-academia-dos-algoritmos",
  EF15CO03: "044-circuito-da-verdade",
  EF15CO04: "045-arquiteto-das-missoes",
};

const ROOTS = ["src/games", "src/assets/games"];
const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".json", ".html"]);

function gitMv(from, to) {
  if (!existsSync(from)) {
    console.warn(`  ~ pulando (não existe): ${from}`);
    return false;
  }
  if (existsSync(to)) {
    console.warn(`  ! destino já existe, pulando: ${to}`);
    return false;
  }

  console.log(`  ${from}  ->  ${to}`);
  if (!DRY) execFileSync("git", ["mv", from, to], { stdio: "inherit" });
  return true;
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git") continue; 
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

// ─── 1. renomear as pastas ───────────────────────────────────────
console.log(DRY ? "\n[DRY RUN] renomeando pastas\n" : "\nRenomeando pastas\n");

let moved = 0;
for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  console.log(`${root}/`);
  for (const [oldName, newName] of Object.entries(MAP)) {
    if (gitMv(join(root, oldName), join(root, newName))) moved++;
  }
}

// ─── 2 e 3. reescrever as referências ────────────────────────────
console.log(DRY ? "\n[DRY RUN] reescrevendo referências\n" : "\nReescrevendo referências\n");

let touched = 0;

for (const file of walk("src")) {
  if (!TEXT_EXT.has(extname(file))) continue;

  const before = readFileSync(file, "utf8");
  let after = before;

  for (const [oldName, newName] of Object.entries(MAP)) {
    // caminhos de asset e de import: .../games/EF01CO01/...
    after = after.split(`games/${oldName}/`).join(`games/${newName}/`);
    // o campo module do catálogo
    after = after.split(`module: "${oldName}"`).join(`module: "${newName}"`);
    after = after.split(`module: '${oldName}'`).join(`module: '${newName}'`);
  }

  if (after !== before) {
    console.log(`  ${file}`);
    if (!DRY) writeFileSync(file, after, "utf8");
    touched++;
  }
}

console.log(
  `\n${DRY ? "[DRY RUN] " : ""}${moved} pasta(s), ${touched} arquivo(s).\n`
);

if (!DRY) {
  console.log("Confira antes de commitar:");
  console.log("  git status");
  console.log("  npx tsc --noEmit");
  console.log("  npm run dev\n");
  console.log("As tags EF01CO01... continuam intactas no campo skills[] do catálogo.\n");
}
