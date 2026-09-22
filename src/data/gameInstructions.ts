/**
 * COMO JOGAR — as instruções que aparecem antes de a partida começar.
 *
 * Isto morava dentro do `GameDetailsPage`, declarado a cada render de um
 * componente de 1000 linhas. Saiu de lá porque agora tem DOIS leitores: a
 * página normal do jogo e a rota de embed, que mostra as mesmas instruções
 * dentro do iframe da plataforma. Duplicar o texto seria garantir que um dos
 * dois ficasse desatualizado.
 *
 * A chave é o `slug`, e não o `id`, porque é assim que estava escrito e
 * mexer nisso agora seria reescrever 45 entradas sem ganho nenhum. Slug que
 * mudar precisa de um `alias` aqui também — ou cai no texto genérico, que é
 * uma degradação aceitável.
 */

const POR_SLUG: Record<string, string[]> = {
  "canteiro-de-obras": [
    "A praça inteira é grande demais para fazer de uma vez.",
    "Toque na tesoura: o terreno se parte em pedaços.",
    "Toque num pedaço para chegar perto dele.",
    "Toque nas peças que são daquele pedaço — uma é de outro!",
  ],
  "achados-e-perdidos": [
    "Um bichinho perdido chegou no balcão.",
    "O cartaz dele só pode dizer a VERDADE.",
    "Toque numa carta que seja verdade: ela sobe no cartaz.",
    "Dizer o que ele NÃO tem também vale!",
  ],
  "kit-do-solucionador": [
    "Você leva recado na vila. Casa de porta aberta ainda não sabe.",
    "Toque numa coisa do kit: o círculo mostra até onde ela avisa.",
    "O sol acaba a cada trecho andado — quem ficou no escuro, ficou sem saber.",
  ],
  "trilha-do-amanha": [
    "Alguém do outro lado do rio precisa de você, e você não chega lá.",
    "Ande até a oficina no fim da trilha e toque em ENTRAR.",
    "Traga uma das três coisas da bancada e use na beira do rio.",
    "Um recado, uma encomenda, ou um olhar: cada nível pede uma coisa.",
    "Deu certo? Então conte o que mudou.",
  ],
  "maratona-do-algoritmo": [
    "Um skatista azul passa primeiro e mostra o caminho.",
    "Toque nas figuras embaixo para fazer o mesmo caminho.",
    "Trocou de ideia? Toque na figura lá em cima para tirar.",
    "Tudo cheio, aperte VAI — e veja o seu caminho acontecer.",
  ],
  "guilda-dos-criadores": [
    "Uma obra da caixa pousa na mesa. Ela não é sua.",
    "Toque na obra para virar: o verso diz de quem ela é.",
    "Copie o verso na plaquinha — primeiro o carimbo, depois o nome.",
    "Nome errado? A plaquinha não gruda, e o verso continua lá para conferir.",
    "Com a plaquinha pronta, a obra sobe para o mural da festa.",
  ],
  "olha-o-jornal": [
    "O carteiro traz dois jornais sobre a mesma coisa.",
    "Leia os dois e toque no que você acredita.",
    "Espalhe pela praça: mire com as setas e solte o jornal.",
  ],
  "portoes-logicos": [
    "Uma criaturinha marcha pela trilha até a bifurcação.",
    "Cada portão tem uma placa, e a de baixo é sempre o AVESSO da de cima.",
    "Toque no portão cuja frase for verdadeira para a criaturinha da vez.",
    "Errou? A placa mostra o porquê, termo a termo, e ela volta para tentar de novo.",
    "No fim da onda, os dois currais mostram as turmas separadas.",
  ],
  "oficina-dos-algoritmos": [
    "Arraste os cartões para os espaços numerados.",
    "Monte todos os passos antes de testar.",
    "A ordem certa completa a fase; erros custam pontos e vidas.",
  ],
  "ilha-dos-codigos": [
    "O baú fala uma mensagem em batidas, cores ou desenhos.",
    "Embaixo aparecem três cartões com a mensagem em outro código.",
    "Toque no cartão que diz a mesma coisa e o baú abre.",
    "No último nível, o alto-falante de cada cartão toca a resposta antes de escolher.",
  ],
  "arquiteto-das-missoes": [
    "O pedido do topo é grande demais e se parte em pedaços vazios.",
    "Toque nas partes que estão dentro dele — algumas cartas não pertencem ao pedido.",
    "Depois, coloque os passos de cada parte na ordem em que acontecem.",
    "No fim, ponha as partes prontas no plano e toque em VAI!",
    "A cada nível o pedido cresce: duas partes, depois três, depois quatro.",
  ],
  "serie-do-campeao": [
    "O cartão mostra o movimento e quantas vezes repetir.",
    "Toque no botão: cada toque é uma repetição do atleta.",
    "Encha todas as bolinhas para fechar a etapa com o selo.",
    "Um toque a mais trava o cartão: as bolinhas esvaziam e você refaz só aquela etapa.",
  ],
  "pixel-secreto": [
    "Observe a legenda de cores.",
    "Pinte os espaços corretos da grade.",
    "Complete a imagem escondida para avançar.",
  ],
  "base-dos-classificadores": [
    "A placa acima de cada cesto mostra três exemplos do que ele aceita.",
    "Arraste cada pedrinha até o cesto que combina com ela.",
    "Guarde todas as pedras para concluir a fase.",
  ],
  "corrida-dos-parecidos": [
    "Observe a placa no topo: ela mostra quem combina com a rodada.",
    "Toque em uma faixa para mover o carrinho até ela.",
    "Pegue só os itens parecidos com a regra e deixe os diferentes passarem.",
  ],
  "ritmo-da-rotina": [
    "Olhe a rotina no topo: ela mostra a ordem dos passos.",
    "Bata no MEIO do tambor quando o próximo passo chegar no círculo.",
    "Bata na BORDA quando a figura não for a hora dela.",
  ],
  "pulo-programado": [
    "Toque nas cartas para montar a lista de ações do coelho.",
    "Cada quadrado é um pedaço do caminho, na mesma ordem.",
    "Aperte VAI: se ele esbarrar, troque a carta daquele quadrado.",
  ],
  "passe-da-mensagem": [
    "O topo mostra o recado e o rosto de quem vai recebê-lo.",
    "As setas verdes apontam para quem você pode tocar.",
    "Toque num colega, depois na caixa do colega certo.",
    "A cada passe o recado vira voz, carta ou celular — e diz sempre a mesma coisa.",
  ],
  "esconde-dados": [
    "Espere a luz da lanterna apagar: verde é pode ir.",
    "Toque na moita para correr até o próximo esconderijo.",
    "No portão, entregue o cartão só para quem tem o escudo verde.",
  ],
  "guardioes-dos-dados": [
    "Leia cada situação com atenção.",
    "Escolha a atitude mais segura.",
    "Proteja os dados para avançar.",
  ],
  "meu-bichinho-conectado": [
    "Olhe o pedido do bichinho no balão de cima.",
    "Toque no aparelho da prateleira que ajuda naquele pedido.",
    "Atenda os três pedidos para deixar o bichinho feliz.",
  ],
  "desktop-digital-infantil": [
    "Explore os aplicativos disponíveis.",
    "Use a ferramenta certa para cada missão.",
    "Complete as missões para avançar.",
  ],
  "detetive-dos-modelos": [
    "Toque no veículo para pegá-lo.",
    "Toque no lugar que combina com ele: céu, estrada ou água.",
    "Se nenhum lugar servir, toque em NÃO COMBINA.",
  ],
  "hangar-dos-modelos": [
    "Compare os veículos apresentados.",
    "Use atributos como rodas, motor e meio.",
    "Classifique corretamente para vencer.",
  ],
  "desfile-do-robo-repetidor": [
    "Escolha uma seta para cada casa do caminho.",
    "Use o botão Dica para ver a regra especial do caminho.",
    "Desvie dos cones e respeite o limite de comandos do nível.",
    "Execute o programa para levar o robô até a estrela.",
  ],
  "vila-das-maquinas": [
    "O morador mostra o problema da vez em um pictograma grande.",
    "Cada máquina do galpão tem dois comandos na plaquinha embaixo dela.",
    "Toque na máquina cujos comandos resolvem aquele problema e veja eles acenderem.",
  ],
  "fabrica-de-maquinas": [
    "Observe qual produto a fábrica precisa produzir.",
    "Arraste as máquinas embaralhadas para a esteira na ordem correta.",
    "Clique em Iniciar Produção para testar a sequência.",
    "Se a esteira parar, leia a dica e reorganize as etapas.",
  ],
  "fuga-do-laboratorio": [
    "Veja no visor o que a máquina precisa fazer.",
    "Toque numa coisa do rack e depois em onde ela entra.",
    "A bandeja azul só aceita peça; o leitor roxo só aceita programa.",
    "Com as duas cheias, aperte o botão verde e veja a máquina funcionar.",
  ],
  "museu-vivo-do-computador": [
    "Leia a pergunta no painel à direita.",
    "Toque nos itens do museu que respondem à pergunta.",
    "Clique em Confirmar para validar sua escolha.",
    "Hardware você toca; software é o programa que roda dentro dele.",
  ],
  "bolhas-da-seguranca": [
    "Situações passam devagar pela tela do tablet gigante.",
    "Toque no que é perigo para envolvê-lo numa bolha.",
    "No que é seguro, não toque: a bolha estoura à toa.",
    "Perigo que chega na borda fica preso até você tocar nele.",
  ],
  "checklist-do-jogador-seguro": [
    "Toque em cada item para ativar ou desativar a configuração.",
    "Senha forte e perfil privado devem ficar ativados.",
    "Compras, câmera e conversas com estranhos devem ficar desativados.",
    "Fique atento: novos avisos de risco podem aparecer durante a rodada.",
  ],
  "cabo-de-guerra-da-verdade": [
    "O robô levanta uma placa: VERDADEIRO ou FALSO.",
    "A frase aparece com um buraco no meio.",
    "Toque na palavra que deixa a frase do jeito que ele pediu.",
    "Cada acerto puxa a corda para o seu lado.",
  ],
  "tribunal-do-verdadeiro-ou-falso": [
    "Leia a sentença apresentada com atenção.",
    "Fique de olho na palavra NÃO — ela pode inverter o sentido da frase.",
    "Toque em Verdadeiro ou Falso para julgar.",
    "No nível 3 você tem 10 segundos por sentença!",
  ],
  "corrida-do-cotidiano": [
    "O balão no alto mostra a situação para resolver.",
    "Toque no lado da placa com a tecnologia que resolve.",
    "Se a cancela fechar, toque no outro lado para seguir correndo.",
  ],
  "cidade-das-tecnologias": [
    "Toque em cada local do mapa para ver a situação.",
    "Escolha a tecnologia mais adequada para cada caso.",
    "Leia a explicação para entender o motivo da escolha certa.",
    "No nível 3 você decide rápido, sem mapa, com 30 segundos por situação.",
  ],
  "chef-dos-subproblemas": [
    "Toque nas subtarefas para colocá-las na linha do tempo.",
    "Organize-as na ordem certa para resolver a missão principal.",
    "Toque em uma subtarefa já colocada para devolvê-la e trocar a ordem.",
    "No nível 3, duas subtarefas podem ocupar a mesma faixa paralela.",
  ],
  "missao-em-pedacos": [
    "Toque numa coisa da mesa e depois no painel que leva ela.",
    "Corte a tarefa no meio: cada painel leva a metade que faz a mesma coisa.",
    "Cada painel vira uma viagem: corra, pule as pedras e desvie do lixo.",
    "No fim, faça a tarefa na bancada tocando no que vem agora.",
  ],
  "corra-enquanto": [
    "Leia a regra no alto da tela: ela diz quando o robô pode andar.",
    "Segure o dedo na tela enquanto a condição da regra estiver valendo.",
    "Solte assim que ela deixar de valer: o laço tem que parar junto.",
  ],
  "labirinto-do-enquanto": [
    "Observe a condição do bloco 'enquanto' antes de executar.",
    "O robô se move para frente enquanto a condição for verdadeira.",
    "No nível 2, escolha a condição certa entre as opções.",
    "No nível 3, clique na coluna onde você acha que o robô vai parar antes de executar.",
  ],
  "montador-de-informacoes": [
    "Observe qual informação precisa ser formada.",
    "Arraste cada dado solto para o campo correto.",
    "Clique em Validar informação para testar a combinação.",
    "Dados isolados podem não informar muito, mas juntos formam uma informação útil.",
  ],
  "caverna-dos-dados": [
    "Toque numa pedra que brilha: o explorador vai até ela e mina com a picareta.",
    "De dentro da pedra cai uma palavra, que vai para a bolsa.",
    "No altar, toque nas palavras que contam a mesma coisa e depois em JUNTAR.",
    "Uma palavra sozinha não abre nada: a porta só aparece quando a informação fica inteira.",
  ],
  "torres-dos-formatos": [
    "Um arquivo cai por vez. Olhe no corpo dele como os dados estão arrumados.",
    "Use as setas para mover o arquivo de pista.",
    "Deixe ele pousar na caixa do formato certo: som, imagem, texto ou vídeo.",
    "Se pousar na caixa errada, ele trava ali até você levá-lo para a caixa certa.",
  ],
  "formato-certo": [
    "Observe qual informação precisa ser guardada.",
    "Escolha a caixa de formato mais adequada.",
    "Arraste os dados para os campos na ordem certa.",
    "Clique em Verificar formato para testar se a informação pode ser lida.",
  ],
  "central-de-entrada-e-saida": [
    "Observe o pedido da central.",
    "Arraste o dispositivo correto para Entrada ou Saída.",
    "Entrada leva informação para o computador; Saída mostra ou toca informação para fora.",
    "Clique em Testar conexão para verificar sua escolha.",
  ],
  "fase-de-entrada-e-saida": [
    "Leia o pedido da Lia.",
    "Toque no cartão do aparelho que resolve o pedido.",
    "Nível 1 falta a ENTRADA, nível 2 falta a SAÍDA, nível 3 tem um aparelho que não serve: troque.",
    "Se errar, a dica diz o que o aparelho faz. Tente o outro.",
  ],
  "a-busca-do-bibliotecario": [
    "O resultado com o coração é o que o visitante quer.",
    "Quem fica no 1º lugar, com a moldura dourada, vai para o visitante.",
    "Toque numa palavra: ela entra na busca e muda a ordem dos resultados.",
    "Quando o coração chegar ao 1º lugar, o achado é entregue sozinho.",
  ],
  "ache-o-suspeito": [
    "Cada placa mostra um dado seu, uma frase e para onde ela iria.",
    "Uma das placas é um compartilhamento suspeito. Acerte a bolinha nela.",
    "As setas da esquerda movem a mira. Segure para deslizar mais rápido.",
    "A mira fecha e acende quando está em cima de uma placa.",
    "Toque no botão redondo e a bolinha voa até onde a mira está.",
    "Se a bolinha passar pelo vazio, não custa nada: ela volta e você tenta de novo.",
    "No nível 2 as placas se mexem, e na última onda elas atravessam a sala.",
    "No nível 3 elas vêm tapadas: acerte para ler, e só depois acuse a suspeita.",
    "Ao acertar, a placa cai e o seu dado volta em segurança para você.",
    "Se acertar uma placa segura, a dica diz por que ela pode ser enviada.",
  ],
  "show-de-formatos": [
    "Cada cena do show leva três formatos: uma imagem, uma frase e um som.",
    "Toque numa das duas opções. Nenhuma é errada — a escolha é sua.",
    "Para trocar, toque na aba IMAGEM, FRASE ou SOM e escolha de novo.",
    "Com os três prontos, toque em APRESENTAR e veja a cena no telão.",
    "No fim, as três cenas tocam juntas como um clipe, e o palco apaga para você assistir.",
    "No nível 3 você escolhe o tema do show antes de começar.",
  ],
  "detetives-da-busca": [
    "Leia a pergunta da missão.",
    "Escolha palavras-chave e filtros para melhorar os resultados.",
    "Compare os cartões e selecione a resposta mais útil.",
    "No desafio final, marque também a estratégia de busca usada.",
  ],
  "estudio-multiformato": [
    "No Nível 1, leia a tarefa e toque no formato digital certo (Desenho, Texto, Som ou Foto).",
    "No Nível 2, pinte manchas no canvas para criar um desenho e selecione palavras para a mensagem.",
    "Toque em 'Publicar no Mural' quando sua criação estiver pronta.",
    "No Nível 3, escolha o formato correto para cada missão, crie e publique.",
  ],
  "investigacao-dados-risco": [
    "No Nível 1, decida se cada informação é Segura ou Perigosa de compartilhar.",
    "No Nível 2, leia o cenário e toque na consequência correta do compartilhamento.",
    "No Nível 3, analise o incidente em dois passos: identifique o erro e escolha a atitude certa.",
    "Dados pessoais como endereço, senha e nome da escola nunca devem ser compartilhados online.",
  ],
  "batalha-das-coordenadas": [
    "No Nível 1, toque na célula da grade que corresponde à coordenada chamada (ex: B-3).",
    "No Nível 2, observe onde está o objeto e selecione a coordenada correta entre as opções.",
    "No Nível 3, clique nas células para atacar e encontre todos os navios escondidos.",
    "Coordenadas têm linha (letra) e coluna (número): A-1 é linha A, coluna 1.",
  ],
  "o-cofre-dos-registros": [
    "Uma ficha é um registro: cada informação mora num campo com nome.",
    "Leia a pista da criatura que apareceu no aro de observação.",
    "Toque numa etiqueta da bandeja para escolhê-la; toque de novo para soltar.",
    "Depois toque no campo onde esse valor pertence: CRIATURA, COR ou LOCAL.",
    "Se o campo recusar, a dica conta o que aquele nome guarda. Tente o campo certo.",
    "Ficha completa fecha um ferrolho. Três fichas abrem a cápsula do arquivo.",
    "No nível 2 a ficha já vem preenchida e um valor não bate com a pista: toque no campo errado e escolha o valor certo.",
    "No nível 3 a ficha está certa, mas chega uma novidade: toque no campo que mudou. Os outros campos ficam como estão.",
  ],
  "pista-binaria": [
    "Uma fila de caixas vem pelo túnel: dentro de cada uma há um quadradinho cheio ou um buraco vazio.",
    "Toque no botão igual e a nave atira o dígito: 1 é o cheio, 0 é o vazio.",
    "Dígito errado trava a fila até o certo; sem tiro nenhum a fila só engarrafa, sem custo.",
    "Cada quadradinho vira um pedaço do desenho na máquina — e no fim o desenho entra na nave. ↑ ou W para 1, ↓ ou S para 0.",
  ],
  "expedicao-pixel": [
    "É noite de festa na praça e você é quem solta os fogos.",
    "A cor do fogo é feita de três luzes: vermelha, verde e azul.",
    "Toque numa torneira para abrir ou fechar. Mexer é de graça: não conta tentativa nem tira vida.",
    "O foguete na rampa vai ficando da cor que você está misturando.",
    "A placa mostra a cor que a festa pediu e a cor que você fez, lado a lado.",
    "O código da sua luz fica escrito embaixo das torneiras: 1 é aberta, 0 é fechada.",
    "Quando as duas cores forem iguais, aperte LANÇAR e veja o céu estourar.",
    "Fogo da cor errada estoura do mesmo jeito, ao lado da cor pedida — dá para ver o que faltou.",
    "No computador: 1, 2 e 3 abrem cada torneira e a barra de espaço lança.",
  ],
  "duelo-das-fontes": [
    "O robô espalha tudo sem conferir, e joga uma notícia no seu balcão.",
    "Antes de decidir, toque nos vizinhos: cada um levanta a plaquinha do que sabe.",
    "Alguém que podia saber confirmou? ESPALHE. Ninguém? SEGURE.",
  ],

  "dia-sem-internet": [
    "Os seus arquivos moram em três lugares: no computador e no pen drive, aqui na mesa, e na nuvem, lá longe no céu.",
    "Arraste a tela para cima e para baixo até achar o que o pedido pediu.",
    "Toque no botão do lugar onde você achou, e o jogo viaja até lá para abrir.",
    "Mais para a frente o fio arrebenta, e o que estava na nuvem tranca.",
  ],
  "raio-x-da-maquina": [
    "Cada máquina chega para revisão, e o raio-X mostra as peças de dentro dela.",
    "No nível 1 ela diz o nome da peça. No 2, só o que precisa. No 3, não diz nada.",
    "Toque na peça certa. Se errar, ela conta o que faz de verdade e você tenta a outra.",
    "A cada acerto vem um desafio rápido, para ver a peça trabalhando de perto.",
    "No fim, arraste os cabos na cor certa: sem energia, nenhuma peça funciona.",
  ],
  "maestro-do-sistema": [
    "Cada programa levanta um balão com a peça de que precisa para tocar.",
    "Toque no programa e a peça voa do atril até ele — aí ele começa a tocar.",
    "A peça fica ocupada um tempinho e volta sozinha quando ele termina.",
    "Quanto mais programas tocando ao mesmo tempo, mais cheia a orquestra soa.",
  ],
  "robo-sorrateiro": [
    "O robô anda sozinho até a placa SE — ali o tempo para e sobem as cartas.",
    "Cada carta tem duas linhas: o que fazer SE a coruja estiver acordada, e o que fazer SENÃO.",
    "A carta vale o trecho todo: a cada passo ela decide, e a linha que decidiu acende.",
  ],
  "revezamento-em-lista": [
    "A escalação embaixo é a sua lista: o 1º nada primeiro, o último fecha a prova.",
    "Antes de cada volta a técnica pede uma mudança — toque no nadador para pegar e no lugar onde ele entra, ou no banco para ele sair.",
    "Quando a lista estiver como ela pediu, toque no apito: a prova nada a sua lista, na ordem dela.",
  ],
  "guardiao-etico": [
    "Cada fase chega um papel para ser publicado, e a letra miúda dele não se lê de longe.",
    "Arraste a lupa pelo papel: debaixo do vidro a letra fica grande, e o que ela encontra fica marcado com um anel.",
    "Embaixo do papel ficam as ferramentas. A escolhida é o que o seu toque faz.",
    "Com o MARCADOR, toque no que é de outra pessoa para tapar. A BORRACHA desfaz. Tudo de graça.",
    "O nome de quem desenhou ou organizou nunca se tapa — senão ninguém vai saber de quem é.",
    "Quando o papel estiver pronto, aperte APROVAR. Só ele conta como resposta.",
    "A placa da direita diz para onde o papel vai: quanto mais longe, mais coisa precisa de tarja.",
  ],
  "metro-mirim": [
    "Primeiro os passageiros aparecem e dizem para onde precisam ir.",
    "Depois vem o mapa da cidade, que é maior que a tela: arraste o mapa para ver o resto.",
    "Arraste uma peça de trilho da bandeja até uma ligação tracejada — é por ali que cabe trilho.",
    "Também dá para tocar numa estação e depois na outra. Tocar no meio do trilho devolve a peça.",
    "As peças são contadas: gastar uma no lugar errado deixa alguma estação de fora.",
    "Com a bandeja vazia, o PARTIR acende. Os trens saem, e quem tiver caminho chega.",
    "No fim do nível a cidade some e sobra o desenho: bolinhas ligadas por linhas, a sua rede.",
  ],
  "mesa-de-edicao": [
    "Alguém traz uma peça quase pronta e diz, no balão, o que está incomodando.",
    "Cada nível é uma oficina: cartaz no 1, slides no 2, vídeo no 3.",
    "Embaixo fica a caixa de ferramentas do editor: cada botão muda a peça na hora.",
    "Mexer é de graça — só ENTREGAR conta. Apertar tudo no máximo estraga a peça.",
    "Se faltar alguma coisa, o cliente devolve com um bilhete dizendo o que incomoda, e o botão destrava assim que você mexer.",
    "No computador: 1, 2 e 3 são as ferramentas e a barra de espaço entrega.",
  ],
  "canhao-das-coordenadas": [
    "A fachada é uma matriz: cada janela tem uma linha e uma coluna.",
    "L é a linha, que vai de lado. C é a coluna, que desce.",
    "Leia o pedido e toque na janela onde a linha e a coluna se encontram.",
    "No nível 2 a janela é apontada: toque no cartão com o nome dela.",
    "No nível 3 cada mancha tem sua cor: MOVER tira a tinta do lugar, COPIAR deixa as duas.",
    "A linha acende primeiro, depois a coluna: é assim que se lê L2, C3.",
    "Se errar, a tinta sai cinza e não pinta. A dica mostra como pensar.",
  ],
  "arquivo-dos-registros": [
    "No Nível 1, leia a pergunta e toque na ficha que tem o valor correto no campo pedido.",
    "No Nível 2, examine a ficha aberta e selecione o valor correto do campo perguntado.",
    "No Nível 3, percorra todos os registros e responda à pergunta sobre o conjunto.",
    "Cada ficha é um registro com campos nomeados — como Nome, Cidade, Hobby e Animal.",
  ],
  "danca-aninhada": [
    "O palco pede uma sequência de movimentos: veja os pictogramas lá em cima.",
    "Toque num espaço vazio da ficha e escolha uma opção na bandeja.",
    "O bloco REPITA repete tudo o que está dentro dele — e a ordem importa.",
    "Com a ficha cheia, toque em DANÇAR: o dançarino executa o seu algoritmo.",
    "Se a dança sair diferente, ela para na primeira diferença e mostra qual espaço trocar.",
    "No Nível 2 há um laço DENTRO do outro: o de dentro repete um movimento, o de fora repete o refrão inteiro.",
    "No Nível 3 o laço de fora não conta vezes — ele espera a luz apagar, e a mesma ficha dança durações diferentes.",
  ],
  "predio-dos-lacos": [
    "No Nível 1, escolha quantas vezes o laço deve repetir para limpar todas as janelas.",
    "No Nível 2, configure o laço externo (andares) e o laço interno (janelas por andar).",
    "No Nível 3, programe os dois laços e preveja quantas janelas sujas serão limpas.",
    "O laço externo (azul) controla os andares; o laço interno (verde) controla as janelas.",
  ],
  "tradutor-da-maquina": [
    "No Nível 1, veja qual letra está destacada e selecione o código binário correto.",
    "No Nível 2, traduza cada letra da palavra para binário usando a tabela de referência.",
    "No Nível 3, faça o caminho inverso: leia o binário e descubra qual letra ele representa.",
    "Use a tabela sempre visível: A=000, B=001, C=010, D=011, E=100, F=101, G=110, H=111.",
  ],
  "atelier-codigos-digitais": [
    "No Nível 1, clique nas células da grade para reproduzir o padrão binário (preto=1, branco=0).",
    "No Nível 2, use a tabela de referência para descobrir qual letra corresponde a cada código.",
    "No Nível 3, ajuste os sliders de Vermelho, Verde e Azul para misturar a cor pedida.",
    "Toda informação digital pode ser representada em binário, letras ou valores de cor RGB!",
  ],
};

/** O texto genérico de quem ainda não tem instrução própria. */
const GENERICO = [
  "Observe o desafio na tela.",
  "Interaja com os elementos do jogo.",
  "Complete o objetivo para ganhar pontos.",
];

export function getGameInstructions(slug: string): string[] {
  return POR_SLUG[slug] ?? GENERICO;
}
