import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Duas etapas',
    objective: 'Coloque as duas subtarefas na ordem certa.',
    tip: 'Pense: o que precisa acontecer primeiro?',
    challenges: [
      {
        id: 'l1-c1',
        mainTask: 'Preparar um sanduíche simples',
        subtasks: [
          { id: 'pegar_pao', label: 'Pegar o pão' },
          { id: 'colocar_queijo', label: 'Colocar o queijo' },
        ],
        slots: [['pegar_pao'], ['colocar_queijo']],
      },
      {
        id: 'l1-c2',
        mainTask: 'Lavar as mãos antes de comer',
        subtasks: [
          { id: 'abrir_torneira', label: 'Abrir a torneira' },
          { id: 'usar_sabao', label: 'Usar o sabão' },
        ],
        slots: [['abrir_torneira'], ['usar_sabao']],
      },
      {
        id: 'l1-c3',
        mainTask: 'Guardar os brinquedos',
        subtasks: [
          { id: 'pegar_brinquedos', label: 'Pegar os brinquedos do chão' },
          { id: 'colocar_caixa', label: 'Colocar na caixa' },
        ],
        slots: [['pegar_brinquedos'], ['colocar_caixa']],
      },
    ],
  },
  {
    level: 2,
    title: 'Montando o plano',
    objective: 'Organize de 3 a 4 subtarefas na ordem certa.',
    tip: 'Imagine cada etapa acontecendo de verdade, uma depois da outra.',
    challenges: [
      {
        id: 'l2-c1',
        mainTask: 'Fazer um suco de frutas',
        subtasks: [
          { id: 'cortar_frutas', label: 'Cortar as frutas' },
          { id: 'colocar_liquidificador', label: 'Colocar no liquidificador' },
          { id: 'bater_liquidificador', label: 'Bater o liquidificador' },
          { id: 'servir_suco', label: 'Servir o suco' },
        ],
        slots: [['cortar_frutas'], ['colocar_liquidificador'], ['bater_liquidificador'], ['servir_suco']],
      },
      {
        id: 'l2-c2',
        mainTask: 'Montar uma pizza',
        subtasks: [
          { id: 'espalhar_molho', label: 'Espalhar o molho' },
          { id: 'colocar_queijo_pizza', label: 'Colocar o queijo' },
          { id: 'colocar_coberturas', label: 'Colocar as coberturas' },
          { id: 'assar_pizza', label: 'Assar a pizza' },
        ],
        slots: [['espalhar_molho'], ['colocar_queijo_pizza'], ['colocar_coberturas'], ['assar_pizza']],
      },
      {
        id: 'l2-c3',
        mainTask: 'Arrumar a cama',
        subtasks: [
          { id: 'esticar_lencol', label: 'Esticar o lençol' },
          { id: 'colocar_travesseiro', label: 'Colocar o travesseiro' },
          { id: 'colocar_cobertor', label: 'Colocar o cobertor' },
        ],
        slots: [['esticar_lencol'], ['colocar_travesseiro'], ['colocar_cobertor']],
      },
    ],
  },
  {
    level: 3,
    title: 'Tarefas em paralelo',
    objective: 'Algumas subtarefas podem acontecer ao mesmo tempo!',
    tip: 'Arraste duas subtarefas para a mesma faixa quando elas puderem ocorrer juntas.',
    challenges: [
      {
        id: 'l3-c1',
        mainTask: 'Preparar o café da manhã',
        subtasks: [
          { id: 'esquentar_leite', label: 'Esquentar o leite' },
          { id: 'fazer_torrada', label: 'Fazer a torrada' },
          { id: 'passar_manteiga', label: 'Passar manteiga' },
          { id: 'servir_mesa', label: 'Servir na mesa' },
        ],
        slots: [['esquentar_leite', 'fazer_torrada'], ['passar_manteiga'], ['servir_mesa']],
      },
      {
        id: 'l3-c2',
        mainTask: 'Organizar uma festa simples',
        subtasks: [
          { id: 'enviar_convites', label: 'Enviar os convites' },
          { id: 'decorar_sala', label: 'Decorar a sala' },
          { id: 'comprar_bolo', label: 'Comprar o bolo' },
          { id: 'receber_convidados', label: 'Receber os convidados' },
        ],
        slots: [['enviar_convites', 'decorar_sala'], ['comprar_bolo'], ['receber_convidados']],
      },
      {
        id: 'l3-c3',
        mainTask: 'Fazer a lição de casa',
        subtasks: [
          { id: 'separar_material', label: 'Separar o material' },
          { id: 'ler_enunciado', label: 'Ler o enunciado' },
          { id: 'resolver_exercicios', label: 'Resolver os exercícios' },
          { id: 'guardar_caderno', label: 'Guardar o caderno' },
        ],
        slots: [['separar_material', 'ler_enunciado'], ['resolver_exercicios'], ['guardar_caderno']],
      },
    ],
  },
]
