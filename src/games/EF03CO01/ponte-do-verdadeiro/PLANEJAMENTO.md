# Ponte do Verdadeiro — planejamento

_EF03CO01 · 3º ano · Pensamento Computacional · slug `ponte-do-verdadeiro`_

Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF03CO01.md` (a mesma
que foi colada no chat em 05/10/2026). Padrão: `docs/rodada-3/PADRAO-R3.md` e
`src/games/INSTRUCOES.md` ("A derrota").

> **A mecânica da ficha foi trocada, por escolha do usuário (05/10/2026).** A ficha (ler o
> cartaz e tocar em ABRIR ou BARRAR) é o **Tribunal do Verdadeiro ou Falso** (014) com outra
> roupa: mesma pergunta, mesmos dois botões, mesmos níveis (sem NÃO → com NÃO → com tempo) e
> quase as mesmas frases. Das três opções oferecidas, o usuário escolheu **Arrume a margem**.
> A ponte, o riacho, os bichinhos, a guarita e o NÃO em destaque continuam.

id: **105** (o 104 ficou com a Fábrica Liga-Desliga, de outra sessão). `NEXT_FREE_ID` = 106.

---

## 1. A habilidade

> **(EF03CO01)** Associar os valores 'verdadeiro' e 'falso' a sentenças lógicas que dizem
> respeito a situações do dia a dia, fazendo uso de termos que indicam negação.

Objeto: **Lógica computacional.** O exemplo oficial usa pares em que só o NÃO muda ("Cinco é
maior que seis" × "Cinco NÃO é maior que seis"). Aqui o par aparece entre níveis: a 1ª fase do
N2 repete o sujeito e a coisa da 1ª fase do N1 e acrescenta o NÃO, e a mesma cena passa a pedir
o contrário (§6).

## 2. Os irmãos, e por que este jogo é outro

| Jogo | O que a criança recebe | O que ela faz | Gesto |
|---|---|---|---|
| Tribunal do Verdadeiro ou Falso (014) | uma frase pronta | diz se ela vale V ou F | 2 botões |
| Cabo de Guerra da Verdade (059) | o valor pedido e uma frase com um buraco | escolhe É ou NÃO É para a **frase** valer aquilo | 2 cartas |
| **Ponte do Verdadeiro** | uma frase sobre a cena que ela está vendo | muda a **cena** até a frase ficar verdadeira | tocar nos bichinhos + alavanca |

São três direções: **julgar a frase**, **mudar a frase** e **mudar o mundo**. Aqui ninguém
pergunta "isto é V ou F?". A criança olha a margem, confere se a placa já é verdade e, se não
for, arruma.

Um aviso honesto: o laço "arrumar e depois conferir" é o mesmo do **Cantinho do Tablet**
(102, EF02CO06, 3ª rodada). A habilidade é outra e a pergunta também. O usuário escolheu
sabendo disso.

**O teste da bolinha.** Se você trocar as palavras por bolinhas, o jogo acaba. A coisa a mexer e
o jeito de deixar a frase verdadeira só saem da frase: o nome do bichinho, NÃO, TODOS, NENHUM. Com
o NÃO, a mesma cena pede o contrário.

## 3. O jogo em 1 frase

A ponte só desce quando a placa diz a verdade: toque nos bichinhos para a frase ficar verdadeira
e puxe a alavanca **ABRIR**.

## 4. Como joga

**A cena.** Na margem de cá estão **três bichinhos** em lugares fixos: **sapo**, **coelho** e
**pato**. Do outro lado do riacho fica o **castor da ponte**, na guarita, ao lado da alavanca. A
ponte levadiça está **levantada**. No alto aparece a **placa** com uma frase sobre os bichinhos.

**A coisa da vez.** Cada fase tem **uma coisa só**: **chapéu**, **guarda-chuva** ou **balão**.
Cada bichinho começa com ela ou sem ela, e um toque nele faz a troca: põe ou tira, com um "pop"
de estrelinhas. Outro toque desfaz. Tocar em quem a frase não cita não muda nada e não custa nada.

**A frase.** O texto sai da estrutura da fase, e não de uma string solta (§10):

| Forma | Exemplo | Fica verdadeira quando |
|---|---|---|
| sobre um | O sapo está de chapéu. | o sapo tem chapéu |
| sobre um, com NÃO | O sapo **NÃO** está de chapéu. | o sapo não tem chapéu |
| todos | **TODOS** os bichinhos estão de chapéu. | os três têm chapéu |
| nenhum | **NENHUM** bichinho está de chapéu. | nenhum dos três tem chapéu |

NÃO, TODOS e NENHUM aparecem sempre em **rosa-choque** na placa. A cor marca a palavra que decide,
e não a resposta: ela aparece em toda frase que tem essa palavra.

**Conferir.** A alavanca **ABRIR** fica sempre disponível. Nada na tela diz se a frase está
verdadeira antes do toque: não há lâmpada nem cor que mude enquanto a criança arruma. Ao puxar:

- **verdade**: a ponte desce rangendo e encosta na margem com um "tum". O castor comemora e os
  bichinhos atravessam saltitando. Não há carimbo nem estrelas: a ponte descendo **é** o "verdade"
  (§4b);
- **falso**: é o erro (§5).

## 4b. O que fica em destaque — um de cada vez

Pedido do usuário depois de jogar (05/10/2026): *"o jogo está renderizando tudo de forma
destacada, deixando a criança confusa onde clicar, além daqueles popups de 'verdade'"*. Antes,
na mesma tela, pulsavam o brilho nos pés dos três bichinhos e o ABRIR, o castor balançava sem
parar, e o resultado vinha com carimbo, estrelas, placa crescendo e anel no culpado. A regra
agora é:

- **só se mexe o que a criança tocou, ou a consequência do toque dela.** Nada pisca ou pulsa
  esperando o toque;
- **o que não é tocável fica parado**: o castor só muda de pose quando algo acontece;
- **o resultado é a ponte**: ela desce (verdade) ou emperra com o cadeado (falso). A palavra
  FALSO vem dita pelo castor, e não carimbada;
- **o destaque de "onde tocar" é do guia**, que tem véu, recorte e dedo, um passo por vez.

| Momento | O que chama atenção | O que saiu |
|---|---|---|
| arrumar | a placa; a alavanca com **borda branca fixa** (pedido do usuário); o bichinho tocado pula e solta 4 estrelinhas | brilho pulsante nos pés dos 3, ABRIR pulsando, castor balançando |
| mouse por cima (computador) | uma elipse clara, parada, sob o bichinho apontado | — |
| verdade | a ponte desce e os bichinhos atravessam; o castor comemora | carimbo VERDADE, estrelas na placa |
| falso | a ponte emperra com cadeado; o culpado treme; o castor diz "Falso! O sapo está sem chapéu." | carimbo FALSO, placa crescendo, anel laranja pulsando |
| fim do nível | as fichas das frases, uma por vez | carimbo em cada ficha |

O NÃO, o TODOS e o NENHUM continuam com a pílula rosa na placa. Isso é conteúdo (a palavra que
decide) e a ficha pede.

**Pegadinha.** Em cada nível, uma fase começa **com a placa já verdadeira**. Nesse caso, basta
puxar a alavanca. Se a criança mexer no bichinho que a frase cita, a frase fica falsa. É isso
que impede a criança de "arrumar sempre alguma coisa".

**A verdade é função do estado.** Os dados não guardam a resposta (`answer`). O veredito é
`isTrue(frase, estado)` no instante do toque na alavanca ([[padrao-remake-jogo]]).

## 5. Erro

Segue o padrão da rodada, **errou, perdeu** ([[errou-bloqueia]]). O único erro é **puxar a
alavanca com a placa falsa**. Mexer nos bichinhos nunca é erro.

A cena do erro dura cerca de 1,2 s e toca **antes** do `lose()`:
1. a ponte começa a descer e **emperra no meio** com um tranco. Um **cadeado** aparece na
   corrente: é a trava da ficha, aqui só como imagem;
2. o bichinho que deixa a frase falsa **treme**, só **depois** do erro. Em TODOS e NENHUM, treme
   o primeiro que quebra a frase;
3. o castor, preocupado, diz o valor e o fato: **"Falso! O sapo está de chapéu."** ou
   **"Falso! O pato está sem balão."**.

Depois disso vêm `WRONG_ANSWER` e `lives.lose()`, uma vez só. O balão continua à vista durante
os 1,35 s que a plataforma espera. Os sons são macios: "clanc" abafado e nada áspero.

**Escorregão de dedo.** A alavanca fica na margem de lá, longe dos bichinhos. Ela também só
liga 0,6 s depois de a frase terminar de aparecer na placa, para um toque acidental na troca de
fase não encerrar a partida.

O guia nunca encerra a partida: o erro que o tutorial mostra é de mentira e volta atrás (§8).

## 6. Níveis — um assunto por nível

| Nível | Assunto | Estreia |
|---|---|---|
| **N1 — A placa diz como está** | frase sobre um bichinho, sem negação | a cena, a troca e a alavanca |
| **N2 — O NÃO vira a frase** | o mesmo, com NÃO | o NÃO |
| **N3 — TODOS e NENHUM** | a frase fala dos três de uma vez | TODOS e NENHUM |

São **4 fases por nível**. A dificuldade cresce pela forma da frase e pela quantidade de trocas,
nunca por uma regra nova na tela. A coisa da vez muda de uma fase para a outra, só para dar
variedade. Os três bichinhos, as três coisas e a cena são os mesmos nos três níveis.

**Fases** (`data/levels.ts`). Na coluna "começo", **S C P** = sapo, coelho, pato, e ● = tem a
coisa.

| N | F | Coisa | Frase | Começo S C P | O que resolve |
|---|---|---|---|---|---|
| 1 | 1 | chapéu | O sapo está de chapéu. | ○ ● ○ | tocar no sapo (tutorial) |
| 1 | 2 | guarda-chuva | O pato está com guarda-chuva. | ● ○ ○ | tocar no pato |
| 1 | 3 | balão | O sapo está com balão. | ● ○ ● | **já é verdade**: só abrir |
| 1 | 4 | chapéu | O coelho está de chapéu. | ○ ○ ● | tocar no coelho |
| 2 | 1 | chapéu | O sapo **NÃO** está de chapéu. | ● ○ ● | tocar no sapo (tutorial) |
| 2 | 2 | balão | O pato **NÃO** está com balão. | ○ ● ● | tocar no pato |
| 2 | 3 | guarda-chuva | O coelho está com guarda-chuva. | ● ○ ○ | tocar no coelho (sem NÃO, de propósito) |
| 2 | 4 | chapéu | O pato **NÃO** está de chapéu. | ● ● ○ | **já é verdade**: só abrir |
| 3 | 1 | chapéu | **TODOS** os bichinhos estão de chapéu. | ○ ● ○ | sapo e pato (tutorial) |
| 3 | 2 | guarda-chuva | **NENHUM** bichinho está com guarda-chuva. | ● ○ ● | sapo e pato |
| 3 | 3 | balão | O sapo **NÃO** está com balão. | ● ● ○ | tocar no sapo (revisão) |
| 3 | 4 | guarda-chuva | **TODOS** os bichinhos estão com guarda-chuva. | ● ● ● | **já é verdade**: só abrir |

A fase N2-3 **não tem NÃO** de propósito. Sem ela, o N2 ensinaria "neste nível, sempre tire". O
N2-1 é o par do exemplo oficial: mesmo sapo e mesmo chapéu do N1-1, agora com o NÃO.

**Validação** (`validateLevels`, roda em dev):
- cada nível tem **4 fases** (o máximo do INSTRUCOES é 5);
- duas fases seguidas nunca usam a mesma coisa;
- cada nível tem **exatamente 1** fase que começa verdadeira, e ela nunca é a 1ª;
- nas outras fases a frase começa falsa, e o número mínimo de trocas é pelo menos 1;
- **N1**: só frases sobre um bichinho, sem NÃO. **N2**: pelo menos 2 com NÃO e pelo menos 1 sem.
  **N3**: pelo menos 1 TODOS, 1 NENHUM e 1 revisão sobre um bichinho;
- quando a frase fala de um bichinho só, o começo mostra a coisa **em pelo menos um bichinho e
  faltando em pelo menos outro**. Assim a criança vê os dois jeitos antes de tocar;
- a 1ª fase do N2 tem o mesmo sujeito e a mesma coisa da 1ª fase do N1;
- o texto gerado cabe na placa (no máximo 2 linhas, no máximo 40 caracteres);
- no máximo 4 regiões tocáveis ([[densidade-de-alvos-no-celular]]): 3 bichinhos e a alavanca.

**Primeiro só o N1**, como o INSTRUCOES manda ("Sempre faça o jogo com apenas 1 NIVEL, para
teste"). O N2 e o N3 já ficam nos dados e na validação, prontos para ligar.

## 7. Tela (1280 × 720)

Rascunho. As posições finais saem da arte medida (§11).

```
┌──────────────────────────────────────────────────────────────── HUD ─┐
│ [Nível 1 ● ○ ○ ○]                                              (?)   │
│     ┌──────────────────── PLACA ────────────────────┐                │
│     │       O sapo NÃO está de chapéu.              │      ┃ torre   │
│     └───────────────────────────────────────────────┘    ╱ ┃ (polia) │
│                                                         ╱  ┃ ┌─────┐ │
│      🎩                              🎩               ╱ponte┃ │guarita│
│     sapo          coelho            pato           ╱ erguida │castor ⊥│
│ ═══════════════ margem de cá ═══════════════╗~~~ riacho ~~~╔═ lá ═ABRIR│
└──────────────────────────────────────────────────────────────────────┘
```

Medido na arte entregue (`MANIFEST.md` da pasta de assets):

| Região | Onde | Notas |
|---|---|---|
| HUD | 0–82 | chip de nível, bolinhas e `?`, de ponta a ponta |
| placa | centro da face em (410, 222), escala 0,92 | texto de 40 px, NÃO/TODOS/NENHUM em rosa-choque com pílula |
| bichinhos | pés em y 618; x 105 · 290 · 475; escala 0,74 | zonas de toque de 160 × 200, com folga de 25 px entre elas |
| riacho | x 559–903 | tábua com dobradiça em (930, 622), escala 0,49; erguida a 80°, emperrada a 38° |
| alavanca | x 1062, junto da torre | zona de 170 × 230 e rótulo **ABRIR** embaixo |
| castor | x 1192, na porta da guarita | no rascunho ele vinha antes da alavanca, mas o rabo cobria a bola dela |

- A ponte gira presa na **margem de lá**. Erguida, ela fica quase em pé (80°) ao lado da torre.
  Abaixada, encosta na margem de cá. As correntes vão da polia da torre até a ponta da ponte e
  são desenhadas a cada quadro.
- Os bichinhos olham para a direita (para a ponte). O castor olha para a esquerda (para eles).
- Nenhum sinal permanente de "dá para tocar" (§4b). No computador, o bichinho sob o mouse ganha
  uma elipse clara e parada nos pés; no celular, quem ensina onde tocar é o guia.

## 8. Tutorial

`createTutorial` ([[tutorial-com-createtutorial]]): `textSize: 30`, `once: false` (o jogo guarda
a própria chave no `registry`), `safeTop: 90`, recorte em `rect` no que a frase cita e dedo com
`tap: true` onde há toque. Cada balão tem uma frase curta. A **demonstração acontece de verdade**
entre os balões, e **o que é feito no treino conta**: a fase continua dali.

**Apresentação** (uma vez só, [[fala-espera-botao]]), com o castor no recorte:
1. "Oi! Eu cuido desta ponte."
2. "Ela só desce quando a placa diz a VERDADE."

**N1** (fase 1, "O sapo está de chapéu.", começo ○ ● ○):
1. "Veja o que acontece se a placa estiver errada." → **Ver**: o dedo puxa a alavanca, a ponte
   emperra, o sapo treme e o castor diz "Falso! O sapo está sem chapéu.". Um flash e a cena
   **rebobina**, com a alavanca em cima e a
   ponte erguida.
2. Recorte no sapo: "Toque no sapo para pôr o chapéu." → **treino**: só o sapo responde e o dedo
   fica batendo nele.
3. Recorte na alavanca: "Agora a placa é verdade. Puxe a alavanca!" → **treino**: a ponte desce
   de verdade e a fase 1 conta.
4. Antes da fase 2: "Confira antes: às vezes a placa já é verdade." (`Vamos começar!`)

**N2** (fase 1, "O sapo NÃO está de chapéu.", começo ● ○ ●):
1. Recorte no **NÃO** da placa: "Olha o NÃO! Agora o sapo fica SEM chapéu."
2. Recorte no sapo: treino de tirar o chapéu.
3. "Puxe a alavanca!" → treino.

**N3** (fase 1, TODOS):
1. Recorte no **TODOS**: "TODOS quer dizer cada um dos três."
2. Treino: o dedo bate no sapo e depois no pato.
3. "Puxe a alavanca!" → treino.

Na fase 2 do N3, um balão só, sem treino, com recorte no **NENHUM**: "NENHUM quer dizer nem um
só."

Durante o treino, toque em outro bichinho ou na alavanca é ignorado, sem custo. O `?` repete o
essencial, sem demonstração: "Ela só desce quando a placa diz a VERDADE." → "Toque num bichinho
para trocar." → "Placa verdadeira? Puxe a alavanca!" (`Continuar`).

## 9. Passagem de fase e fim do nível

**Acertou**: o castor comemora sem balão (só gesto, sem botão) e os bichinhos atravessam
saltitando e saem pela direita. A bolinha da fase acende. Depois vem uma cortina violeta, e na
fase seguinte a ponte já está erguida, os bichinhos
estão de volta na margem com o estado novo e a placa vira para a frase nova.

**Fim do nível: "as verdades da ponte".** As 4 frases do nível aparecem em fichas, uma por
vez, sem carimbo (o título já diz que são verdades). É o painel final da ficha, agora só com verdades, porque toda
fase termina com a frase verdadeira. Depois de cerca de 2 s, aparece o `showLevelComplete`.

## 10. Textos (`data/words.ts`)

A frase é **montada a partir da estrutura** da fase, `{ form: 'one' | 'all' | 'none', subject?,
not?, item }`. Assim o texto e o `isTrue` não podem discordar
([[tutorial-diz-o-objetivo]], "a conta que desenha é a mesma que julga").

| Coisa | "com" | "sem" (fala do erro) |
|---|---|---|
| chapéu | de chapéu | sem chapéu |
| guarda-chuva | com guarda-chuva | sem guarda-chuva |
| balão | com balão | sem balão |

- um: `O {sapo|coelho|pato} [NÃO] está {com}.`
- todos: `TODOS os bichinhos estão {com}.`
- nenhum: `NENHUM bichinho está {com}.`
- fala do erro: `Falso! O {bichinho} está {com|sem}.`, sobre o primeiro bichinho que quebra a
  frase.
- rótulo da alavanca: **ABRIR**. Não há carimbo (§4b).

Em `gameInstructions.ts`:
1. A ponte só desce quando a frase da placa é verdade.
2. Toque num bichinho para ele pôr ou tirar a coisa da vez.
3. Quando a placa estiver verdadeira, puxe a alavanca ABRIR.
4. Cuidado com o NÃO: ele vira a frase ao contrário!

## 11. Arte

**Linha nova: Muse Dash**, escolhida pelo usuário em 05/10/2026. As três imagens
`references/muse dash style*.{jpeg,jpg,png}` vão em toda geração. Tabela e prompts no
[TEXTURAS.md](./TEXTURAS.md). São quatro arquivos: fundo, peças da ponte, bichinhos (com o
castor) e capa.

A arte chegou antes do código, então não há desenho de reserva em `Graphics`. Ela veio fora do
contrato, como de costume: fundo em 1672 × 941, folha de bichinhos com células de 300, ponte e
placa em 900 × 800, e a alavanca e o cadeado num arquivo à parte (`outros.png`). O layout foi
ajustado à arte, sem regenerar ([[usar-o-time]]). As medidas estão no `MANIFEST.md` da pasta
de assets.

Fica sempre em `Graphics`: o texto da placa (com a pílula rosa do NÃO/TODOS/NENHUM), a
corrente, a elipse do mouse, as 4 estrelinhas da troca, os balões, o rótulo ABRIR, o HUD e as
fichas do fim.

## 12. Plataforma

- `GAME_READY` → `CHECKPOINT` (progresso = fases feitas / 4, com `hits` e `errors`);
- fase verdadeira → `CORRECT_ANSWER` (+10);
- alavanca com a placa falsa → `WRONG_ANSWER` (−5) + `lives.lose()`, uma vez;
- fim do nível → `GAME_COMPLETED` e tela própria (o slug entra em
  `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`);
- cadastro: `catalog.ts` (id = `NEXT_FREE_ID`, e o `NEXT_FREE_ID` anda um), `order: 147` (entre o
  Cabo de Guerra, 145, e o Labirinto do Enquanto, 150), `years: [3]`, `points: 40`, ícone 🌉,
  tags `["lógica", "negação", "verdadeiro ou falso", "toque"]`, capa
  `cover-ponte-do-verdadeiro.png`, `public/og/ponte-do-verdadeiro.jpg` com
  `scripts/gerar-og.mjs`.

A ficha pede para medir o acerto com negação e o tempo médio de decisão. O `CHECKPOINT` não tem
campo para isso, então fica o que ele já leva.

## 13. Arquivos

```
types.ts · index.ts
data/  files.ts layout.ts levels.ts theme.ts words.ts
scenes/ BootScene.ts GameScene.ts
        bridge.ts (fundo + tábua + corrente + cadeado) critters.ts (bichinhos, zonas, brilho, anel)
        sign.ts (placa + palavras + carimbo) keeper.ts (alavanca + castor)
        ui.ts (balão, dedo/véu, mural do fim) hud.ts guide.ts audio.ts
