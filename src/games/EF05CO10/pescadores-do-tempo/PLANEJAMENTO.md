# Pescadores do Tempo — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO10 · 5º ano · Cultura Digital · Uso de tecnologias computacionais**
id `130` · slug `pescadores-do-tempo`

> **De onde veio.** A ficha *Diorama do Amanhã* repetia a **Trilha do Amanhã**
> (083) e o **Futuro em Cena** (040). O usuário trouxe a ideia do **400 Years**
> (o tempo passa e o mundo muda) com um pescador que troca a lança pela vara.
>
> **1ª versão reprovada (20/10/2026)**, a *Tartaruga do Tempo*: uma tartaruga
> esperava ou voltava no tempo, e a criança tinha de descobrir **qual época**
> resolvia cada pedido. Resposta do usuário: *"meio difícil de jogar, deveria ser
> mais simples… tartaruga não parece casar… continua confuso no objetivo"*.
>
> **O que mudou (opção A, escolhida pelo usuário):**
> - **a criança é o pescador.** Não tem tartaruga nem viajante;
> - **o tempo passa sozinho.** Escolher a época deixa de ser um enigma: quando a
>   ferramenta não dá conta, os anos passam e chega a ferramenta nova;
> - **o objetivo é uma ação que aparece na tela:** "Pesque o peixe grande!", e
>   para pescar basta **tocar no peixe**;
> - **a decisão que vale é a do que mudou**, entre 3 frases. É a parte da ficha
>   que mede a habilidade.

---

## 1. O jogo em três regras

1. **Você é a família de pescadores.** A vila pede um peixe: **toque nele**.
2. **Não deu? Os anos passam.** Chega o pescador seguinte da família, com uma
   ferramenta nova. Tente de novo.
3. **Pescou? Diga o que mudou.**

