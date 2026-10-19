# Cabo Certo — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO05 · 5º ano · Mundo Digital · Arquitetura de computadores** · id **125** · pasta `src/games/EF05CO05/cabo-certo/`

> **(EF05CO05)** Identificar os componentes principais de um computador (dispositivos de entrada/saída, processadores e armazenamento).
>
> Exemplo oficial: explicar os componentes básicos dos computadores e suas funções — processador, memória, e exemplos de diferentes dispositivos de entrada e saída.

Pedido do usuário (19/10/2026): a ficha *Elevador da Máquina* repetia o Raio-X da Máquina (080). Ele propôs *"arrastar cabo da peça pro conector certo"*, com *"mapa maior podendo arrastar, e o computador no meio, o aluno deve conectar e interagir no componente conectado, um componente também poderia levar mais cabos"*, e mandou *"faça o jogo só com N1 usando Graphics, a textura adiciono depois"*.

---

## 0. Por que não é nenhum dos irmãos

| Irmão | O que a criança faz | O que o Cabo Certo faz diferente |
|---|---|---|
| **Monte seu Computador (035)** | leva a peça até o encaixe que tem o formato dela | **todo plugue é igual**: a tomada certa só se descobre pela **função** do aparelho |
| **Raio-X da Máquina (080)** | recebe a função e toca a peça que a faz; arrasta 3 cabos de energia no fim | a pergunta é a inversa: **recebe o aparelho e decide a função**. O cabo leva **informação**, e depois de ligado o aparelho **funciona** na mão da criança |
| **Central de Entrada e Saída (019)** | arrasta o aparelho para a caixa Entrada ou Saída | o mapa é grande e se anda nele, a informação **viaja pelo cabo** até o processador e volta, e um aparelho ligado pode **receber outro cabo** |

Da ficha ficaram: os cinco andares viraram as famílias de tomada (ENTRADA, SAÍDA, ARMAZENAMENTO, com o PROCESSADOR no meio e a MEMÓRIA a partir do N2), os pedidos em palavra de criança e o fecho *"entra, processa, guarda, mostra"*.

## 1. O jogo em uma frase

**O computador está no meio do mapa: ache o aparelho que o pedido precisa, puxe o cabo dele até a tomada certa — ENTRADA, SAÍDA ou ARMAZENAMENTO — e depois toque no aparelho para ver a informação viajar.**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **identificar** componentes | cada plugue solto é uma pergunta: *o que este aparelho faz?* A tomada responde |
| **entrada** | 4 tomadas verdes à esquerda do computador, com seta apontando para dentro |
| **saída** | 1 tomada laranja à direita, com seta apontando para fora (e outra no monitor) |
| **armazenamento** | 1 tomada roxa embaixo, com o desenho do baú |
| **processador** | o chip na janela do gabinete. Toda informação passa por ele e ele **pisca pensando** |
| **diferentes** dispositivos de entrada e saída | teclado, mouse, microfone e câmera entram; monitor e alto-falante saem |
| a **função** de cada um | depois de ligado, o aparelho funciona: o teclado escreve na tela, a câmera manda a foto, o microfone grava no pendrive |

## 3. O laço

1. **O pedido** aparece no alto, em palavra de criança: *"Quero escrever meu nome e ver na tela."*
2. **A criança acha os aparelhos** no mapa. Arrastar o chão anda pelo mapa; setinhas na borda apontam os aparelhos que estão fora da vista.
3. **Puxa o cabo** de cada um (pegando o aparelho ou o plugue) até uma tomada do computador. O cabo estica com barriga e segue o dedo; perto da borda da tela o mapa anda sozinho.
4. **Soltou na tomada certa:** clique, o plugue encaixa e o aparelho acorda.
5. **Com tudo ligado,** o alto diz qual aparelho tocar (e, se ele estiver fora da vista, uma setinha da borda aponta para ele). **Tocar no aparelho ligado faz ele funcionar:** a informação sai dele como uma bolinha de luz, corre pelo cabo, passa pelo **processador** (que pisca), sai pela tomada do outro aparelho e chega: as letras aparecem na tela, a voz entra no pendrive, a música toca. Se a bolinha sai da vista, a câmera vai atrás dela.
6. Chegou onde o pedido queria: **pedido cumprido**, e vem o próximo. Os cabos ficam ligados: a mesa vai sendo montada de um pedido para o outro.

## 4. Controle

| Gesto | Onde | Faz |
|---|---|---|
| **arrastar** | num aparelho desligado ou num plugue | puxa o cabo. Soltar longe de tomada devolve o plugue sem custo |
| **arrastar** | no chão | anda pelo mapa |
| **tocar** | num aparelho ligado | o aparelho funciona |
| **tocar** | num aparelho desligado | ele balança e pede o cabo |
| setas / WASD | teclado | andam pelo mapa (em silêncio) |

Puxar um plugue que já está numa tomada **desliga** o aparelho, e ele pode ir para outra. Assim nenhuma partida fica presa por uma tomada ocupada.

O catálogo pede um gesto só. Aqui o gesto é **puxar o cabo**; o toque no aparelho ligado é o resultado, não uma segunda decisão (é o *"interagir no componente conectado"* do pedido).

## 5. A tela e o mapa

