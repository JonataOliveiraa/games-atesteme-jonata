# Rota da Madrugada — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO11 · 5º ano · Cultura Digital · Uso de tecnologias computacionais · id 132**

> *(EF05CO11) Identificar a adequação de diferentes tecnologias computacionais na resolução de problemas.*

---

## 0. De onde este jogo veio

A ficha da 3ª rodada era o **Mercado das Soluções** (3 bancas com etiquetas de alcance e custo, contra o Sr. Exagero, que compra sempre a mais cara). Ela repetia o catálogo:

| Jogo | Por que a ficha repetia |
|---|---|
| **Kit do Solucionador (084)** | a primeira versão dele ERA esta ficha (3 cartas, bolinhas de alcance e custo, Sr. Exagero, telão e vacinação). Caiu por repetir o 041 e porque o rival ensinava "nunca escolha a cara" |
| **Escolha a Ferramenta Certa (041)** | pedido → escolher entre tecnologias por critérios (custa pouco, muita gente vê…), com o critério que decide mudando a cada pedido |

Conversa com o usuário (20/10/2026):
- liberou repetir **estilo** de gameplay de outras rodadas (kart, corrida, pulos);
- a ideia do carro é dele: *"o jogo poderia começar com a criança num carro a noite, e ela deve usar tecnologias em seu alcance, como farol do carro pa enxergar a noite, limpador do parabrisa pra chuva, som pra avisar os vizinhos sobre algo"*;
- *"nao gostei do Sr. Exagero. nao inclua, o jogo deve se alinhar mais com a habilidade"*;
- *"o jogo deve ser facil de jogar e nao ser confuso de entender"*.

## 1. O jogo em três regras

1. **Você leva a encomenda da Dona Cida no carrinho elétrico, de noite.**
2. **Na estrada aparece um problema: o carro para e espera.**
3. **Toque na tecnologia do carro que resolve ESTE problema.**

O carro anda sozinho. Não tem volante para a criança, não tem tempo correndo na decisão: o carro só para e espera. A única coisa que ela faz é **ler o problema e escolher a tecnologia**, que é a habilidade inteira.

## 2. Como a habilidade aparece

| A habilidade pede | Como o jogo mostra |
|---|---|
| **diferentes tecnologias** | a central do carro é um computador com 4 botões fixos: BUZINA, FAROL, MENSAGEM, LIMPADOR. São aparelhos diferentes, não modos do mesmo |
| **na resolução de problemas** | o problema acontece no para-brisa (escurece, chove, um cachorro dorme na rua, chegou a casa) e vem escrito no alto, na voz da cena |
| **adequação** | a mesma tecnologia é certa num problema e errada em outro. A BUZINA acorda o cachorro (certo) e acorda a rua toda na casa da Dona Cida (exagero). A MENSAGEM avisa a Dona Cida (certo) e não serve para o cachorro (não resolve) |
| **computacional** | é o computador do carro que liga o farol e o limpador (o limpador tem **sensor de chuva**: desliga sozinho quando a chuva para) e manda a mensagem |

O resultado é sempre medido pelo problema, nunca por um carimbo:
- **adequada:** o problema some na frente da criança (a estrada aparece, o vidro limpa, o cachorro sai, só a janela da Dona Cida acende);
- **não resolve:** o problema continua lá, e a frase diz por quê (*"A buzina não ilumina!"*, *"Cachorro não lê mensagem!"*);
- **exagera:** resolve e faz estrago (*"Acordou a rua toda!"*, todas as janelas acendem).

O veredito é uma função do problema e do aparelho (`data/rules.ts`), não um campo `answer`: cada aparelho tem o que faz (luz, limpar, avisar) e até onde chega (quem está na frente, uma pessoa, a vila toda); cada problema diz do que precisa e para quem.

## 3. A tela