~~~text
┌──────────────────────────────────────────────────────────────────────────┐
│ NÍVEL 1 ●●○○        🐟 Pesque o peixe grande!                         ?   │
├──────────────────────────────────────────────────────────────────────────┤
│   céu                                         ⌂ ⌂ ⌂   a vila             │
│                                     ☺☺☺      ▔▔▔▔▔▔▔                     │
│      ⌂ casa      🧍 pescador                                              │
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀\~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │
│                     \   ><>  ><>   ← raso                                │
│        terra         \                                                    │
│                       \______                                             │
│                              ><(((°>   ← fundo (toque nele)               │
└──────────────────────────────────────────────────────────────────────────┘
~~~

**Na tela só existem o cenário, o pedido e os peixes.** Não tem botão de pescar,
nem botão de tempo, nem caminho de retratos. O que se toca é o peixe (ou a água,
quando está escuro).

---

## 2. A habilidade

> **(EF05CO10)** Expressar-se crítica e criativamente na compreensão das
> mudanças tecnológicas no mundo do trabalho e sobre a evolução da sociedade.

| O texto pede | Onde está |
|---|---|
| **mundo do trabalho** | a criança faz o trabalho do pescador, em três gerações da mesma família |
| **mudanças tecnológicas** | cada geração tem uma ferramenta que **muda o que dá para fazer**: a lança só pega no raso, a vara alcança o fundo e o celular com sonar mostra o peixe no escuro |
| **tecnologias computacionais** | hoje a neta usa o **sonar ligado ao celular**: joga a bolinha na água e os peixes aparecem na tela |
| **evolução da sociedade** | a cada passagem do tempo a casa, a vila e o rio mudam diante da criança |
| **expressar-se** | depois de cada ferramenta nova, ela **escolhe a frase do que mudou** |
| **criticamente** | hoje o celular vê tudo, mas **o peixe grande acabou**. A última pergunta é o que **continuou igual** |

### O teste da bolinha

> Troque as ferramentas por bolinhas sem significado. O jogo muda?

**Muda.** As frases só fazem sentido para quem viu a ferramenta funcionar: a
vara chegando ao fundo, a tela do celular acendendo os peixes no escuro.

---

## 3. As três gerações

| | **Bisavô** | **Vovô** | **Neta** (hoje) |
|---|---|---|---|
| casa | cabana de palha | casinha de madeira | casa de tijolo |
| vila | ocas de palha e árvores | casas de madeira | prédios, ponte |
| ferramenta | **lança** | **vara** | **vara + sonar no celular** |
| como pesca | toca no peixe → a lança voa | toca no peixe → a linha desce e fisga | toca na água → a bolinha do sonar cai e a **tela do celular** mostra os peixes → toca no peixe **da tela** |
| alcance | só o raso | raso e fundo | tudo, inclusive no escuro |
| o rio | cheio | cheio | 1 peixinho, **sem peixe grande**, uma garrafa boiando |

---

## 4. O laço

~~~text
o pedido entra no alto ("Pesque o peixe grande!")
→ a criança toca no peixe
   ↳ a ferramenta alcança: pescou! O peixe sobe, a vila pula, a fase acende
   ↳ não alcança: a ferramenta mostra o limite (a lança cai no meio do caminho,
     a linha volta vazia no escuro). NÃO É ERRO: é a deixa da história.
       → legenda "OS ANOS PASSARAM..." e a passagem do tempo (sol e lua
         correndo, chuva, a casa e a vila trocando, o filho no lugar do pai)
       → legenda "TEMPO DO VOVÔ" / "HOJE"
       → a criança toca no peixe de novo, com a ferramenta nova → pescou
→ depois de pescar com uma ferramenta nova: "O que mudou?" com 3 cartões
   ↳ certo: a cena comemora e o jogo segue
   ↳ errado: o cartão treme, faixa com a frase certa, a partida acaba
~~~

**O que é erro:** só o cartão errado. Tocar no peixe errado, tocar fora,
tentar com a ferramenta que não alcança: nada disso cobra. Toque na água vazia de
dia não faz nada.

**Ajuda parada:** sem toque por ~7 s, a bolinha com ondinhas aparece no peixe
pedido (no escuro, na água). Nunca aparece sobre um cartão.

---

## 5. O Nível 1 (o único a programar agora)

| Fase | Começa em | Pedido | O que acontece | Pergunta |
|---|---|---|---|---|
| 1 | bisavô, dia | **Pesque um peixe!** (raso) | toca no peixinho → a lança pega | — (só ensina o toque) |
| 2 | bisavô, dia | **Pesque o peixe grande!** (fundo) | toca → a lança cai no raso → **o tempo passa** → vovô → toca → a vara pega | **O que mudou?** |
| 3 | vovô, **noite** | **Pesque no escuro!** | os peixes somem no escuro; toca na água → a linha volta vazia → **o tempo passa** → hoje → toca na água → a tela do celular mostra os peixes → toca no peixe da tela → pega | **O que mudou?** |
| 4 | hoje, dia | **Peixe grande para a festa!** | toca na água → a tela não mostra peixe grande → legenda **"O PEIXE GRANDE ACABOU..."** → o pedido vira **"Pesque um peixe para a festa!"** → toca no peixinho da tela → pega → a vila faz festa | **O que continuou igual?** |

### Os cartões

As três frases saem embaralhadas. A errada nunca é absurda a ponto de se
descartar sozinha: ela fala de **outra** ferramenta, ou do que a ferramenta **não**
faz.

| Pergunta | Certa | Erradas |
|---|---|---|
| depois da vara | **A vara alcança o fundo do rio.** | A vara mostra o peixe no escuro. · A vara pesca sozinha. |
| depois do celular | **O celular mostra o peixe no escuro.** | O celular puxa o peixe sozinho. · O celular traz o peixe grande de volta. |
| no fim | **A família pesca para a vila.** | A lança de madeira. · O rio cheio de peixe grande. |

Fecho do nível: **"Muda o jeito de pescar. A festa da vila continua!"**

---

## 6. Tutorial

Com `createTutorial` (balões de 2 a 6 palavras, recorte) e a bolinha com
ondinhas. Nenhum balão fala de botão ou tecla.

- **Abertura (uma vez):** recorte no pescador: *"Você é a família de
  pescadores."* → recorte no pedido: *"A vila pede um peixe!"* → **SUA VEZ!** e a
  bolinha bate no peixinho.
- **Primeira passagem do tempo (fase 2):** não tem balão. A legenda "OS ANOS
  PASSARAM..." e a cena explicam.
- **Primeira pergunta (fase 2, uma vez):** balão *"O que mudou?"* com recorte
  pegando **os três cartões** por igual.
- **Celular (fase 3, uma vez, quando a tela aparece):** balão *"O celular mostra
  os peixes!"* com recorte na tela.
- **`?`:** um balão sobre o pedido da vez, com recorte no pedido.

---

## 7. Controles

| Ação | Toque | PC |
|---|---|---|
| pescar | tocar no peixe (zona de toque folgada, 1,6× o desenho) | clique, ou **espaço**, que mira o peixe pedido |
| pescar no escuro / jogar o sonar | tocar na água | clique, ou espaço |
| escolher a frase | tocar no cartão | clique, ou **1 / 2 / 3** |
| ajuda | `?` | H |

---

## 8. O que se aproveita da 1ª versão

O cenário dos três tempos, o pescador e as três pescarias (lança, vara, sonar),
a passagem do tempo, a noite, a vila comemorando, o cabeçalho, as legendas, a
faixa do erro e o áudio. Saem a Tuca, os botões VOLTAR / ESPERAR / PESCAR, o
caminho do tempo, o véu dos botões e a regra "pescar no tempo errado perde".
Entram o **toque no peixe**, a **tela do sonar tocável** e os **cartões**.

---

## 9. Níveis 2 e 3 (feitos em 20/10/2026, a pedido)

> **Mudança em relação ao rascunho.** O rascunho punha um **carteiro** no N2.
> Ficou a **mesma família**, porque a 1ª versão caiu por ter dois protagonistas,
> e porque o cenário dos três tempos já está pronto. O trabalho do pescador também
> é **avisar quem compra**, e a corrente búzio → telefone → **áudio no celular** é
> justamente o exemplo oficial da habilidade.

### N2 — O recado da pescaria (mudou o jeito de AVISAR)

**Gesto novo, assunto novo:** em vez de tocar no peixe, a criança **toca em quem
vai receber o recado**: a turma da vila (do outro lado do rio) ou o **mercado da
cidade** (uma bolha redonda no alto à direita, "lá longe", com o vendedor dentro).
O recado sai com a ferramenta da época:

| | **Bisavô** | **Vovô** | **Neta** (hoje) |
|---|---|---|---|
| ferramenta | **búzio** (concha) | **telefone de fio** | **áudio no celular** |
| como sai | ondas de som cruzam o rio | uma luz corre pelo fio até a bolha | o balãozinho de áudio voa até a bolha |
| limite | o som **não chega longe** | o vendedor **precisa atender na hora** | quem **não tem celular** não recebe |

| Fase | Começa em | Pedido | O que acontece | Pergunta |
|---|---|---|---|---|
| 1 | bisavô | **Avise a vila: tem peixe!** | toca na vila → o búzio soa → a vila pula | — |
| 2 | bisavô | **Avise o mercado da cidade!** | toca na bolha → as ondas morrem no meio → **O SOM NÃO CHEGA TÃO LONGE!** → os anos passam → vovô → toca → o telefone toca na bolha, o vendedor atende | **O que mudou?** |
| 3 | vovô | **Avise o mercado de novo!** | toca → TRIM, TRIM… o vendedor está ocupado com fregueses → **NINGUÉM ATENDEU!** → os anos passam → hoje → toca → a neta grava um áudio, o áudio chega e **espera**; o vendedor termina, ouve e sorri | **O que mudou?** |
| 4 | hoje | **Avise a vila: tem peixe!** | toca → o áudio chega nos celulares da vila, mas **a vovó da vila não tem celular** → o pedido vira **Chame a vovó com a voz!** → toca → a neta chama com as mãos na boca → a vovó pula | **O que continuou igual?** |

| Pergunta | Certa | Erradas |
|---|---|---|
| depois do telefone | **O telefone leva a voz para longe.** | O telefone leva o peixe para a cidade. · O telefone mostra o peixe para o vendedor. |
| depois do áudio | **O áudio espera a pessoa ouvir depois.** | O áudio só chega se a pessoa atender na hora. · O áudio leva o peixe para a cidade. |
| no fim | **A família avisa a vila que tem peixe.** | O búzio de concha. · O telefone com fio. |

Fecho: **"Muda o jeito de avisar. A conversa com a vila continua!"**

### N3 — O amanhã (inventar e escolher o que manter)

Entra uma **4ª época, o AMANHÃ**, com a **bisneta**. A criança cria: escolhe a
invenção que muda o rio e escolhe com que ferramenta da família pescar.

| Fase | Começa em | Pedido | O que acontece | Pergunta |
|---|---|---|---|---|
| 1 | hoje | **Pesque o peixe grande!** | toca na água → o sonar mostra que **o peixe grande acabou** → legenda **E AMANHÃ?** → os anos passam → amanhã (o rio ainda turvo, com lixo) → o pedido vira **Invente: traga o peixe grande de volta!** → **3 cartões de invenção** (nenhuma é errada) → a invenção trabalha no rio → o peixe grande volta | **O que mudou?** (sobre a invenção escolhida) |
| 2 | amanhã | **Peixe grande para a festa!** | **caixa de ferramentas da família**: lança, vara, celular. Escolhe, toca no peixe. A lança cai no raso (não é erro: escolhe de novo) | **O que do passado você quer manter?** (todas valem) |
| 3 | amanhã, **noite** | **Pesque no escuro!** | caixa de ferramentas de novo; lança e vara não veem no escuro (não é erro); o celular acha o cardume | **O que continuou igual?** |

**As invenções** (uma folha só, cada uma com dois quadros):

| Invenção | No rio | Certa | Erradas |
|---|---|---|---|
| **robô limpador** | um barquinho-robô recolhe a garrafa e o pneu, a água clareia | **O robô tira o lixo do rio.** | O robô pesca o peixe grande sozinho. · O robô faz o peixe crescer. |
| **berçário de peixes** | um cesto boiando solta filhotes que crescem | **O berçário protege os filhotes até crescerem.** | O berçário pesca os peixes grandes. · O berçário tira o lixo do rio. |
| **drone de árvores** | o drone planta mudas na beira, as árvores crescem e a água clareia | **O drone planta árvores na beira do rio.** | O drone pesca o peixe lá do céu. · O drone tira o lixo do fundo do rio. |

**"Manter"** (fase 2): *A vara do vovô.* · *Pescar só o que a vila precisa.* ·
*O búzio para chamar a vila.* Qualquer um acende verde e a cena comemora (é a
parte de expressão da ficha; o que se cobra é o "o que mudou" e o "continuou igual").

**"Continuou igual"** (fase 3): certa **A família pesca para a festa da vila.** ·
erradas *A lança de madeira.* · *O rio sem peixe grande.*

Fecho: **"Você inventou o amanhã e guardou o que importa!"**

**Controles novos:** os cartões de invenção e a caixa de ferramentas são botões
grandes com desenho e nome (teclas 1/2/3 no PC). A caixa abre no corte de terra,
embaixo da margem, que no N1 fica vazio.

---

## 10. Dúvidas

1. **O nome.** "Pescadores do Tempo" troca o slug e a capa. Outra opção é "Rio
   do Tempo", que põe o rio no centro, porque ele é o que fica em todas as épocas.
2. **A fase 4 tem dois toques e uma reviravolta** (o pedido muda). Se ficar
   comprido, a reviravolta vira só a legenda e a fase acaba ali, sem pescar.
