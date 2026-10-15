# Quem Bate à Porta? — planejamento

Jogo **112** · EF03CO09 · 3º ano · Cultura Digital · 3ª rodada. **Substitui o *Sementes ao Vento*** (ver Histórico).
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha original: `docs/rodada-3/EF03CO09.md`.

**Réguas, nesta ordem:**
1. **O mais fácil possível, com o objetivo claro.**
2. **Metáfora fiel:** o que a tela mostra é o mundo digital de verdade (tablet, conversa, contato, encaminhar).
3. **Mostrar antes de pedir:** demonstração animada, pouco texto.
4. **Decisão sem pista que entrega.**
5. **Um nível, um assunto.**

Regras fixas da rodada:
- **1 erro encerra** (`WRONG_ANSWER` + `lose()`, com a cena do erro antes);
- `createTutorial`, com balões curtos e sem mãozinha;
- "faça o jogo" = **só o N1**.

---

## 1. O jogo em uma frase

Dentro do tablet da Nina, **cada contato é uma porta**. Alguém bate (*toc, toc!*), a porta abre, e a pessoa pede uma informação: *"Ganhe um prêmio! Me manda seu ENDEREÇO?"*. A criança decide: **ENVIAR** (a informação voa para dentro da porta) ou **NÃO ENVIAR** (ela volta para o botão e fica com a criança). Enviar para quem não devia mostra o impacto na hora: a informação é **passada adiante**, e as portas desconhecidas lá no fundo acendem, uma depois da outra, com ela.

## 2. A habilidade

> **(EF03CO09)** Reconhecer o potencial impacto do compartilhamento de informações pessoais ou de seus pares em meio digital.

| O que a BNCC pede | Onde acontece |
|---|---|
| **meio digital** | o jogo abre com a Nina no sofá, de tablet na mão, e a câmera **entra na tela**. As portas são os contatos do aplicativo de conversa |
| **compartilhamento** | ENVIAR: a informação sai da Nina e entra pela porta de quem pediu |
| **potencial impacto** | o que foi enviado **fica lá** (aparece na porta) e pode ser **encaminhado**: as portas cinzentas do fundo acendem com a informação. No N3, APAGAR some só com a cópia da Nina |
| **informações pessoais** | endereço, telefone, foto do rosto, foto do passeio da família |
| **…ou de seus pares** | N2: o apelido do Davi, a foto com o Davi, o telefone do Davi. A informação tem o selo *"é do Davi"*, e a porta do Davi fica no corredor para **perguntar a ele** |

**O teste da porta.** A resposta sai de **duas coisas juntas**, sem pista que a entregue:
- **quem bate** (a plaquinha da porta: VOVÓ, TURMA, ESCOLA, DESCONHECIDO);
- **o que pede** (pessoal ou não; minha ou do Davi).

As portas não brilham, não ficam vermelhas e não têm cara de perigo: a do desconhecido é cinza e tem um **"?"** na plaquinha, porque é assim que um contato desconhecido aparece no celular.

**Os irmãos:**

| Jogo | O que a criança faz |
|---|---|
| *Investigação: Dados em Risco* (022, R1) | investiga incidentes de privacidade |
| *Ache o Suspeito* (067, R2) | acha **o** compartilhamento suspeito entre várias placas |
| *Esconde-Dados* (052) e *Labirinto do Cofrinho* (097) | levam o cartão de dados escondido até quem cuida |
| **Quem Bate à Porta?** (este) | **decide, pedido a pedido**, se envia, e **vê aonde vai** o que enviou e que não volta |

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| sementes de dente-de-leão, vento, muro, bairro | **portas de contatos dentro do tablet** | o usuário reprovou o *Sementes ao Vento*: *"está mt confuso, nada se encaixa, o tema nao cabe bem"*. E pediu: *"faça pra ser uma porta, onde ao abrir tem uma pessoa"*. A porta é o contato; o fundo cinza com portas que acendem é o *encaminhar* |
| TRAVA (cadeado, hesitação, opção certa pisca) | **1 erro encerra**, com o impacto acontecendo | regra da rodada |
| 3 botões desde o N1 (SOPRAR, VASO, CAMPAINHA) | N1: **ENVIAR** e **NÃO ENVIAR**. No N2 entra **PERGUNTAR AO DAVI** | um nível, um assunto. Perguntar ao dono é o comportamento certo com informação de colega |
| CAMPAINHA (adulto dá conselho) | **PERGUNTAR AO DAVI**: a porta do Davi abre e ele responde | com informação de colega, quem decide é o colega. O adulto conselheiro viraria atalho para todo pedido |
| dia = 3 sementes | **4 pedidos por nível**, com os dois lados certos | "nunca envie" não é a habilidade |
| mapa do vento + TENTAR RECOLHER | **o corredor inteiro** fecha o nível (§9); o **APAGAR** é a abertura do N3 | a irreversibilidade digital é essa: apagar do seu aparelho não apaga do dos outros |
| pedidos "apressados" sem resposta certa | todo pedido tem resposta certa; casos cinzentos ficam fora (§8) | 1 erro vale a partida |

