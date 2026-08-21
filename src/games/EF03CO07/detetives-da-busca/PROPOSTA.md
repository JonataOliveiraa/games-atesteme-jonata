# Detetives da Busca — proposta de refacção

EF03CO07 · 3º ano · Cultura Digital
*Utilizar diferentes navegadores e ferramentas de busca para pesquisar e acessar informações.*

---

## 1. Por que o jogo atual está morto

Ele tem três passos: escolher um cartão de palavra, escolher um filtro, escolher um resultado. Três cliques, cada um com uma resposta certa marcada no arquivo de dados (`correctKeywordId`, `correctFilterId`, `correctResultId`).

O problema não é a arte. É que **nada acontece entre um clique e outro**. A criança não vê a busca funcionar — ela adivinha qual dos três cartões o jogo quer. É um quiz com tema de buscador.

E a ficha pede o contrário, com todas as letras: *"O sistema explica **por que** um resultado apareceu e premia boas estratégias de pesquisa, não só a resposta final."*

---

## 2. A virada: o jogo pergunta "por quê", não "qual"

A mecânica nova inverte quem faz a pergunta.

Hoje: *"qual palavra você usaria?"* → a criança escolhe entre três.
Proposta: *"a busca já rodou. Olhe o que voltou e descubra o que foi pedido."*

Isso é **dedução**, e é a única coisa que nenhum dos 45 jogos do catálogo faz. Em todos eles a criança monta, ordena, classifica ou aponta a resposta. Em nenhum ela **lê um efeito e deduz a causa** — que é exatamente o raciocínio de quem aprende a pesquisar de verdade: *"por que esse site apareceu na minha busca?"*

E é a única forma de a criança entender que o buscador não é mágico: ele casa palavras.

---

## 3. Os dois gestos

**Passar a lupa (segurar).** Os resultados chegam fechados — só título e site, como numa lista de verdade. Para ler o trecho, a criança **segura a lupa em cima do cartão**. Debaixo do vidro, o texto aparece e as palavras que casaram com a busca **acendem**. Soltou, fecha.

Isso não é arrastar objeto para encaixe, que é o gesto de metade do catálogo. É uma ferramenta que revela, e é o gesto que dá nome ao jogo. Também resolve um problema real: sem ele, a tela vira um paredão de texto — o mesmo defeito que você apontou na Central.

**Ligar e desligar palavras.** As palavras da busca ficam numa barra, cada uma como um interruptor. Desligar uma palavra **não abre um menu**: os resultados que só estavam ali por causa dela **caem do mural na hora**, com o fio que os prendia se apagando. Ligar uma nova palavra traz outros voando.

A busca deixa de ser um botão "pesquisar" e vira uma coisa viva que reage a cada toque.

---

## 4. Os três níveis

### Nível 1 — De onde veio isso?
A busca já rodou, mas a palavra pesquisada está **borrada** na barra. No mural: pinguim, sorvete, geladeira, Antártida.

A criança passa a lupa nos cartões e percebe o que eles têm em comum. Depois toca na palavra que explica **todos** eles: `gelo`.

> Ensina o essencial: o buscador devolve tudo que contém a palavra, inclusive o que não tem nada a ver com o que você queria.

### Nível 2 — Tire o intruso
Agora a busca está visível: `onça`. Voltaram sete resultados, e três são lixo — um carro, um time de futebol, uma marca de tênis.

A criança não escolhe "o resultado certo". Ela **conserta a busca**: liga a palavra que mata o lixo (`onça pintada`, `onça animal`) e vê os três cartões caírem do mural. Se ligar uma palavra ruim, cai coisa demais e o mural fica vazio — e isso também é uma lição, não um erro.

Filtros entram aqui como interruptores do mesmo tipo: `Imagens`, `Vídeos`, `Só para crianças`.

> Ensina refinamento: acrescentar palavra corta resultado. Cortar demais também é errar.