```

`levels.ts` guarda os três níveis em `ALL_LEVELS` e valida todos; `READY = 1` decide quantos
entram em `LEVELS`. Para ligar o N2 e o N3, basta `READY = 3`: os guias deles (estreia do NÃO,
do TODOS e do NENHUM) já foram testados no navegador.

Áudio sintetizado (WebAudio, sem arquivo): "pop" brilhante na troca, ranger grave e longo da
ponte descendo, "tum" macio ao encostar, passinhos saltitantes, "clanc" abafado ao emperrar,
fanfarra `[523, 659, 784, 1047]` no fim do nível.

## 14. Ficha → Aqui → Motivo

| Ficha | Aqui | Motivo |
|---|---|---|
| viajante com cartaz + ABRIR / BARRAR | 3 bichinhos fixos + placa + **arrumar e puxar ABRIR** | escolha do usuário; a ficha repetia o Tribunal (014) |
| frases de fato escolar ("O gato é um animal") | frases sobre a cena ("O sapo está de chapéu") | a verdade se confere olhando, sem pegadinha de interpretação; o Tribunal já usa as frases da ficha |
| guarita com 2 botões | guarita na margem de lá, com 1 alavanca | um gesto de conferir; quem decide é a cena arrumada |
| 6 / 8 viajantes | 4 fases por nível | INSTRUCOES: no máximo 5 |
| TRAVA, destravar (+5), palavra pisca depois de 2 travas | **errou, perdeu**; o cadeado fica só como imagem do erro | [[errou-bloqueia]] |
| cronômetro de 15 s que não pune (N2) e de 10 s (N3) | **sem cronômetro** | não existe mais barra só de bônus, e um prazo que encerra puniria quem pensa |
| NUNCA (N2) | fora | uma frase sobre o tempo não dá para conferir numa cena parada |
| "Não é falso que…" (N3) | fora | dupla negação seria um 2º assunto no N3, e a ficha proíbe "pegadinha de interpretação" |
| "NENHUM pássaro nada (o pinguim!)" | NENHUM/TODOS sobre os três bichinhos | o contraexemplo está na tela, e não na memória |
| balsa do NÃO, meia-volta | fora | ninguém é barrado; o falso aparece como a ponte emperrada e o "Falso!" do castor |
| painel de verdades × falsidades | "as verdades da ponte" (§9) | toda fase termina verdadeira |
| TÍTULO + exemplo animado de 5 s | fluxo da plataforma + tutorial com demonstração | PADRAO-R3 |
| arte chibi de figurinha | **Muse Dash** | escolha do usuário |

## 15. Decisões pela régua "simples e claro"

- **Uma coisa por fase** (chapéu, guarda-chuva ou balão): um toque sempre quer dizer "põe ou
  tira". Duas coisas no mesmo bichinho exigiriam escolher o que trocar.
- **Três bichinhos em lugares fixos**, sempre os mesmos: endereço fixo, e quem varia é a frase.
- **Mexer em quem a frase não cita é livre.** A frase fala de quem ela nomeia, e é isso que a
  criança aprende.
- **Nada denuncia a verdade antes da alavanca**: sem lâmpada, sem cor que muda, sem contador.
- **Uma pegadinha por nível**, nunca na 1ª fase.
- **Sem cronômetro**. Se o usuário quiser pressa no N3, dá para pôr uma barra que encerra.
- **O sucesso não tem fala.** A ponte descendo e a festa bastam; um balão a cada fase seria um
  toque de pedágio ([[fala-espera-botao]]).
- **Um destaque por vez** (§4b): nada pulsa esperando toque, e o resultado é a própria ponte, sem
  carimbo.

## 16. Histórico

- 05/10/2026: a ficha foi colada no chat com o pedido "se ele parece mt com outro jogo,
  avise-me". Avisei que ela repete o Tribunal (014) e lembrei que o Cabo de Guerra (059) já tinha
  trocado a mesma ficha. O usuário escolheu **Arrume a margem** (em vez de "verdade na cena" com
  ABRIR/BARRAR, ou de seguir a ficha) e a linha de arte **Muse Dash**.
- 05/10/2026: chegaram as texturas e o **N1 foi feito** (id 105, só N1 liberado). Testado no
  navegador:
  - o guia completo: apresentação, demo do erro com rebobinar, treino no sapo, treino na
    alavanca e a dica da pegadinha;
  - as 4 fases, incluindo a pegadinha, até o mural "Verdades da ponte" e o painel final;
  - o erro (ponte emperrada, cadeado, FALSO, anel no culpado e fala do castor): sai
    `WRONG_ANSWER` uma vez, seguido de `GAME_OVER`;
  - o `?`;
  - com `READY = 3` por um momento, as estreias do N2 e do N3.

  Mudança em relação ao rascunho: alavanca e castor trocaram de lugar.
- 05/10/2026: depois de jogar, o usuário disse que tudo estava destacado e a criança não sabia
  onde tocar, além dos "popups de verdade". Entrou a regra do §4b. Saíram:
  - o brilho pulsante nos pés dos três bichinhos;
  - a pulsação do ABRIR e o balanço do castor;
  - os carimbos VERDADE e FALSO, inclusive os das fichas do fim;
  - as estrelas na placa, a placa crescendo no erro e o anel laranja.

  No erro, o culpado treme e o castor diz "Falso! O sapo está sem chapéu.". Conferido no
  navegador: tela de arrumar, acerto, erro e mural.
