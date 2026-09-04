# Fuga do Laboratório - EF02CO04

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

Escape room individual para 2º ano: um cartão aparece na mesa do laboratório, e
a criança toca se aquilo é **PEÇA** que dá para pegar ou **PROGRAMA** que dá
ordens para uma peça. Uma mascote em portrait, da clavícula para cima, acompanha
a partida com expressões e apontamentos visuais.

O briefing foi simplificado. O jogo irmão já usa arrastar para gavetas e montar
pares. Aqui o controle vira toque em botões grandes, um cartão por vez, com
menos leitura e mais feedback visual. A porta abre em três fechaduras curtas.

---

## 1. A habilidade, e o teste que ela precisa passar

> **(EF02CO04)** Diferenciar componentes físicos (hardware) e programas que
> fornecem as instruções (software) para o hardware.

Objeto: **Hardware e software**.

Exemplo oficial: pode-se utilizar dispositivos do cotidiano do aluno para
diferenciar o dispositivo físico (hardware) daquilo que o controla (software).

O teste da bolinha é este: **troque mouse, tela, joguinho e app de música por
bolinhas sem significado. O jogo muda?**

Muda. A decisão depende de saber se o item é uma peça física que posso tocar ou
um programa que dá instruções. Sem essa diferença, não existe critério.

Alinhamento com o código BNCC:

| Campo | Valor no jogo |
|---|---|
| Código | `EF02CO04` |
| Ano | 2º ano |
| Unidade | Mundo Digital |
| Objeto | Hardware e software |
| Verbo da habilidade | diferenciar |
| Evidência jogável | classificar cartões e parear programa com peça comandada |

---

## 2. Como isso não vira o jogo irmão

Já existe um jogo publicado para EF02CO04: **Museu Vivo do Computador**.

| Jogo | O que a criança faz | Diferença pedagógica |
|---|---|---|
| Museu Vivo do Computador | Arrasta vários itens para grupos e monta kits com peças e programas. | É mais amplo, com várias cartas simultâneas e missões de montagem. |
| Fuga do Laboratório | Decide um cartão por vez e abre fechaduras com respostas imediatas. | É mais simples e focado: peça que eu toco x programa que dá ordens. |

O irmão é exploração/montagem. Este é treino visual de diferenciação, com ritmo
de escape room leve.

---

## 3. O laço

```
porta mostra 3 fechaduras
→ mascote aponta para o cartão novo
→ cartão aparece grande na mesa
→ criança toca PEÇA ou PROGRAMA
→ acerto: cartão vai para a gaveta certa e uma fechadura gira
→ erro: TRAVA, cartão volta, mascote reage e dica visual destaca "tocar" ou "dar ordens"
→ depois de 3 cartões, próxima sala
→ sala final: tocar programa e depois tocar peça que ele comanda
→ porta abre e aparece a síntese visual
```

Controle: **um toque em alvo grande**. Nas duas primeiras salas, toca `PEÇA` ou
`PROGRAMA`. Na sala final, toca um programa e depois toca a peça relacionada.
Nada de arrastar.

---

## 4. Clareza para criança

O propósito precisa aparecer sem leitura constante.

| Conceito | Como a tela mostra |
|---|---|
| peça/hardware | mão tocando objeto físico + botão azul `PEÇA` |
| programa/software | engrenagem/seta dando ordem + botão roxo `PROGRAMA` |
| acerto de peça | cartão entra na gaveta azul com som de clique |
| acerto de programa | cartão entra na gaveta roxa e envia faíscas de ordem |
| programa comanda peça | linha luminosa sai do app e liga na peça |
| erro | o cartão balança, a gaveta certa pulsa depois da dica |
| mascote | aponta para o cartão, comemora acerto e faz dúvida no erro |

Texto durante a partida deve ser curto: nomes de itens e uma palavra nos botões.
A síntese com `hardware/software` fica no fechamento, depois que a criança já
entendeu pela ação.

A mascote não deve virar narradora de frases longas. Ela ajuda o olhar da
criança: aponta para o item novo, olha para a gaveta certa depois da segunda
falha e comemora quando a fechadura gira.

---

## 5. A grade