## 4. O laço

```
toc, toc! uma porta treme (a câmera vai até ela, ease in-out)
a porta abre: a pessoa aparece com o celular e pede, num balão de conversa
  "[frase] Me manda seu [INFORMAÇÃO]?"   (pictograma + palavra)
        │
        ▼
a criança toca: ENVIAR | NÃO ENVIAR   (N2: PERGUNTAR AO DAVI, quando a informação é dele)
  ┌──────────────────┬──────────────────────┬─────────────────────────┬──────────────────────┐
ENVIAR, certo       NÃO ENVIAR, certo      ENVIAR, errado            NÃO ENVIAR, errado
a informação voa    a informação desce     a informação entra; a     a pessoa fica triste;
pela porta; a       para o botão           câmera se afasta e as     a pessoa murcha na
pessoa comemora;    NÃO ENVIAR; a porta    portas cinzentas acendem  porta, triste
o ícone fica na     fecha, com calma       uma a uma com ela
plaquinha da porta
  └──── CORRECT_ANSWER, bolinha do HUD ────┘ "Seu ENDEREÇO foi        "A turma ficou sem o
                                             passado adiante!"         seu DESENHO!"
                                             WRONG_ANSWER + lose()     WRONG_ANSWER + lose()
        │
        ▼
4 pedidos → o corredor inteiro (§9) → showLevelComplete
```

**PERGUNTAR AO DAVI (N2):**
1. Só aparece quando a informação tem o selo *"é do Davi"*.
2. A câmera vai até a porta do Davi, que abre. Ele responde num balão: *"Pode mandar!"* ou *"Não! É segredo."*. A câmera volta.
3. Não conta ponto nem erro. A resposta do Davi sai da **mesma regra** do §8, como se a informação fosse dele.
4. **Enviar sem perguntar é erro**, mesmo que o Davi fosse deixar. NÃO ENVIAR sem perguntar é sempre aceito (é o caminho seguro).

## 5. Fácil e claro

- **Um pedido por vez, sem relógio.** A porta fica aberta esperando.
- **Quem bate está escrito duas vezes:** na plaquinha da porta (ícone) e embaixo da pessoa (rótulo: VOVÓ, GRUPO DA TURMA, ESCOLA, DESCONHECIDO DO JOGO).
- **O pedido está no balão, com desenho:** o pictograma da informação e a palavra grande em maiúsculas. Uma linha, no máximo duas.
- **Dois botões grandes, com desenho e palavra, da mesma cor:** ENVIAR (aviãozinho de papel) e NÃO ENVIAR (caixinha). No N2, PERGUNTAR AO DAVI no meio, só quando cabe. São no máximo 3 alvos.
- **O destino do que é enviado fica visível:** a informação aparece no painel da porta de quem recebeu.
- **A dificuldade é só a decisão.** Nada de mira, tempo ou procurar coisa na tela.

## 6. A tela (1280 × 720)

**O corredor** (câmera em zoom 1, o plano aberto):

