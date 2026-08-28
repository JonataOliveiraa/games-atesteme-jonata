import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { lerCatalogo, RAIZ } from "./catalogo.mjs";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O CATÁLOGO PUBLICADO — `dist/catalog.json`
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A plataforma precisa de nome, frase e capa para desenhar o card do jogo. Essa
 * informação nasce aqui, no `catalog.ts`, e é mantida por quem faz os jogos.
 *
 * A alternativa seria recadastrá-la do outro lado: dezenas de nomes e frases
 * digitados à mão, que divergem no primeiro rename e ninguém percebe — o card
 * continua anunciando um jogo com o nome antigo. Publicando um arquivo estático,
 * a fonte continua sendo uma só.
 *
 * ── POR QUE É UM ARQUIVO, E NÃO UM ENDEREÇO DE API ───────────────────────
 *
 * O site é estático. Um JSON ao lado do `index.html` é servido pelo mesmo CDN,
 * cacheia igual e não acrescenta nada para manter. Ele é gerado no build, então
 * não existe estado a sincronizar: o que está no ar é o que está no catálogo.
 *
 * ── O QUE ENTRA ──────────────────────────────────────────────────────────
 *
 * Só o que a plataforma usa para montar o card. Nada de dados internos do jogo:
 * este arquivo é público e lido por outro sistema, então cada campo aqui é um
 * compromisso que passa a ter que ser mantido.
 */

const DIST = resolve(RAIZ, "dist");
const DESTINO = resolve(DIST, "catalog.json");

const SITE = (process.env.VITE_SITE_URL || "https://games.atesteme.com").replace(/\/+$/, "");

if (!existsSync(DIST)) {
  throw new Error("dist/ não existe. Rode `vite build` antes deste script.");
}

const jogos = lerCatalogo();

const catalogo = {
  /*
   * Versão do formato. Se um campo mudar de significado, a plataforma consegue
   * reconhecer o que está lendo em vez de interpretar errado em silêncio.
   */
  version: 1,
  generatedFrom: "src/data/catalog.ts",
  games: jogos.map((jogo) => ({
    id: jogo.id,
    slug: jogo.slug,
    title: jogo.title,
    description: jogo.description,
    /** Endereço para embutir. Sem parâmetros: eles pertencem a cada tentativa. */
    url: `${SITE}/jogos/${jogo.slug}`,
    /** A mesma imagem da prévia de link — uma por jogo, já publicada em /og. */
    cover: `${SITE}/og/${jogo.slug}.jpg`,
  })),
};

writeFileSync(DESTINO, `${JSON.stringify(catalogo, null, 2)}\n`, "utf8");

console.log(
  `Catálogo publicado: dist/catalog.json com ${catalogo.games.length} jogos.` +
    `\nEndereço usado: ${SITE}  (mude com VITE_SITE_URL)`,
);
