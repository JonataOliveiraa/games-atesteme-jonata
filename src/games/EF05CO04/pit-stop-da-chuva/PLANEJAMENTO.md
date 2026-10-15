# Pit Stop da Chuva — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO04 · 5º ano · Pensamento Computacional · Algoritmos com seleção condicional** · id **123** · pasta `src/games/EF05CO04/pit-stop-da-chuva/`

> **(EF05CO04)** Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, que incluam sequências, repetições e seleções condicionais para resolver problemas de forma independente e em colaboração.

Pedido do usuário (15/10/2026): a ficha *Faroleiro Esperto* repetia a Cidade das Decisões (034) e o Robô Sorrateiro (079). Ele pediu *"um estilo de gameplay bem divertido"*, escolheu o Pit Stop entre três ideias e mandou *"planeje e faça. use apenas Graphics, as texturas eu adicionarei em breve, apenas com n1"*.

---

## 0. Por que não é a ficha, e o que ela deixou

| Irmão | O que a criança faz | O que o Pit Stop faz diferente |
|---|---|---|
| **Cidade das Decisões (034)** | prevê o ramo (N1), escolhe a condição (N2) e monta o programa em blocos (N3) | a criança **é quem executa** a regra, parada a parada, e vê o resultado na pista |
| **Robô Sorrateiro (079)** | arma uma carta-regra e assiste à regra decidir; a coruja muda no meio da travessia | o céu **não muda** durante a volta: ele muda no box, antes da escolha |

Do Faroleiro ficaram três ideias:
- a criança faz o papel do computador;
- o **SENÃO cobre mais de um caso** (sol e nublado dão pneu liso);
- a **cadeia SE / SENÃO SE / SENÃO** (planejada para o N3, com o pneu intermediário).

O farol, o diário, o painel lateral, a trava e o navio-surpresa saíram.

## 1. O jogo em uma frase

**A Kika corre de kart, e você é a equipe do box: a cada parada, olhe o céu e ponha o pneu que a regra manda — SE estiver chovendo, pneu de CHUVA; SENÃO, pneu LISO.**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **seleção condicional** | a regra da equipe, sempre no alto: `SE ☔ chovendo → pneu de CHUVA` · `SENÃO → pneu LISO` |
| **simular** | a criança executa a regra com a mão, uma parada por vez, e a linha que ela usou **acende** |
| **linguagem pictográfica e escrita** | a regra tem palavra e desenho: a nuvem de chuva e o pneu de cada ramo |
| **repetição** | a corrida é um laço: volta, box, volta… e a mesma regra é lida de novo a cada parada |
| **sequência** | as paradas vêm uma depois da outra, cada uma com o seu céu |
| **resolver problema** | a Kika só ganha a corrida se todos os pneus estiverem certos |
| o SENÃO é "todo o resto" | sol **e** nublado caem no SENÃO. Nublado parece chuva, mas não está chovendo |

## 3. O laço

1. **A Kika entra no box** e o kart para no meio da tela.
2. **O céu muda** (ou não), devagar e à vista: as nuvens chegam, começa a chover, a chuva para, o sol volta. As poças aparecem e somem junto com a chuva.
3. **A decisão:** dois carrinhos de pneus, um em cada canto de baixo (CHUVA à esquerda, LISO à direita, na mesma ordem da regra). Os dois ganham a mesma borda amarela pulsante. Não há relógio, e a Kika espera.
4. **A troca:** a linha da regra que a criança usou acende (ENTÃO ou SENÃO, cada uma com o seu som). Os dois mecânicos correm até as rodas, a parafusadeira faz *zzzt-zzzt*, os pneus velhos saltam e os novos entram.
5. **A volta:** o kart sai acelerando e o autódromo corre (arquibancada, pista, box). Com o pneu certo, a Kika **ultrapassa o rival** e passa pelas poças espirrando água. Depois volta ao box.
6. Na última parada, a volta termina com o Tio Beto agitando a **bandeira quadriculada**, e a corrida está ganha.

## 4. Controle (um gesto só)

| Onde | O quê | Teclado (em silêncio) |
|---|---|---|
| canto inferior esquerdo | carrinho de pneus de **CHUVA** | A, ←, 1 |
| canto inferior direito | carrinho de pneus **LISOS** | D, →, 2 |

Um toque no carrinho. Fora da decisão os carrinhos ficam apagados e não respondem.

