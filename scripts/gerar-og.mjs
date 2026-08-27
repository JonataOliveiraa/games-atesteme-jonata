import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { lerCatalogo, RAIZ } from "./catalogo.mjs";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS IMAGENS DE COMPARTILHAMENTO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Gera `public/og/<slug>.jpg` a partir da capa de cada jogo.
 *
 * ── POR QUE NÃO USAR A CAPA DIRETO ───────────────────────────────────────
 *
 * As capas são PNG de 1672x941 com cerca de 2 MB. O WhatsApp desiste da
 * prévia quando a imagem passa de uns 300 KB — e "desiste" quer dizer que o
 * link aparece sem imagem nenhuma, sem erro, sem aviso. Um JPEG de 1200x630
 * fica na casa das dezenas de KB e é o formato que as prévias esperam.
 *
 * ── POR QUE ISTO NÃO RODA NO BUILD ───────────────────────────────────────
 *
 * Redimensionar imagem exige `sharp`, que traz binário nativo por plataforma
 * — a mesma família de dependência que acabou de quebrar o `npm ci` na
 * integração contínua. Manter isso fora do caminho do build é de propósito.
 *
 * Então este script roda À MÃO, e o resultado é COMMITADO em `public/og/`. O
 * build só copia. Rode de novo quando uma capa mudar:
 *
 *     npm install --no-save sharp
 *     node scripts/gerar-og.mjs
 *
 * Sem `sharp` instalado ele avisa e sai sem quebrar nada.
 */

/** O tamanho que as prévias esperam. */
const LARGURA = 1200;
const ALTURA = 630;

/** Qualidade do JPEG: 82 é onde a diferença para de ser visível. */
const QUALIDADE = 82;

/** Acima disto o WhatsApp costuma ignorar a imagem. */
const LIMITE_KB = 300;

const DESTINO = resolve(RAIZ, "public/og");

async function carregarSharp() {
  try {
    return (await import("sharp")).default;
  } catch {
    console.error(
      "\n`sharp` não está instalado — ele não é dependência do projeto de\n" +
        "propósito (binário nativo por plataforma quebra o `npm ci`).\n\n" +
        "Para gerar as imagens:\n\n" +
        "    npm install --no-save sharp\n" +
        "    node scripts/gerar-og.mjs\n"
    );
    return null;
  }
}

const kb = (bytes) => Math.round(bytes / 1024);

async function main() {
  const sharp = await carregarSharp();
  if (!sharp) process.exit(1);

  const jogos = lerCatalogo();
  mkdirSync(DESTINO, { recursive: true });

  console.log(`Gerando ${jogos.length} imagens em public/og/\n`);

  let maiorQueOLimite = 0;

  for (const jogo of jogos) {
    const saida = resolve(DESTINO, `${jogo.slug}.jpg`);

    /*
     * `cover` recorta o excesso em vez de deformar. As capas são 1.78:1 e o
     * alvo é 1.90:1, então o que sai é uma faixa fina de cima e de baixo —
     * e é justamente ali que as capas não têm nada importante.
     */
    await sharp(readFileSync(jogo.capa))
      .resize(LARGURA, ALTURA, { fit: "cover", position: "centre" })
      .jpeg({ quality: QUALIDADE, mozjpeg: true })
      .toFile(saida);

    const tamanho = kb(readFileSync(saida).length);
    if (tamanho > LIMITE_KB) maiorQueOLimite++;

    const alerta = tamanho > LIMITE_KB ? `  ⚠ acima de ${LIMITE_KB} KB` : "";
    console.log(`  ${jogo.slug.padEnd(34)} ${String(tamanho).padStart(4)} KB${alerta}`);
  }

  /*
   * Uma imagem genérica para as telas que não são de um jogo (a home, o
   * ranking). Sem ela, colar o link da raiz no WhatsApp não mostra nada.
   */
  const generica = resolve(DESTINO, "site.jpg");
  if (!existsSync(generica)) {
    const primeira = jogos[0];
    await sharp(readFileSync(primeira.capa))
      .resize(LARGURA, ALTURA, { fit: "cover", position: "centre" })
      .jpeg({ quality: QUALIDADE, mozjpeg: true })
      .toFile(generica);
    console.log(`\n  site.jpg (genérica, a partir de ${primeira.slug})`);
  }

  console.log(`\n${jogos.length} imagens geradas.`);

  if (maiorQueOLimite > 0) {
    console.log(
      `\n⚠ ${maiorQueOLimite} passaram de ${LIMITE_KB} KB. O WhatsApp pode ` +
        `ignorar a prévia delas — baixe a QUALIDADE e rode de novo.`
    );
  }

  console.log("\nCommite `public/og/` junto: o build só copia, não gera.");
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