| Região | Centro / caixa | O quê |
|---|---|---|
| HUD | (194, 44), `?` em (1220, 56) | bolinhas = os pedidos do nível |
| porta **VOVÓ** | x 140 | lilás (só bate no N3) |
| porta **TURMA** | x 340 | menta |
| porta **DAVI** | x 540 | amarela (N2: dono das informações) |
| porta **ESCOLA** | x 740 | coral |
| porta **DESCONHECIDO** | x 960 | cinza, plaquinha com "?" |
| **lá longe** | x 1060–1270, y 200–560 | 6 portinhas cinzentas no nevoeiro (2 fileiras de 3); acendem quando algo é encaminhado |
| botões | y 652: ENVIAR (480), NÃO ENVIAR (800); N2: PERGUNTAR AO DAVI (640, e os outros abrem para 400 / 880) | 230 × 104 |

Portas: 170 × 300, com o chão em y 560. A plaquinha fica no alto da porta (y ≈ 300).

**O pedido** (câmera em zoom ≈ 1.9 na porta que bateu): a porta aberta com a pessoa em pé ocupa a metade esquerda da vista; o **balão de conversa** fica à direita da porta; o **rótulo de quem é** embaixo da pessoa. Os botões e o balão ficam fora do container do corredor, fixos na tela, e não sofrem zoom.

**Teclado:** `←` ENVIAR, `→` NÃO ENVIAR, `↑` PERGUNTAR, `Espaço`/`Enter` no balão.

## 7. Tutorial (por nível, uma vez)

**Abertura do jogo (só na 1ª vez):** a Nina no sofá com o tablet (`bg-sala`). A câmera entra na tela do tablet e o corredor de portas aparece. Sem texto.

**N1:**
1. Balão: *"Cada porta é alguém da internet. Quem bate pede uma informação."* [Ver]
2. **Demonstração automática, com explicação.** Em cada pedido, antes do toque, vêm 4 balões curtos (`TEACH` no `words.ts`): **quem é** (destaque na pessoa), **o que pede** (destaque no balão), **por que pode ou não pode** e **o certo** (destaque no botão). Para o desconhecido: *"Você NÃO conhece essa pessoa. Ela é de um jogo da internet."*, *"Ela promete um prêmio só para pegar o seu ENDEREÇO."*, *"Com o ENDEREÇO, um estranho descobre onde você mora. É perigoso!"*, *"Por isso, o certo é NÃO ENVIAR."*. Depois a seta e o toque:
   - toc, toc na porta DESCONHECIDO; ela abre: *"Ganhe um prêmio! Me manda seu ENDEREÇO?"*. A seta de pontinhos aponta NÃO ENVIAR, o botão recebe o "toque", o endereço volta para o botão e a porta fecha;
   - toc, toc na porta ESCOLA: *"Manda seu DESENHO pro mural?"*. A seta aponta ENVIAR; o desenho voa pela porta, a professora comemora e o ícone fica na plaquinha.
3. Balão: *"Sua vez!"* [Vamos lá!]

Os pedidos 1 e 2 repetem os dois casos da demonstração, agora com a criança jogando e a seta apontando o botão certo até o toque. A partir do 3º, sem seta.

**N2:**
1. Balão: *"Algumas informações são do Davi. Pergunte a ele!"* [Ver]
2. Demonstração: a TURMA pede *"o APELIDO DO DAVI"* (selo *"é do Davi"*). A seta aponta PERGUNTAR; a porta do Davi abre: *"Não! É segredo."*; volta, e a seta aponta NÃO ENVIAR.
3. *"Sua vez!"* [Vamos lá!]

**N3:** a estreia do **APAGAR**, interativa e sem nota:
1. *"Ontem a Nina enviou uma foto."* O corredor mostra a foto na porta do desconhecido e nas portinhas do fundo.
2. A seta aponta a foto na caixinha da Nina, com o botão APAGAR (lixeira). A criança toca: a cópia dela some, e **as das portas continuam lá**.
3. Balão: *"Apagar daqui não apaga de lá."* [Vamos lá!]

## 8. Pedidos e níveis (`data/levels.ts`)