A tela é 1280 × 720. A faixa de cima (96) é o cabeçalho; abaixo dela, uma janela de 1280 × 624 sobre um **mapa de 2400 × 1350**.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Nível 1] ●○○ │  Quero escrever meu nome e ver na tela.        │   (?)   │ faixa 96
├──────────────────────────────────────────────────────────────────────────┤
│        ◄ (mouse, microfone e câmera ficam fora da vista)                 │
│                     ┌──────────────┐          ┌────────┐                 │
│          ENTRADA ▸ ●│  ┌────────┐  │● ◂ SAÍDA │MONITOR │●  ►             │
│                    ●│  │  CHIP  │  │          └────────┘                 │
│                    ●│  └────────┘  │                                     │
│   TECLADO          ●│ PROCESSADOR  │                PENDRIVE             │
│                     └──────●───────┘                                     │
│                       ARMAZENAMENTO                                       │
└──────────────────────────────────────────────────────────────────────────┘
```

| Coisa | Onde (mapa) | Começa na vista? |
|---|---|---|
| computador | centro (1200, 700), 360 × 440 | sim |
| teclado | (800, 960) | sim |
| monitor (com 1 tomada de SAÍDA própria) | (1640, 520) | sim |
| pendrive | (1520, 1000) | sim |
| mouse | (430, 860) | não, à esquerda |
| microfone | (380, 430) | não, em cima à esquerda |
| câmera | (760, 240) | não, em cima |
| alto-falante (dorme até o pedido 3) | (2150, 830) | não, à direita |

## 6. O nível 1

**Três pedidos, que vão montando a mesma mesa.**

| Pedido | O que diz | Precisa ligar | Toca em | Chega em |
|---|---|---|---|---|
| 1 | *Quero escrever meu nome e ver na tela.* | teclado → ENTRADA · monitor → SAÍDA | teclado | as letras no monitor |
| 2 | *Quero gravar minha voz e guardar para amanhã.* | microfone → ENTRADA · pendrive → ARMAZENAMENTO | microfone | a voz no pendrive |
| 3 | *Quero ouvir a música que está no pendrive.* | alto-falante → **SAÍDA do monitor** | pendrive | o som no alto-falante |

- **O pedido 3 é o aninhamento.** A única SAÍDA do computador já está com o monitor; o alto-falante acorda e a tomada que sobra é a do monitor. A música faz o caminho pendrive → processador → monitor → alto-falante, e a criança vê a bolinha passar por dentro do monitor.
- **Mouse e câmera são distratores honestos:** podem ser ligados (são entrada) e funcionam (o cursor anda na tela, a foto aparece), mas nenhum pedido precisa deles.
- O pendrive é **armazenamento nos dois sentidos**: no pedido 2 ele recebe e guarda; no 3 ele devolve o que guardou.

## 7. Acerto e erro

| Situação | O que acontece |
|---|---|
| plugue na tomada da função certa | clique, faísca verde, o aparelho acende. `CORRECT_ANSWER` na **primeira** ligação de cada aparelho |
| plugue na tomada de **outra função** | faísca, o cabo se solta e a faixa explica: *"O microfone faz a voz ENTRAR no computador."* **A partida acaba** (padrão do catálogo: um erro encerra, as vidas são da plataforma) |
| tomada ocupada | o plugue volta sozinho, sem custo, e o processador avisa: *"Essa tomada já tem cabo."* |
| soltou longe de tomada | o plugue volta para perto do aparelho, sem custo |
| tocou num aparelho sem cabo | ele balança: *"Ligue meu cabo primeiro!"* |
| tocou e falta o destino | a bolinha chega no processador, ele pisca e pensa: *"Não tenho onde MOSTRAR!"* (ou GUARDAR, ou TOCAR). Sem custo: isso é a função da saída e do armazenamento aparecendo pela falta |

## 8. Telemetria e pontos

- `CORRECT_ANSWER` (+2) na primeira ligação certa de cada aparelho; `WRONG_ANSWER` (−5) no erro.
- `CHECKPOINT` a cada pedido cumprido, com o progresso em pedidos.
- `GAME_COMPLETED` no fim do nível, com 3 estrelas (quem chega ao fim não errou).

## 9. O que vem depois (N2 e N3, ainda não feitos)

Mesma mecânica, mais parâmetros:
- **N2:** entra a **MEMÓRIA** como tomada própria dentro do gabinete, e o par *"segure só enquanto edito"* × *"guarde para o ano que vem"*. As placas das tomadas mostram só o ícone.
- **N3:** aparelhos com mais tomadas próprias (um hub de entrada, uma câmera com cartão) e pedidos que só dizem o resultado (*"a vovó precisa ver a foto"*).

## 10. Arquivos

| Arquivo | O quê |
|---|---|
| `data/devices.ts` | os 7 aparelhos: família, posição, o que mandam e o que aceitam |
| `data/levels.ts` | o N1: tomadas do computador, pedidos e validação em dev |
| `data/route.ts` | a lógica pura: quem está ligado, por onde a informação passa |
| `scenes/board.ts` | o chão, o computador, o processador e as tomadas |
| `scenes/gear.ts` | os aparelhos, os cabos, os plugues e o que cada um faz ao funcionar |
| `scenes/flow.ts` | a bolinha de informação viajando pelos cabos |
| `scenes/view.ts` | a câmera do mapa (arrastar, setas, andar sozinho na borda) |
| `scenes/fallback.ts` | a arte de reserva em Graphics, nas mesmas chaves do [TEXTURAS.md](./TEXTURAS.md) |