Tela fixa de **1280 x 720** com `Phaser.Scale.FIT`. Num celular em pé, a tela
vira uma faixa 16:9; ela não recompõe. A coluna "No celular" usa fator 0,30.

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| HUD | 0 - 84 | 3 fechaduras, botão `?` em (1210, 42), sem relógio visível | `?` hitbox 144 x 144 | 43 x 43 toque |
| Porta | 84 - 220 | porta do laboratório e fechadura atual acesa; mascote no canto esquerdo | porta 360 x 130; portrait 170 x 170 | 109 x 39; 52 x 52 |
| Mesa | 220 - 500 | cartão grande com ilustração e nome curto, deslocado para não bater na mascote | cartão 360 x 240; item 150 | 109 x 73; item 46 |
| Botões | 500 - 720 | dois botões gigantes: PEÇA e PROGRAMA | botão 430 x 160 | 130 x 49 |

Botões:

| Botão | Área |
|---|---|
| PEÇA | x 150 - 580, y 530 - 690 |
| PROGRAMA | x 700 - 1130, y 530 - 690 |

Na sala final, a área de botões vira dois painéis:

| Painel | Área |
|---|---|
| Programas | x 110 - 580, y 500 - 690 |
| Peças | x 700 - 1170, y 500 - 690 |

---

## 6. Salas e fases

A **fase deste jogo é um cartão ou par resolvido**. Cada nível tem 3 salas. Cada
sala tem 3 decisões, não 4 ou 8, para reduzir repetição.

| Nível | Sala | O que faz | Itens |
|---|---|---|---|
| 1 | Fechadura azul | classificar peças e programas óbvios | mouse, teclado, joguinho |
| 1 | Fechadura roxa | classificar mais três óbvios | tela, app de música, caixinha de som |
| 1 | Porta final | tocar programa e peça comandada | app música -> caixinha |
| 2 | Fechadura azul | casos de tela/app | tela, app de desenho, câmera |
| 2 | Fechadura roxa | casos de robô/comando | robô de brinquedo, dancinha do robô, controle |
| 2 | Porta final | dois pares simples | app foto -> câmera; joguinho -> controle |
| 3 | Fechadura azul | mistura de itens | mouse, despertador do relógio, impressora |
| 3 | Fechadura roxa | cartões parecidos | foto impressa, app de fotos, monitor |
| 3 | Porta final | três pares | app foto -> câmera; app música -> caixinha; joguinho -> controle |

No nível 1, o botão correto pode receber brilho sutil no primeiro cartão para
ensinar a regra. Nos níveis 2 e 3, a dica só aparece depois de erro.

---

## 7. As regras, em código

```ts
type ItemKind = 'hardware' | 'software'

type LabItem = {
  id: string
  label: string
  kind: ItemKind
  iconFrame: number
}

type Pair = {
  softwareId: string
  hardwareId: string
}

function classify(item: LabItem, choice: ItemKind) {
  return item.kind === choice
}

function pairs(programId: string, hardwareId: string, pairs: Pair[]) {
  return pairs.some(
    (pair) => pair.softwareId === programId && pair.hardwareId === hardwareId,
  )
}
```

O veredito nasce da categoria ou do par, não de `isCorrect` no botão. O mesmo
painel `PROGRAMA` é correto para app de música e errado para caixinha de som.

Pontuação interna:

| Situação | Evento | Pontos |
|---|---|---|
| classificar de primeira | `CORRECT_ANSWER` | +10 |
| classificar depois de TRAVA | `CORRECT_ANSWER` | +5 |
| par correto de primeira | `CORRECT_ANSWER` | +10 |
| escolha incorreta | `WRONG_ANSWER` + `lives.lose()` | 0 |

Nenhum número de ponto, acerto ou porcentagem aparece na tela.

---

## 8. O erro

TRAVA:

1. A criança toca a categoria errada ou par errado.
2. O cartão tenta entrar, mas a gaveta empurra de volta suavemente.
3. O mundo pausa com cadeado e comparação visual.
4. Se for hardware, aparece mão tocando o item.
5. Se for software, aparece seta saindo do app para uma peça.
6. A escolha correta só pulsa depois de 2 erros no mesmo item.
7. Só a escolha correta destrava.

Frases opcionais, no máximo 5 palavras:

| Caso | Frase |
|---|---|
| hardware | `Dá para tocar.` |
| software | `Dá ordens à peça.` |
| par errado | `Esse programa comanda outra peça.` |

O erro não pode ser:

| Não fazer | Motivo |
|---|---|
| depender de pergunta longa | a criança deve comparar pelo desenho |
| usar relógio com derrota | pressa não ajuda a diferenciar hardware/software |
| mostrar notas ou porcentagens | padrão do catálogo proíbe placar textual |
| exigir arraste fino | celular e criança pequena pedem toque grande |

