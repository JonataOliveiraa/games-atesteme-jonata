import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O CATÁLOGO, LIDO DE FORA DO BUNDLE
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Os scripts de build precisam do slug, do título, da descrição e do caminho
 * da capa de cada jogo. Essa informação já existe em `src/data/catalog.ts` —
 * mas o Node não consegue importar aquele arquivo: ele é TypeScript e importa
 * PNGs, coisa que só o Vite resolve.
 *
 * Então este módulo LÊ o arquivo como texto e extrai o que precisa. É frágil
 * por natureza, e por isso ele grita: se o número de jogos não bater com o de
 * capas, ou se vier zero, o build para. Um catálogo mal lido em silêncio viraria
 * link de WhatsApp sem imagem, e ninguém descobriria até alguém colar um.
 */

const AQUI = dirname(fileURLToPath(import.meta.url));
export const RAIZ = resolve(AQUI, "..");

const CATALOGO = resolve(RAIZ, "src/data/catalog.ts");

/** `import nomeDaVariavel from "../assets/games/…png"` */
function lerImportacoes(fonte) {
  const mapa = new Map();
  const re = /import\s+(\w+)\s+from\s+"(\.\.\/assets\/[^"]+)"/g;

  for (const [, nome, caminho] of fonte.matchAll(re)) {
    // o caminho é relativo a `src/data/`, onde o catálogo mora
    mapa.set(nome, resolve(RAIZ, "src/data", caminho));
  }

  return mapa;
}

/**
 * Recorta o valor de um campo dentro de um bloco de objeto.
 *
 * A descrição costuma estar quebrada em várias linhas, com a string começando
 * na linha seguinte ao rótulo — daí o `[\s\S]` e o cuidado com as aspas
 * escapadas.
 */
function campo(bloco, nome) {
  const re = new RegExp(`${nome}:\\s*\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const achado = bloco.match(re);
  return achado ? achado[1].replace(/\\"/g, '"') : null;
}

export function lerCatalogo() {
  const fonte = readFileSync(CATALOGO, "utf8");
  const importacoes = lerImportacoes(fonte);

  /*
   * Cada entrada começa em `id: "NNN"` e vai até o próximo `id:` (ou o fim).
   * Fatiar assim evita depender da indentação exata ou da ordem dos campos.
   */
  const inicios = [...fonte.matchAll(/^ {4}id: "(\d+)",$/gm)];

  const jogos = inicios.map((inicio, i) => {
    const de = inicio.index;
    const ate = i + 1 < inicios.length ? inicios[i + 1].index : fonte.length;
    const bloco = fonte.slice(de, ate);

    const variavelDaCapa = bloco.match(/thumbnail:\s*(\w+)/)?.[1] ?? null;

    return {
      id: inicio[1],
      slug: campo(bloco, "slug"),
      title: campo(bloco, "title"),
      description: campo(bloco, "description"),
      capa: variavelDaCapa ? importacoes.get(variavelDaCapa) ?? null : null,
    };
  });

  /* ── as conferências que impedem uma falha silenciosa ──────────────── */

  if (jogos.length === 0) {
    throw new Error(
      "catalog.ts: nenhum jogo reconhecido. O formato do arquivo mudou e este " +
        "leitor precisa acompanhar."
    );
  }

  const incompletos = jogos.filter(
    (j) => !j.slug || !j.title || !j.description || !j.capa
  );

  if (incompletos.length > 0) {
    const lista = incompletos
      .map((j) => `  ${j.id} ${j.slug ?? "(sem slug)"}: faltou ${
        [
          !j.slug && "slug",
          !j.title && "title",
          !j.description && "description",
          !j.capa && "thumbnail",
        ]
          .filter(Boolean)
          .join(", ")
      }`)
      .join("\n");

    throw new Error(`catalog.ts: ${incompletos.length} entrada(s) incompleta(s):\n${lista}`);
  }

  return jogos;
}