~~~text
┌──────────────────────────────────────────────────────────────────────────┐
│ NÍVEL 1  ●○○○      Acabaram os postes. Está ESCURO!                  ?   │  cabeçalho 96
├──────────────────────────────────────────────────────────────────────────┤
│ ╲                  ☾   ·    ·        ·                                 ╱ │
│  ╲  coluna      ▁▁▁▁▁▁ morros ▁▁▁▁▁▁▁▁                         coluna ╱  │
│   ╲                      ╱  ┊  ╲            (para-brisa: a estrada    ╱   │
│    ╲    poste          ╱    ┊    ╲           em perspectiva, que      ╱    │
│     ╲               ╱       ┊       ╲        anda sozinha)           ╱     │
│      ╲           ╱          ┊          ╲                            ╱      │
│ ══════╲═════limpador════════════════limpador═══════════════════════╱═════ │ y 560
│      ╭───────╮     ┌────────┬────────┬────────┬────────┐               │
│     ( BUZINA )     │ BUZINA │ FAROL  │MENSAGEM│LIMPADOR│  ← a central   │
│      ╰─volante╯    └────────┴────────┴────────┴────────┘               │
└──────────────────────────────────────────────────────────────────────────┘
~~~

- **Visão de dentro do carro.** A estrada é pseudo-3D (horizonte em y 300): faixas que correm, postes, árvores e casas vindo do fundo.
- **O painel** (y 560–720) tem o volante à esquerda (o miolo é a buzina e pulsa quando ela toca) e a **central** com 4 botões grandes (ícone + nome), sempre no mesmo lugar.
- **Botão em uso** fica aceso com a palavra LIGADO e não aceita toque (o farol, depois de ligado; o limpador, enquanto chove).
- **O alto da tela** diz o objetivo enquanto o carro anda (*"Leve a encomenda até a Dona Cida!"*) e o problema quando ele para.

## 4. O nível 1 (feito)

**A vila à noite.** 4 problemas, um por bolinha. A ordem dos botões é fixa (BUZINA, FAROL, MENSAGEM, LIMPADOR) e o certo cai num lugar diferente a cada vez (2º, 4º, 1º, 3º).

| # | O que acontece no para-brisa | O alto da tela | Adequada | As outras |
|---|---|---|---|---|
| 1 | os postes acabam e a estrada some no escuro | *Acabaram os postes. Está ESCURO!* | **FAROL**: o facho abre a estrada | BUZINA *"A buzina não ilumina!"* · MENSAGEM *"Mensagem não ilumina a estrada!"* · LIMPADOR *"O limpador não ilumina!"* |
| 2 | começa a chover, o vidro embaça e enche de gotas | *Começou a CHOVER! O vidro embaçou.* | **LIMPADOR**: limpa e fica ligado pelo sensor; desliga sozinho quando a chuva passa | BUZINA *"A buzina não limpa o vidro!"* · MENSAGEM *"Mensagem não limpa o vidro!"* (o FAROL está LIGADO) |
| 3 | um cachorro dorme no meio da rua, dentro do facho | *Um cachorro dormindo no MEIO da rua!* | **BUZINA**: uma buzinadinha, ele acorda e sai | MENSAGEM *"Cachorro não lê mensagem!"* · LIMPADOR *"O limpador não acorda ninguém!"* |
| 4 | a casa da Dona Cida, numa rua de casas apagadas | *Chegou! Avise SÓ a Dona Cida. A rua está dormindo.* | **MENSAGEM**: a mensagem voa até a casa dela, só a janela dela acende e ela sai na porta | BUZINA *"Acordou a rua toda!"* (todas as janelas acendem: é o exagero) · LIMPADOR *"O limpador não avisa ninguém!"* |

O 3 e o 4 são o par que ensina a adequação: o mesmo botão (BUZINA) resolve um e estraga o outro.

Fim: a Dona Cida recebe a encomenda, confete, painel *"Nível 1 completo!"* com a frase-síntese: *"Cada problema pede a sua tecnologia: a que resolve ESTE problema."*

## 5. Erro

