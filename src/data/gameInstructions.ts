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
  "oficina-dos-algoritmos": [
    "Arraste os cartões para os espaços numerados.",
    "Monte todos os passos antes de testar.",
    "A ordem certa completa a fase; erros custam pontos e vidas.",
  ],
  "pixel-secreto": [
    "Observe a legenda de cores.",
    "Pinte os espaços corretos da grade.",
    "Complete a imagem escondida para avançar.",
  ],
  "base-dos-classificadores": [
    "Observe as características de cada item.",
    "Arraste para a base correspondente.",
    "Classifique tudo para concluir a fase.",
  ],
  "corrida-dos-parecidos": [
    "Observe a placa no topo: ela mostra quem combina com a rodada.",
    "Toque em uma faixa para mover o carrinho até ela.",
    "Pegue só os itens parecidos com a regra e deixe os diferentes passarem.",
  ],
  "guardioes-dos-dados": [
    "Leia cada situação com atenção.",
    "Escolha a atitude mais segura.",
    "Proteja os dados para avançar.",
  ],
  "desktop-digital-infantil": [
    "Explore os aplicativos disponíveis.",
    "Use a ferramenta certa para cada missão.",
    "Complete as missões para avançar.",
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
  "fabrica-de-maquinas": [
    "Observe qual produto a fábrica precisa produzir.",
    "Arraste as máquinas embaralhadas para a esteira na ordem correta.",
    "Clique em Iniciar Produção para testar a sequência.",
    "Se a esteira parar, leia a dica e reorganize as etapas.",
  ],
  "museu-vivo-do-computador": [
    "Leia a pergunta no painel à direita.",
    "Toque nos itens do museu que respondem à pergunta.",
    "Clique em Confirmar para validar sua escolha.",
    "Hardware você toca; software é o programa que roda dentro dele.",
  ],
  "checklist-do-jogador-seguro": [
    "Toque em cada item para ativar ou desativar a configuração.",
    "Senha forte e perfil privado devem ficar ativados.",
    "Compras, câmera e conversas com estranhos devem ficar desativados.",
    "Fique atento: novos avisos de risco podem aparecer durante a rodada.",
  ],
  "tribunal-do-verdadeiro-ou-falso": [
    "Leia a sentença apresentada com atenção.",
    "Fique de olho na palavra NÃO — ela pode inverter o sentido da frase.",
    "Toque em Verdadeiro ou Falso para julgar.",
    "No nível 3 você tem 10 segundos por sentença!",
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
  "arquivo-dos-registros": [
    "No Nível 1, leia a pergunta e toque na ficha que tem o valor correto no campo pedido.",
    "No Nível 2, examine a ficha aberta e selecione o valor correto do campo perguntado.",
    "No Nível 3, percorra todos os registros e responda à pergunta sobre o conjunto.",
    "Cada ficha é um registro com campos nomeados — como Nome, Cidade, Hobby e Animal.",
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