`{ asker, info, owner?, guided? }`. A resposta certa sai da **regra**, e não da missão. A validação cobra isso.

**A regra (`answerOf`):**
- informação **pessoal** (endereço, telefone, foto do rosto, foto do passeio): ENVIAR **só para a família** (VOVÓ); para os outros, NÃO ENVIAR;
- informação **não pessoal** (desenho, cor favorita): ENVIAR para quem a gente conhece (TURMA, ESCOLA, VOVÓ);
- informação **do Davi**: a resposta dele é a regra acima aplicada à informação; ENVIAR só **depois de perguntar** e ouvir *"Pode"*.

**Fora do jogo, por serem cinzentos** (a validação recusa):
- informação não pessoal para desconhecido (desenho para um desconhecido?);
- a senha (sempre não; não ensina nada sobre *quem* pede);
- o Davi pedindo e o Davi como dono no mesmo pedido.

| Quem bate | Frase do balão | Ao enviar |
|---|---|---|
| DESCONHECIDO DO JOGO | *"Ganhe um prêmio! Me manda…"* | fica na porta cinza **e** é encaminhado para as portinhas do fundo |
| GRUPO DA TURMA | *"Manda pra gente…"* | fica na porta da turma; se for pessoal, também é encaminhado (o grupo tem muita gente) |
| ESCOLA | *"Manda pro mural…"* | fica na porta da escola |
| VOVÓ | *"Que saudade! Me manda…"* | fica na porta da vovó |

| Nível | # | Pedido | Resposta |
|---|---|---|---|
| 1 | 1 | DESCONHECIDO quer seu **ENDEREÇO** *(seta)* | NÃO ENVIAR |
| 1 | 2 | ESCOLA quer seu **DESENHO** *(seta)* | ENVIAR |
| 1 | 3 | DESCONHECIDO quer seu **TELEFONE** | NÃO ENVIAR |
| 1 | 4 | TURMA quer sua **COR FAVORITA** | ENVIAR |
| 2 | 1 | TURMA quer o **APELIDO DO DAVI** *(é do Davi; Davi: "Não!"; seta)* | PERGUNTAR → NÃO ENVIAR |
| 2 | 2 | TURMA quer a **FOTO COM O DAVI** *(é do Davi; Davi: "Pode!"; seta)* | PERGUNTAR → ENVIAR |
| 2 | 3 | DESCONHECIDO quer o **TELEFONE DO DAVI** *(é do Davi)* | NÃO ENVIAR (perguntando ou não) |
| 2 | 4 | ESCOLA quer seu **DESENHO** | ENVIAR |
| 3 | 1 | TURMA quer seu **ENDEREÇO** | NÃO ENVIAR |
| 3 | 2 | VOVÓ quer a **FOTO DO PASSEIO** | ENVIAR |
| 3 | 3 | DESCONHECIDO quer a **FOTO DO PASSEIO** | NÃO ENVIAR |
| 3 | 4 | TURMA quer seu **DESENHO** | ENVIAR |

**Assunto de cada nível:**
- **N1, as minhas informações:** pessoal × não pessoal, conhecido × desconhecido;
- **N2, as informações do amigo:** entram o selo *"é do Davi"* e PERGUNTAR;
- **N3, quem pede importa:** a mesma TURMA recebe o desenho e não o endereço; a mesma FOTO vai para a vovó e não para o desconhecido. Entra o APAGAR.

**`validateLevels`:**
- 4 pedidos por nível;
- a resposta de cada pedido bate com a regra, e nenhum é cinzento;
- cada nível tem pelo menos 1 ENVIAR e 1 NÃO ENVIAR certos;
- a mesma resposta não se repete 3 vezes seguidas;
- todo pedido de colega tem `owner` e só existe a partir do N2;
- a VOVÓ só bate no N3;
- o balão cabe em 2 linhas de 28 letras.

## 9. O fim do nível: o corredor inteiro

1. A câmera se afasta até o corredor inteiro (ease in-out).
2. Cada porta que recebeu alguma coisa dá um pulinho, uma por vez, mostrando no painel o que ganhou. As portinhas do fundo continuam apagadas (num nível sem erro, nada foi encaminhado).
3. Confete e `showLevelComplete`, com a regra do nível na mensagem.