Errou a tecnologia: a tecnologia escolhida age (a buzina toca, a mensagem voa, o limpador passa), o problema continua (ou o estrago acontece), a frase do porquê aparece no meio da tela em laranja, e depois de ~1,6 s vem `WRONG_ANSWER` + `lose()` (1 erro encerra, ver `src/games/INSTRUCOES.md`). Botão LIGADO não aceita toque, e toque no vazio não conta.

## 6. Tutorial

Na primeira vez (chave `ef05co11-rota-l1`), narrado e curto. O jogo resolve o 1º problema sozinho:

1. *"Leve a encomenda até a Dona Cida!"* [Ver], com o para-brisa recortado. O carro sai.
2. Os postes acabam, o carro para: *"Escureceu! O carro não vê a estrada."* [Ver], recortando o para-brisa.
3. *"O computador do carro tem tecnologias. Uma resolve ESTE problema."* [Ver], recortando a central inteira, os 4 botões por igual.
4. O jogo toca no FAROL (anel no botão) e a estrada aparece. *"Sua vez!"*

Nas próximas vezes o 1º problema é da criança. O `?` (ou o botão de ajuda da plataforma) mostra um balão só: *"Leia o problema. Escolha o que resolve ESTE problema."*, recortando a central.

## 7. Níveis 2 e 3

Um assunto por nível ([um nível, um assunto]): o N1 ensina **o que** cada aparelho faz; o N2 ensina **até onde** o aviso chega; o N3 ensina que **o lugar** muda a tecnologia certa (sem sinal, o que depende do celular não funciona).

Nos dois o **farol já sai LIGADO** (é noite a viagem inteira e a criança aprendeu no N1): ele não é botão, só o facho na estrada. A central continua com **4 botões fixos**, e o certo nunca cai no mesmo lugar duas vezes seguidas.

### 7.1 Nível 2 — A serra (até onde o aviso chega)

Central: **BUZINA · GPS · MENSAGEM · ALTO-FALANTE**. Estrada de serra (`zone: 'serra'`): pinheiros, sem postes, e lá longe, do outro lado do vale, as luzinhas apagadas da vila (`vila-longe.png`).

| # | O que acontece no para-brisa | O alto da tela | Adequada | As outras |
|---|---|---|---|---|
| 1 | a estrada se divide em duas, com a placa de duas setas | *A estrada se dividiu! Qual vai pra vila?* | **GPS**: a tela da central mostra o mapinha com a rota, uma seta verde grande aparece na estrada certa e o carro entra nela | BUZINA *"A buzina não mostra o caminho!"* · MENSAGEM *"A mensagem não mostra o caminho!"* · ALTO-FALANTE *"O alto-falante não mostra o caminho!"* |
| 2 | uma vaca parada no meio da estrada, dentro do facho | *Uma vaca parada no MEIO da estrada!* | **BUZINA**: buzinadinha, a vaca se assusta e sai andando | MENSAGEM *"Vaca não lê mensagem!"* · ALTO-FALANTE *"Acordou a serra toda!"* (todas as janelas da vila longe acendem: exagero) · GPS *"O GPS não tira a vaca!"* |
| 3 | a casinha do seu Zé no alto do morro, apagada | *A vaca é do seu Zé. Avise SÓ ele! A serra está dormindo.* | **MENSAGEM**: o envelope voa até a casinha, só a janela dele acende | ALTO-FALANTE *"Acordou a serra toda!"* · BUZINA *"A buzina não chega lá em cima!"* · GPS *"O GPS não avisa ninguém!"* |
| 4 | a ponte de madeira caída, com o cavalete listrado, e a vila do outro lado | *A ponte caiu! Avise a VILA TODA.* | **ALTO-FALANTE**: ondas grandes saem do teto do carro e cruzam o vale; todas as janelas da vila acendem uma por uma | MENSAGEM *"Só uma pessoa ficou sabendo!"* (uma janela acende, as outras não) · BUZINA *"A buzina não chega na vila!"* · GPS *"O GPS não avisa ninguém!"* |