## 5. A tela (1280 × 720, sem rolagem)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Nível 1] ●○○ │ [SE ☁💧 chovendo → 🛞 CHUVA]  [SENÃO → 🛞 LISO] │  (?)  │ faixa 96
├──────────────────────────────────────────────────────────────────────────┤
│   ☀ / ☁ / 🌧  (o céu da parada)                                          │
│ ▓▓▓▓▓▓▓▓▓▓▓ arquibancada com torcida ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│              ┌──────── box da equipe ────────┐                           │
│ ════ mureta ═╧═══════════════════════════════╧═══════════════════════════│
│   🧔 Tio Beto        [mecânica]  🏎 Kika  [mecânico]          pista       │
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │
│ [🛞🛞 CHUVA]                  grama                         [🛞🛞 LISO]   │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Faixa do alto** (cabeçalho em faixas): o nível e as bolinhas (uma por corrida) à esquerda, **a regra** no meio e o `?` à direita.
  - A regra tem dois blocos: o do **SE** e o do **SENÃO**. O bloco usado acende quando a criança toca o carrinho.
  - Nenhum bloco acende antes do toque: o céu é a única pista.
- **O céu** (y 96–330) é pintado no código: azul com sol, cinza com nuvens, ou cinza-escuro com nuvens de chuva e gotas caindo na tela toda.
- **O autódromo** é uma faixa que se repete (arquibancada, mureta, pista e grama) e corre na volta. O **box** é o prédio da equipe atrás da pista: some pela esquerda quando a Kika sai e volta pela direita quando ela completa a volta.
- **O kart** fica em x 640, com as rodas na pista (y 600). As rodas são peças separadas, porque é o pneu que muda.

## 6. O N1 — SE / SENÃO

Um assunto só: **a regra com um SE e um SENÃO, em que o SENÃO pega dois céus.**

Regra: `SE estiver chovendo → pneu de CHUVA; SENÃO → pneu LISO`.

| Corrida | Paradas (o céu de cada uma) | Estreia |
|---|---|---|
| 1 | ☀ sol · 🌧 chuva · 🌧 chuva | os dois ramos; "continua chovendo" também é uma parada |
| 2 | ☁ nublado · 🌧 chuva · ☀ sol | **nublado**: tem nuvem, mas não está chovendo, então é o SENÃO |
| 3 | 🌧 chuva · ☁ nublado · 🌧 chuva · ☀ sol | a chuva para e fica só a nuvem |

São 10 paradas: o ENTÃO aparece 5 vezes e o SENÃO também 5 (3 de sol e 2 de nublado).

**Validação** (`validateLevels`, DEV):
- toda corrida tem os dois ramos;
- nunca 3 céus iguais seguidos;
- cada céu do SENÃO aparece pelo menos 2 vezes no nível;
- o nublado estreia depois da corrida 1;
- as corridas não encolhem, e cada uma tem de 3 a 5 paradas.

**O veredito é uma função do estado:** `tireFor(regra, céu)` decide no instante do toque. Os dados não guardam a resposta.

## 7. Erro (a cena antes do `lose()`)

Os dois erros mostram o estrago acontecendo, na pista:

| Escolha | O que acontece | Faixa |
|---|---|---|
| pneu **liso** com chuva | o kart sai, pisa na primeira poça, **aquaplana**: rodopia duas vezes e para no fardo de feno. A Kika fica tonta (estrelinhas) e o rival passa | **"Estava chovendo: pneu de CHUVA!"** |
| pneu de **chuva** sem chuva | o pneu esquenta na pista seca: sai fumaça, o kart perde força e o pneu **murcha**. O rival passa | **"Não estava chovendo: pneu LISO!"** |

Junto, o bloco certo da regra treme e o Tio Beto põe a mão na testa. Depois de ~2,3 s vêm `WRONG_ANSWER` e `lose()`.

## 8. Abertura e tutorial do N1 (uma vez)

Cada passo tem uma animação, e o balão espera o botão. Nenhum balão fala de botão ou tecla.

1. **Close no Tio Beto e na Kika**, frente a frente no box. **Tio Beto:** *"A Kika vai correr. Você cuida dos pneus!"* [Próximo].
2. **A regra aparece grande** no meio da tela. **Guia:** *"Esta é a regra da equipe."* [Próximo] → (recorte no SE) *"Chovendo? Pneu de CHUVA."* [Próximo] → (recorte no SENÃO) *"Senão, pneu LISO."* [Próximo]. A regra encolhe para o alto.
3. **Volta de aquecimento** (não conta). O jogo joga sozinho e narra:
   - céu de sol. Recorte no céu: *"Está chovendo? Não!"* [Ver]. O jogo toca o carrinho LISO (o carrinho afunda e um anel sai dele), o SENÃO acende e a equipe troca. Recorte no SENÃO: *"Sem chuva: SENÃO."* [Próximo]. A Kika dá a volta;
   - no box, **começa a chover**. Recorte no céu: *"Começou a chover!"* [Ver]. O jogo toca o carrinho de CHUVA, o SE acende e a equipe troca. Recorte no SE: *"Chuva: pneu de CHUVA."* [Próximo]. A Kika dá a volta espirrando água nas poças.