---

## 9. Feedback e diversão

| Momento | Visual | Som |
|---|---|---|
| cartão novo | cartão sai de uma esteira pequena e para na mesa | plim curto |
| toque em PEÇA | mão animada encosta no cartão | clique de gaveta |
| toque em PROGRAMA | seta de comando sai do cartão | bip digital |
| acerto | cartão voa para a gaveta certa; fechadura gira | giro + clique |
| erro | gaveta devolve o cartão com mola | boing leve |
| par correto | linha luminosa liga app e peça; peça funciona | acorde curto |
| sala completa | fechadura abre e luz passa pela porta | fanfarra curta |
| fim do nível | porta abre; mascote comemora no portrait e luz sai da porta | fanfarra maior |

Diversão sem complexidade:

| Recurso | Como usar |
|---|---|
| laboratório acolhedor | colorido, sem clima assustador |
| porta com fechaduras | progresso claro sem texto |
| gavetas expressivas | engolem cartão certo e devolvem cartão errado |
| cartões grandes | item é protagonista, sem mesa cheia |
| pares da porta | app manda luz para peça, peça responde |
| mascote em portrait | dá vida ao laboratório sem adicionar personagem andando na tela |

---

## 10. Tutorial

Exemplo animado de 5 segundos, pulável:

| Passo | Frase curta | Cena |
|---|---|---|
| 1 | `PEÇA` | mouse aparece; mão toca o mouse |
| 2 | `TOQUE PEÇA` | mascote aponta e dedo toca botão azul |
| 3 | `PROGRAMA` | app de música aparece; seta sai dele |
| 4 | `TOQUE PROGRAMA` | dedo toca botão roxo e fechadura gira |

O botão `?` pausa e reabre o tutorial. Sem narração.

---

## 11. Textura mínima e o que fica no código

Pouca textura. O laboratório, porta, gavetas, botões e cartões podem ser
`Graphics`. Os itens podem vir em uma spritesheet única para facilitar leitura.

| Elemento | Fazer em |
|---|---|
| laboratório e mesa | Graphics |
| porta e fechaduras | Graphics |
| gavetas PEÇA/PROGRAMA | Graphics |
| botões, setas, cadeado, brilho, estrelas | Graphics/shared |
| mão, engrenagem, seta de comando | Graphics |
| itens dos cartões | spritesheet única |
| mascote loira em portrait | spritesheet única curta |
| background do laboratório | opcional |
| capa | PNG |

Sem textura para gaveta completa, botão completo, porta, fechadura, relógio,
painel, balões ou UI. A mascote é portrait fixo, não full body e não anda pelo
cenário.

Todo carregamento de textura usa `import.meta.glob`, e todo consumo passa por
`textures.exists()`.

---

## 12. Produção

Ordem recomendada:

1. dados dos itens e função `classify`;
2. tela com cartão, dois botões e fechaduras;
3. placeholders em Graphics para itens;
4. TRAVA e dica visual por mão/seta;
5. portrait placeholder da mascote e reações;
6. sala final de pares com toque simples;
7. painel de fim e eventos da plataforma;
8. texturas opcionais.

Para implementação inicial, seguir a regra do projeto: construir **1 nível só
para teste**, avisar o usuário e mostrar o resultado antes de expandir para os
3 níveis planejados.

---

## 13. Registro

Pasta do jogo:

```
src/games/EF02CO04/fuga-do-laboratorio/
```

Pasta de assets:

```
src/assets/games/EF02CO04/fuga-do-laboratorio/
```

Slug: `fuga-do-laboratorio`

Título: `Fuga do Laboratório`

Entrada futura no catálogo:

| Campo | Valor |
|---|---|
| `slug` | `fuga-do-laboratorio` |
| `module` | `EF02CO04/fuga-do-laboratorio` |
| `skill` | `EF02CO04` |
| `years` | `[2]` |
| `tags` | `["hardware", "software", "classificação", "toque"]` |
| `category` | `Mundo Digital` |
| `points` | `60` |
| `icon` | sugerido: porta ou chave |

Também registrar:

| Arquivo | O que entra |
|---|---|
| `src/data/gameInstructions.ts` | 3 linhas: veja o cartão, toque peça ou programa, ligue app e peça na porta |
| `src/pages/GameDetailsPage.tsx` | incluir em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` se usar painel interno |

---

## 14. O que mudou na construção

Preencher depois da implementação.