Certo em 2º, 1º, 3º, 4º. O 3 e o 4 são o par do nível: o mesmo ALTO-FALANTE é exagero para uma pessoa e o certo para a vila toda; a MENSAGEM é o contrário.

Tutorial (chave `ef05co11-rota-l2`, uma vez): *"Tecnologias novas no carro!"* [Ver] recortando a central inteira (os 4 por igual, nunca só o certo), depois *"O aviso tem que CHEGAR em quem precisa."* recortando o para-brisa, e o 1º problema já é da criança. Fim: a vila acesa, gente nas janelas, confete, *"Nível 2 completo!"*, frase: *"Para UMA pessoa, mensagem. Para a VILA TODA, alto-falante."*

### 7.2 Nível 3 — Sem sinal (o lugar muda a resposta)

Central: **GPS · MAPA · RÁDIO · MENSAGEM**. Estrada de terra (`zone: 'terra'`): sem faixa pintada, pinheiros e cerca. Na tela da central, no canto, as **barrinhas do sinal**: cortadas com um X vermelho enquanto não tem sinal, verdes quando ele volta. GPS e MENSAGEM precisam de sinal; MAPA (de papel, do porta-luvas) e RÁDIO (o rádio comunicador, que fala com quem tem outro rádio) não.

| # | O que acontece no para-brisa | O alto da tela | Adequada | As outras |
|---|---|---|---|---|
| 1 | as barrinhas caem para o X; a estrada se divide | *SEM SINAL! Qual estrada vai pra vila?* | **MAPA**: o mapa de papel abre sobre o painel, a rota aparece desenhada, a seta verde na estrada | GPS *"Sem sinal, o GPS não acha o caminho!"* (a tela gira "procurando") · MENSAGEM *"Sem sinal, a mensagem não sai!"* · RÁDIO *"O rádio não mostra o caminho!"* |
| 2 | o carro afunda na lama e a roda gira em falso | *Atolou na lama! Chame o guincho. Ainda SEM SINAL.* | **RÁDIO**: ondinhas de rádio, *"Guincho, atolei!"*, o guincho chega pela frente e puxa o carro | MENSAGEM *"Sem sinal, a mensagem não sai!"* (o envelope volta) · GPS *"O GPS não chama ninguém!"* · MAPA *"O mapa não chama ninguém!"* |
| 3 | a torre de celular aparece, as barrinhas ficam verdes; uma rua nova de asfalto, ainda sem placa | *O sinal voltou! Rua NOVA: o mapa de papel é velho.* | **GPS**: o mapinha da tela tem a rua nova, a seta verde | MAPA *"O mapa é velho: não tem esta rua!"* (o mapa abre e a rua nova não está nele) · RÁDIO *"O rádio não mostra o caminho!"* · MENSAGEM *"A mensagem não mostra o caminho!"* |
| 4 | a casa da Dona Cida (a rua do N1, de casas apagadas) | *Chegou! Avise a Dona Cida.* | **MENSAGEM**: como no N1, só a janela dela acende e ela sai na porta | RÁDIO *"A Dona Cida não tem rádio!"* · GPS *"O GPS não avisa ninguém!"* · MAPA *"O mapa não avisa ninguém!"* |

Certo em 2º, 3º, 1º, 4º. O 1 e o 3 são o par do nível: sem sinal o papel ganha, com a rua nova o GPS ganha; nenhuma tecnologia é "a melhor" sempre.

Tutorial (chave `ef05co11-rota-l3`, uma vez): quando as barrinhas caem, *"Acabou o SINAL do celular."* [Ver] recortando as barrinhas; depois *"O que precisa de sinal não funciona."* recortando a central. A criança escolhe. Fim: entrega, confete, *"Nível 3 completo!"*, frase: *"A tecnologia certa depende do problema E do lugar."*

### 7.3 O veredito com alcance e sinal