4. Começa a corrida 1. O céu da 1ª parada chega, e um balão com recorte nos **dois** carrinhos diz *"Sua vez!"* [Vamos!].

O `?` tem um balão só, com recorte na regra: *"Olhe o céu e siga a regra."* [Continuar].

## 9. Fim de corrida e fim do nível

- **Fim de corrida:** a última volta termina com o Tio Beto agitando a bandeira quadriculada. A Kika comemora, a torcida grita, a bolinha acende e o Tio Beto diz a fala da corrida (*"Primeiro lugar!"*) [Próximo].
- **Fim do nível:** confete, `GAME_COMPLETED` e `showLevelComplete` com JOGAR DE NOVO (só existe o N1). Não há quadro de resumo nem replay das paradas.

Cada parada certa emite `CORRECT_ANSWER` (+3 pontos; 10 paradas = 30).

## 10. N2 e N3 (só planejados; entram quando o usuário pedir)

- **N2 — OU.** É o OU do exemplo oficial (*"vermelho OU amarelo"*): `SE estiver chovendo OU a pista estiver molhada → CHUVA; SENÃO → LISO`. Entra o céu **"acabou de chover"**: sol, mas com poças brilhando. Assunto: uma condição com duas partes.
- **N3 — SENÃO SE.** A cadeia da Fórmula 1: `SE chuva forte → CHUVA; SENÃO SE garoa → INTERMEDIÁRIO; SENÃO → LISO`. São três carrinhos e um céu novo, a **garoa** (gotinhas finas e nenhuma poça).

## 11. Dados e arquivos

```
index.ts  types.ts
data/   files.ts layout.ts theme.ts timing.ts weather.ts levels.ts words.ts
scenes/ BootScene.ts GameScene.ts fallback.ts art.ts audio.ts view.ts guide.ts
        header.ts rule.ts track.ts sky.ts kart.ts crew.ts carts.ts effects.ts bubble.ts banner.ts
```

- `track.ts` guarda a distância da volta (`d`, de 0 a 3840 = 3 vezes a faixa, para a emenda não pular) e move o autódromo, o box, as poças, os fardos e quem anda com o box (a equipe).
- O kart é um container com o corpo (célula inteira, sem cortar o alfa, para as rodas ficarem sempre no mesmo lugar) e as duas rodas por cima.

**Arte:** o N1 roda inteiro com a **arte de reserva** em Graphics, assada nas mesmas folhas e grades do TEXTURAS (`scenes/fallback.ts`). Um PNG com o mesmo nome em `src/assets/games/EF05CO04/pit-stop-da-chuva/` substitui a reserva sem mudar código. O céu, a chuva, as gotas, os espirros, a fumaça das rodas e as linhas de velocidade são do código para sempre (voam, piscam, somem).

## 12. Dúvidas

1. ~~**Linha de arte:** chibi voador (`35`).~~ **Fechada em 15/10/2026:** o usuário mandou duas ilustrações de moda (dois casais em traço fino e cor chapada) e pediu *"siga esse estilo de arte nos prompts"*. As imagens ficaram guardadas como `references/40-moda-chapada-a.png` e `41-moda-chapada-b.png`, e o TEXTURAS foi reescrito na linha **moda chapada**: proporção esguia, não chibi. Só os prompts mudaram; o código, as folhas e as grades ficaram iguais.
2. **Dirigir entre os boxes:** ficou fora do N1 (uma coisa por vez). Se no teste a volta parecer parada, entra ◀ ▶ para trocar de faixa e desviar de cones, e bater não conta como erro.

## Histórico

- 15/10/2026: plano, TEXTURAS e N1 em Graphics. Id 123 no catálogo (order 347, sem capa ainda); o 124 foi para o Rio de Chocolate, de outra sessão, e o `NEXT_FREE_ID` está em 125. Servidor `jogos-dev-pitstop` (porta 5287).
- Jogado no navegador:
  - a abertura em close e a regra grande com os três balões;
  - a volta de aquecimento: sol → LISO e chuva → CHUVA, com as poças espirrando;
  - as 10 paradas até "Nível 1 completo!" (30 pontos);
  - os dois erros (aquaplanagem no fardo e pneu murcho), com `WRONG_ANSWER` + `lose()`;
  - o `?`.