Não há quadro de resumo nem caixinha COMIGO: o usuário pediu para tirar os dois (08/10/2026).

## 10. Erros (a cena antes do `lose()`)

| Erro | O que se vê | Faixa grande |
|---|---|---|
| enviar informação pessoal para o DESCONHECIDO (ou para a TURMA) | a informação entra pela porta; a câmera se afasta; da porta saem cópias que voam para as portinhas do fundo, que acendem uma a uma com o mesmo pictograma | *"Seu ENDEREÇO foi passado adiante!"* |
| enviar informação do Davi sem perguntar (ou depois do "Não!") | as cópias voam do mesmo jeito; a porta do Davi abre e ele aparece triste | *"O APELIDO era do Davi. Você não perguntou!"* / *"O Davi disse NÃO!"* |
| não enviar o que era para enviar | a pessoa fica triste e a porta fecha devagar, com a plaquinha vazia | *"A ESCOLA ficou sem o seu DESENHO!"* |

Sem vermelho e sem susto: um "blom" grave e as portinhas acendendo em tom cinza-azulado.

## 11. Arquivos e registro

**Código** (`src/games/EF03CO09/quem-bate-a-porta/`), no esqueleto do Portas do Computador:
- `types.ts`, `index.ts`;
- `data/{levels,words,layout,theme,files}.ts`;
- `scenes/{BootScene,GameScene,hall,door,person,request,buttons,keepbox,hint,banner,finale,hud,guide,audio,art,fallback}.ts`.

Reaproveita do *Sementes ao Vento*: `theme`, `hud`, `guide`, `hint`, `banner`, `audio`, `art`, `buttons` (que ganha o 3º botão) e o esqueleto do `GameScene` (gen, `frame()`, demo, `jam`, `endLevel`). O jogo roda antes da arte, com reserva em `Graphics` nas mesmas folhas e grades.