O veredito continua uma função (`data/rules.ts`), sem campo `answer`:

- aparelho: `effect` (luz · limpar · avisar · caminho), `reach` (perto · celular · todos · radio), `online` (precisa de sinal), `paper` (mapa impresso);
- problema: `need`, `audience` (bicho · pessoa), `crowd` (a vila toda), `far` (longe da buzina), `quiet` (gente dormindo perto), `radio` (quem ouve tem rádio), `offline` (sem sinal), `newRoad` (rua que o papel não tem).

~~~text
efeito diferente da necessidade      → none
online e sem sinal                    → none
caminho: papel e rua nova             → none, senão fit
avisar:
  perto    crowd ou far → none · quiet → over · fit
  celular  bicho ou crowd → none · fit
  todos    crowd → fit · senão over
  radio    radio → fit · senão none
~~~

Regras de validação por nível (`validateLevels`, para os 3): exatamente **uma** tecnologia adequada entre os botões livres, pelo menos 2 botões livres, o certo não cai no mesmo lugar em dois problemas seguidos, e todo aparelho que aparece num nível tem frase do porquê para cada problema em que erra.

## 8. Plataforma

- `GAME_READY` na criação; `CHECKPOINT` a cada problema resolvido (progresso por bolinha); `CORRECT_ANSWER` +10 no acerto (o problema resolvido pelo tutorial não pontua); `WRONG_ANSWER` −5 + `lose()` no erro; `GAME_COMPLETED` no fim do nível com `totalStages: LEVELS.length`.
- `LEVELS` tem os 3 níveis; o N1 continua sendo o de teste e o fim do N3 oferece JOGAR DE NOVO.
- Teclado em silêncio: 1, 2, 3 e 4 escolhem o botão; H abre a ajuda; `window.focus()` no toque do canvas.
- Sons: `clique.mp3` no toque dos botões e `voo.mp3` (0,9 s com fade) quando a mensagem voa, de `src/assets/games/EF05CO11/rota-da-madrugada/sons/`. **Sem música de fundo e sem som de vitória** (pedido de 20/10/2026: a música e o `fim.mp3` saíram). O resto continua em WebAudio sintetizado (motor baixinho, freio, farol, limpador, buzina, latido, mugido, alto-falante, rádio, GPS, papel, atoleiro, guincho, porta, acerto, erro), e cada arquivo que faltar cai no som sintetizado.

## 9. Arquivos

```
types.ts            DeviceId, Need, ProblemDef, LevelDef
data/devices.ts     os aparelhos: o que fazem e até onde chegam
data/rules.ts       verdict(problema, aparelho) → 'fit' | 'none' | 'over' e o porquê
data/levels.ts      LEVELS + validateLevels
data/layout.ts      horizonte, painel, central, limpadores, profundidades
data/theme.ts       cores da noite, do painel e da UI
data/timing.ts      durações (andar, frear, efeitos, erro)
data/words.ts       textos que a criança lê
data/files.ts       chaves de textura (as mesmas que os PNG vão usar)
scenes/art.ts       todos os desenhos de reserva em Graphics, assados em textura
scenes/road.ts      céu, morros, estrada em perspectiva e o que vem pela estrada
scenes/night.ts     o escuro e o facho do farol
scenes/rain.ts      chuva, gotas, vidro embaçado e os limpadores
scenes/cockpit.ts   painel, volante, central com os 4 botões
scenes/header.ts · caption.ts · guide.ts · audio.ts
scenes/GameScene.ts a viagem: anda, para no problema, julga, segue
```

## 10. Dúvidas para o usuário

- **Volante:** o carro anda sozinho, para ficar fácil. Se quiser mais ação, dá para pôr ◀ ▶ para desviar de cones entre um problema e outro (sem custo de erro).
- **Nome:** "Rota da Madrugada" é provisório.
- **A criança dirige?** O carrinho elétrico de entregas é pequeno, como um kart; se preferir, a mãe dirige e a criança cuida da central.
