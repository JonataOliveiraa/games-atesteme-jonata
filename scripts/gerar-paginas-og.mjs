import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { lerCatalogo, RAIZ } from "./catalogo.mjs";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  UMA PÁGINA HTML POR JOGO, PARA AS PRÉVIAS DE LINK
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Roda depois do `vite build` e escreve `dist/iframe/<slug>/index.html` para
 * cada jogo: o mesmo HTML que o Vite gerou, com as `<meta>` de Open Graph
 * daquele jogo enfiadas no `<head>`.
 *
 * ── POR QUE NÃO DÁ PARA FAZER ISSO NO REACT ──────────────────────────────
 *
 * Porque quem lê essas tags é o robô do WhatsApp, e ele NÃO EXECUTA
 * JAVASCRIPT. Ele baixa o HTML, procura as `<meta>` e vai embora. Uma SPA
 * serve o mesmo `index.html` para toda rota, então qualquer solução que
 * escreva as tags depois — React Helmet e parentes — chega tarde: o robô já
 * foi. O HTML precisa JÁ estar certo quando o servidor responde.
 *
 * ── POR QUE NO BUILD, E NÃO NUMA FUNÇÃO SERVERLESS ───────────────────────
 *
 * Uma função no Vercel resolveria, mas o plano é publicar isto como site
 * estático em S3 + CloudFront, onde função não existe. Gerar no build funciona
 * nos dois, não custa nada em tempo de resposta e não tem o que quebrar em
 * produção.
 *
 * O preço é que os 45 arquivos são cópias do mesmo HTML, com um `<head>`
 * diferente. São alguns KB cada — barato pelo que compra.
 *
 * ── E O ROTEAMENTO CONTINUA FUNCIONANDO ──────────────────────────────────
 *
 * O `vercel.json` manda tudo para `/index.html`, mas o sistema de arquivos é
 * consultado ANTES do rewrite: `/iframe/<slug>` encontra o arquivo gerado aqui
 * e é servido direto. Como o conteúdo é o mesmo `index.html` (mesmos scripts,
 * mesmos caminhos absolutos de asset), o React sobe igual e o React Router
 * resolve a rota no cliente, como sempre.
 */

const DIST = resolve(RAIZ, "dist");

/**
 * O endereço público do site.
 *
 * `og:image` PRECISA ser URL absoluta — o robô do WhatsApp não tem como
 * resolver um caminho relativo, e uma tag com `/og/x.jpg` simplesmente não
 * rende imagem nenhuma. Por isso isto é configurável e tem um padrão explícito.
 */
const SITE = (process.env.VITE_SITE_URL || "https://games.atesteme.com").replace(
  /\/+$/,
  ""
);

const NOME_DO_SITE = "Atesteme Jogos";

/** Escapa o que vai DENTRO de um atributo HTML entre aspas duplas. */
function atributo(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escapa o que vai entre tags (o `<title>`). */
function textoHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function montarTags({ titulo, descricao, url, imagem }) {
  const t = atributo(titulo);
  const d = atributo(descricao);

  return `
    <meta name="description" content="${d}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${atributo(NOME_DO_SITE)}" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:url" content="${atributo(url)}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${atributo(imagem)}" />
    <meta property="og:image:secure_url" content="${atributo(imagem)}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${t}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${atributo(imagem)}" />
`;
}

/**
 * Troca o `<title>` e injeta as tags logo antes do `</head>`.
 *
 * O `<title>` do Vite é o do `index.html` de origem ("plataforma-jogos"), e
 * ele aparece na aba do navegador e em alguns agregadores — trocar aqui é o
 * mesmo trabalho e evita um título errado em dois lugares.
 */
function montarPagina(htmlBase, dados) {
  const comTitulo = htmlBase.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${textoHtml(dados.titulo)}</title>`
  );

  if (!comTitulo.includes("</head>")) {
    throw new Error("dist/index.html não tem </head> — o build mudou de forma.");
  }

  return comTitulo.replace("</head>", `${montarTags(dados)}  </head>`);
}

function main() {
  const entrada = resolve(DIST, "index.html");

  if (!existsSync(entrada)) {
    throw new Error(
      "dist/index.html não existe. Rode `vite build` antes deste script."
    );
  }

  const htmlBase = readFileSync(entrada, "utf8");
  const jogos = lerCatalogo();

  let semImagem = [];

  for (const jogo of jogos) {
    const imagemLocal = resolve(RAIZ, "public/og", `${jogo.slug}.jpg`);
    if (!existsSync(imagemLocal)) semImagem.push(jogo.slug);

    const pagina = montarPagina(htmlBase, {
      titulo: `${jogo.title} — ${NOME_DO_SITE}`,
      descricao: jogo.description,
      url: `${SITE}/iframe/${jogo.slug}`,
      imagem: `${SITE}/og/${jogo.slug}.jpg`,
    });

    /*
     * ── AS DUAS FORMAS, PORQUE CADA SERVIDOR RESOLVE DE UM JEITO ────────
     *
     * Para a URL `/iframe/<slug>`, sem barra no fim, um servidor procura
     * `iframe/<slug>.html` e outro procura `iframe/<slug>/index.html`. Se a
     * forma escrita não for a que aquele servidor procura, o pedido cai no
     * fallback de SPA e a resposta vira o `index.html` genérico — o link
     * funciona, mas a prévia sai com o título e a imagem do site inteiro em
     * vez da do jogo.
     *
     * Foi o que aconteceu no `vite preview`: com barra final vinha a página
     * certa, sem barra vinha a genérica. Como isso só aparece olhando o HTML
     * cru (a tela fica idêntica nos dois casos), é o tipo de erro que passa
     * despercebido até alguém colar um link no WhatsApp.
     *
     * Escrever as duas custa alguns KB e tira a dúvida de todo host.
     */
    const pasta = resolve(DIST, "iframe", jogo.slug);
    mkdirSync(pasta, { recursive: true });
    writeFileSync(resolve(pasta, "index.html"), pagina, "utf8");
    writeFileSync(resolve(DIST, "iframe", `${jogo.slug}.html`), pagina, "utf8");
  }

  /* A raiz também ganha prévia: colar o link do site tem que mostrar algo. */
  writeFileSync(
    entrada,
    montarPagina(htmlBase, {
      titulo: `${NOME_DO_SITE} — jogos de Pensamento Computacional`,
      descricao:
        "Jogos educativos de Pensamento Computacional para o Ensino Fundamental I, alinhados à BNCC.",
      url: `${SITE}/`,
      imagem: `${SITE}/og/site.jpg`,
    }),
    "utf8"
  );

  console.log(
    `Prévias de link: ${jogos.length} páginas em dist/iframe/, mais a raiz.` +
      `\nEndereço usado: ${SITE}  (mude com VITE_SITE_URL)`
  );

  if (semImagem.length > 0) {
    console.log(
      `\n⚠ ${semImagem.length} sem imagem em public/og/: ${semImagem.join(", ")}` +
        `\n  Rode \`node scripts/gerar-og.mjs\` (precisa de \`npm i --no-save sharp\`).`
    );
  }
}

main();