### Nível 3 — Duas buscas, um caso
Duas buscas salvas na mesa, cada uma com seu mural. As duas trazem resultados que parecem responder.

A criança compara e escolhe qual serviu melhor — e o jogo pede **por quê**, tocando no critério: *fala do assunto certo · é de um site confiável · tem a informação que a pergunta pediu*.

> Ensina o que a ficha chama de "análise de relevância": duas respostas plausíveis, e uma justificativa.

---

## 5. A tela

Mesa de detetive ao fundo, navegador aberto em cima — a direção que você escolheu.

```
┌──────────────────────────────────────────────────────────┐
│ HUD  nível · progresso · caso                            │
├──────────────────────────────────────────────────────────┤
│ ╔══ navegador ══════════════════════════════════════════╗│
│ ║ ┌ busca ────────────────────────────┐  ⟨7 resultados⟩ ║│
│ ║ │ [onça]  [pintada]  [+]            │                 ║│
│ ║ └───────────────────────────────────┘                 ║│
│ ║  Imagens   Vídeos   Sites   Infantil                  ║│
│ ║ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           ║│
│ ║ │ ▤ ▤ ▤  │ │ ▤ ▤ ▤  │ │ ▤ ▤ ▤  │ │ ▤ ▤ ▤  │  ← mural  ║│
│ ║ └────────┘ └────────┘ └────────┘ └────────┘           ║│
│ ╚═══════════════════════════════════════════════════════╝│
│         🔍 lupa — segure sobre um cartão                  │
└──────────────────────────────────────────────────────────┘
```

**Sem personagem**, como você pediu. Quem fala é o próprio navegador: um aviso curto na barra (`3 resultados saíram`) e, no erro, uma linha no lugar do mural. Nada de balão.

---

## 6. Texturas — 9 arquivos

Todas em 350×350, fundo transparente, o mesmo estilo chibi 2D que você usou na Central. Exceto o fundo.

| Arquivo | Tamanho | O que é |
|---|---|---|
| `bg-mesa.png` | 1280×720 opaco | Mesa de detetive vista de cima: madeira, papéis soltos, clipes, um copo. Centro **vazio** — o navegador ocupa ele. |
| `lupa.png` | 350×350 | A lupa. Cabo de madeira, aro de metal, **vidro transparente de verdade** (alfa baixo no miolo, não branco). É o objeto que a criança move. |
| `chip-on.png` · `chip-off.png` | 350×140 | A palavra ligada e desligada. Ligada: acesa, com brilho. Desligada: apagada, cinza. |
| `pino.png` | 350×350 | O pino que prende o cartão no mural. Cabeça redonda vermelha. |
| `selo-imagens.png` · `selo-videos.png` · `selo-sites.png` · `selo-infantil.png` | 350×350 | Os quatro tipos de resultado, como carimbo no canto do cartão. |

Cartão de resultado, barra de busca, mural, moldura do navegador e os fios continuam em `Graphics` — mudam de estado o tempo todo (aceso, apagado, caindo, sob a lupa) e como PNG virariam dezenas de variantes. Mesma regra do Formato Certo.

---

## 7. O que eu preciso de você

1. **A mecânica está de pé?** Se a dedução do nível 1 parecer difícil demais para 3º ano, eu inverto: a busca começa visível e o nível 1 vira só "tire o intruso", com a dedução subindo para o nível 2.
2. **A lupa segurada funciona no seu público?** Em tablet é natural; no computador é segurar o botão do mouse. Se preferir, viro um clique que abre e outro que fecha.
3. **Conteúdo.** Os casos que escrevi de exemplo são onça-pintada, pinguim e Lua. Se você tiver temas que combinem melhor com o material de vocês, eu monto em cima deles.

Com o sim, escrevo o jogo inteiro: `data/`, `scenes/`, `MECANICA.md` e `VISUAL.md`, no mesmo padrão de três camadas do Chef e do Formato Certo.