**Texturas** (linha **chibi voador** `35`, a do Portas; prompts no [TEXTURAS.md](./TEXTURAS.md)):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-sala.png` | 1280 × 720 | a Nina no sofá com o tablet (abertura) |
| `bg-corredor.png` | 1280 × 720 | o corredor do aplicativo, sem portas; nevoeiro à direita |
| `portas.png` | 4 × 2 | 5 portas fechadas (uma cor por contato), o vão aberto, a portinha apagada e a acesa |
| `pessoas.png` | 3 × 5 | vovó, turma, escola, desconhecido e Davi, cada um em 3 poses |
| `informacoes.png` | 3 × 3 | os 9 pictogramas |
| `pecas.png` | 4 × 2 | aviãozinho, caixinha (ícone do NÃO ENVIAR), caixinha aberta (sem uso), toc-toc, coração, estrela, lixeira, balão de pergunta |
| `cover-quem-bate-a-porta.png` | 1672 × 941 | capa **com o título** |

**Registro (quando o N1 for feito):**
- o id **112** continua; o slug muda para `quem-bate-a-porta`, o título para *"Quem Bate à Porta?"* e o ícone para **📨** (o 🚪 já é do Portas do Computador);
- `gameInstructions` e `GameDetailsPage` trocam a entrada `sementes-ao-vento`;
- a pasta `src/games/EF03CO09/sementes-ao-vento/` e a de assets só saem com o OK do usuário.

## 12. Travas para quem mexer depois

- A resposta vem da **regra** (quem bate × o que pede × de quem é), nunca da missão escrita à mão.
- Todo nível tem ENVIAR e NÃO ENVIAR certos: "nunca envie" não é a habilidade.
- PERGUNTAR nunca é erro e nunca aparece quando a informação é da Nina.
- As portas não marcam a resposta: mesmo tamanho, mesmo brilho; a do desconhecido é só cinza e com "?".
- Um pedido por vez, sem relógio. Os botões têm a mesma cor.
- A cena do erro vem antes do `lose()` e mostra o impacto (portinhas acendendo, o Davi triste, a porta vazia).
- O que aparece na tela é digital: o tablet, a conversa, o contato, o encaminhar.

## 13. Dúvidas

1. **O título.** *Quem Bate à Porta?* Se preferir outro, muda só o catálogo, a capa e o `words.ts`.
2. **A abertura no sofá.** Ela ancora "isso acontece dentro do tablet". Se achar que atrasa, a cena fica só na 1ª vez e pode ser pulada no toque.

## Histórico

- **08/10/2026** — **replanejado do zero.** O *Sementes ao Vento* (N1 em `Graphics`, mesmo dia) foi reprovado: *"o jogo precisa ser completamente refeito, está mt confuso, nada se encaixa, o tema nao cabe bem"*.
  - Das três ideias, o usuário escolheu *Mandar ou Não?* (mensagem no celular, ENVIAR / NÃO ENVIAR, celulares acendendo com o que foi encaminhado).
  - Em seguida pediu: *"faça pra ser uma porta, onde ao abrir tem uma pessoa"*. A porta virou o contato do aplicativo, e o "celulares acendendo" virou as portinhas do fundo.
  - Saem a semente, o vento, o muro e o vaso; a CAMPAINHA vira PERGUNTAR AO DAVI; o TENTAR RECOLHER vira o APAGAR.
- **08/10/2026** — **N1 feito em `Graphics`** (*"faça o jogo. n1. graphics"*):
  - id 112 no catálogo agora é `quem-bate-a-porta` (📨), com `gameInstructions` e `GameDetailsPage` trocados. A pasta do `sementes-ao-vento` continua no disco até o OK;
  - o "zoom" é a escala de um container com o corredor (`scenes/hall.ts`). Os botões, o balão e a caixinha ficam fora dele, fixos na tela, sem segunda câmera;
  - a abertura no sofá aparece só na 1ª vez (`OPENING_KEY` no registry);
  - no erro de não enviar, a porta fica aberta com a pessoa triste enquanto a faixa aparece, e a faixa fica embaixo para não cobrir a cena.

  Conferido no navegador:
  - a abertura, o tutorial, as duas demonstrações e os 4 pedidos (um com toque de verdade);
  - a caixinha aberta e o quadro *"Aonde foi cada informação"*;
  - enviar o endereço para o desconhecido: as 6 portinhas acendem com a casinha e aparece *"Seu ENDEREÇO foi passado adiante!"*;
  - não enviar o desenho para a escola: a professora triste e *"A ESCOLA ficou sem o seu DESENHO!"*, com `WRONG_ANSWER`.
- **08/10/2026** — pedido do usuário depois de ver o N1: *"remova essa tela"* (o quadro *"Aonde foi cada informação"*), *"remova esse Comigo"* e *"melhore as animaçoes"*.
  - Saíram o quadro do fim e a caixinha COMIGO (`finale.ts` e `keepbox.ts` apagados). No NÃO ENVIAR, a informação volta voando para o próprio botão. O fim do nível é o corredor inteiro, com as portas que receberam dando um pulinho, e depois o confete.
  - Animações novas:
    - a porta treme a cada toque e mostra as marquinhas de batida;
    - ao abrir, a folha gira, acende uma luz no vão e a pessoa sobe com pulo; depois fica "respirando";
    - ao receber, a pessoa pula e solta 3 coraçõezinhos; ao ficar sem, murcha e balança a cabeça;
    - a porta fecha com um baque;
    - o balão entra girando;
    - a informação voa com rastro de bolinhas e balança;
    - as cópias passadas adiante também têm rastro, e cada portinha pula ao acender.
  - Conferido no navegador: os 4 pedidos até o "Nível 1 completo!" e os dois erros.
- **08/10/2026** — **texturas entregues** (todas, menos a capa).
  - O alfa foi limpo e o layout foi refeito pelas medidas da arte (ver o `MANIFEST.md` dos assets):
    - o chão ficou em y 470 e as portas têm 260 de altura, com centros em 110–930;
    - as 5 portinhas do fundo seguem a parede que some em perspectiva, estreitadas;
    - o zoom do pedido é 1,7;
    - a turma encolhe para caber no vão;
    - o tablet do `bg-sala` está em (807, 323).
  - Corrigido o ponto de zoom da abertura, que só funcionava com o tablet no centro.
  - O balão do objetivo agora fica embaixo das portas.
  - Conferido no navegador: a abertura, o tutorial, o pedido do desconhecido, o da turma, o nível completo e o erro do endereço com as 5 portinhas acendendo.
- **08/10/2026** — **enquadramento** (*"ajuste o enquadramento"*):
  - No plano aberto, as portas estavam coladas na borda esquerda, pequenas e altas, com muito chão vazio. Agora o plano tem zoom 1,12 e está centrado.
  - As portas têm 240 de altura e espaço entre elas (centros em 186–944).
  - O close de cada porta tem zoom 1,8, com a porta e o balão centrados juntos.
  - O plano do erro tem zoom 1,9, mostra só a porta do desconhecido e as portinhas, e fica acima da faixa.
  - O destaque do objetivo segue a fileira na tela (`hall.rowRect()`), com o balão centrado embaixo.
- **08/10/2026** — **foco na porta aberta** (*"ao aparece qualquer pessoa, o plano de fundo e o resto deveria ficar escuro, focando so noq importa"*):
  - Quando a porta abre, um véu escuro (`hall.focus`) cobre o corredor e as outras portas. Ficam claros só a porta aberta com a pessoa, o balão, os botões e a seta.
  - O véu some quando a porta fecha.
  - No erro "passado adiante", as portinhas do fundo também ficam claras, para o encaminhar aparecer.
  - No erro de não enviar, o véu continua sobre a pessoa triste.
- **08/10/2026** — **explicação didática no tutorial** (*"deveria por uma explicação didatica doq está pedindo e pq é perigoso, de forma mt clara"*):
  - Cada pedido da demonstração ganhou 4 balões: quem é, o que pede, por que é perigoso (ou por que pode) e qual é o certo.
  - Os textos estão em `TEACH.who/ask/why/then` e já cobrem todas as informações e quem pede, para servir também ao N2 e ao N3.
- **08/10/2026** — **N2 e N3 feitos** (*"faça n2 e n3"*):
  - **N2, as informações do Davi:**
    - O balão ganha o selo *É DO DAVI*, e entra no meio o botão **PERGUNTAR AO DAVI**.
    - Ao perguntar, a câmera vai até a porta do Davi, que abre. Ele responde *"Pode mandar!"* ou *"Não! É segredo."*, e a resposta fica escrita no pé do balão de quem pediu.
    - A regra está em `judge()`. É erro enviar sem perguntar (*"Você enviou a FOTO COM O DAVI sem perguntar!"*), enviar depois do NÃO (*"O Davi disse NÃO, e você enviou!"*) e não enviar o que ele deixaria (*"… Era só perguntar."*). Em todos, o Davi aparece triste na porta dele.
    - A demonstração explica cada passo: quem é, o que pede, que é do Davi, que é preciso perguntar e o que ele disse.
  - **A FOTO COM O DAVI** passou a não ser pessoal. Para a turma, com a permissão do Davi, pode.
  - **N3, quem pede importa:**
    - Abre com o **APAGAR**. Ontem a FOTO DO PASSEIO foi para o desconhecido e as portinhas já estão acesas com ela.
    - A criança toca na lixeira e o cartão some (*"Mensagem apagada"*), mas a câmera mostra as portinhas ainda com a foto: *"Apagar daqui não apaga de lá."*
    - Pedidos: TURMA/ENDEREÇO (não), VOVÓ/FOTO DO PASSEIO (sim), DESCONHECIDO/FOTO DO PASSEIO (não) e TURMA/DESENHO (sim). Se o endereço for enviado à turma, ele é passado adiante no plano aberto.
  - Conferido no navegador:
    - o N2 inteiro com o tutorial, e o N3 com o APAGAR (toque de verdade na lixeira) até "Nível 3 completo!";
    - os erros "sem perguntar", "disse NÃO" e "endereço para a turma".
