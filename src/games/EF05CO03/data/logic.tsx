import type {
    AndNode,
    ExprNode,
    LeafNode,
    NotNode,
    OperatorKind,
    OperatorNode,
    OrNode,
} from '../types'

/** Construtores curtos, para as fases não virarem uma parede de chaves. */
export const folha = (
    id: string,
    text: string,
    value: boolean,
    unknown = false,
): LeafNode => ({ kind: 'folha', id, text, value, unknown })

export const nao = (child: ExprNode): NotNode => ({ kind: 'nao', child })

export const e = (left: ExprNode, right: ExprNode): AndNode =>
    ({ kind: 'e', left, right })

export const ou = (left: ExprNode, right: ExprNode): OrNode =>
    ({ kind: 'ou', left, right })

export const isLeaf = (n: ExprNode): n is LeafNode => n.kind === 'folha'

export const isOperator = (n: ExprNode): n is OperatorNode => n.kind !== 'folha'

/** Valor verdade correto do nó. É a fonte da verdade de toda a correção. */
export function evalExpr(node: ExprNode): boolean {
    switch (node.kind) {
        case 'folha':
            return node.value
        case 'nao':
            return !evalExpr(node.child)
        case 'e':
            return evalExpr(node.left) && evalExpr(node.right)
        case 'ou':
            return evalExpr(node.left) || evalExpr(node.right)
    }
}

/** Avalia usando o que a criança marcou, não o gabarito. */
export function evalWith(node: ExprNode, marks: Map<string, boolean>): boolean {
    switch (node.kind) {
        case 'folha':
            return marks.get(node.id) ?? node.value
        case 'nao':
            return !evalWith(node.child, marks)
        case 'e':
            return evalWith(node.left, marks) && evalWith(node.right, marks)
        case 'ou':
            return evalWith(node.left, marks) || evalWith(node.right, marks)
    }
}

/** Folhas na ordem de leitura, da esquerda para a direita. */
export function collectLeaves(node: ExprNode): LeafNode[] {
    if (node.kind === 'folha') return [node]
    if (node.kind === 'nao') return collectLeaves(node.child)
    return [...collectLeaves(node.left), ...collectLeaves(node.right)]
}

export function collectOperators(node: ExprNode): OperatorNode[] {
    if (node.kind === 'folha') return []
    if (node.kind === 'nao') return [node, ...collectOperators(node.child)]
    return [node, ...collectOperators(node.left), ...collectOperators(node.right)]
}

/** Profundidade de operadores — usada para escolher o espaçamento do painel. */
export function exprDepth(node: ExprNode): number {
    if (node.kind === 'folha') return 0
    if (node.kind === 'nao') return 1 + exprDepth(node.child)
    return 1 + Math.max(exprDepth(node.left), exprDepth(node.right))
}

export const OPERATOR_LABEL: Record<OperatorKind, string> = {
    nao: 'NÃO',
    e: 'E',
    ou: 'OU',
}

export const OPERATOR_TEXTURE: Record<OperatorKind, [string, string]> = {
    nao: ['op-nao', 'op-nao-on'],
    e: ['op-e', 'op-e-on'],
    ou: ['op-ou', 'op-ou-on'],
}

/** Texto da mini tabela-verdade que abre ao tocar no operador. */
export const OPERATOR_RULE: Record<OperatorKind, string> = {
    nao: 'O NÃO inverte: o verdadeiro vira falso e o falso vira verdadeiro.',
    e: 'O E só é verdadeiro quando as duas partes são verdadeiras.',
    ou: 'O OU é verdadeiro quando pelo menos uma das partes é verdadeira.',
}

/** Linhas da tabela-verdade, para desenhar os canos acesos e apagados. */
export function truthTable(kind: OperatorKind): Array<[boolean[], boolean]> {
    if (kind === 'nao') {
        return [
            [[true], false],
            [[false], true],
        ]
    }
    const rows: Array<[boolean[], boolean]> = []
    for (const a of [true, false]) {
        for (const b of [true, false]) {
            rows.push([[a, b], kind === 'e' ? a && b : a || b])
        }
    }
    return rows
}

/** Escreve a expressão em texto corrido, para a HUD e o feedback. */
export function exprToText(node: ExprNode): string {
    switch (node.kind) {
        case 'folha':
            return node.unknown ? '?' : node.text
        case 'nao':
            return `NÃO (${exprToText(node.child)})`
        case 'e':
            return `${wrap(node.left)} E ${wrap(node.right)}`
        case 'ou':
            return `${wrap(node.left)} OU ${wrap(node.right)}`
    }
}

function wrap(node: ExprNode): string {
    return isLeaf(node) || node.kind === 'nao'
        ? exprToText(node)
        : `(${exprToText(node)})`
}