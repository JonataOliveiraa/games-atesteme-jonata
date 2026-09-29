import type Phaser from 'phaser'

export type Attribute = 'cor' | 'forma' | 'tamanho'
export type Color = 'vermelho' | 'azul' | 'amarelo'
export type Shape = 'circulo' | 'quadrado' | 'triangulo' | 'retangulo'
export type Size = 'pequena' | 'media' | 'grande'

export interface Stone {
    color: Color
    shape: Shape
    size: Size
}

export interface PhaseDef {
    id: string
    rule: Attribute
    baskets: string[]
    stones: Stone[]
}

export interface LevelConfig {
    level: number
    title: string
    message: string
    phases: PhaseDef[]
}

export interface StoneView {
    sprite: Phaser.GameObjects.Sprite
    stone: Stone
    homeX: number
    homeY: number
    placed: boolean
}

export interface BasketView {
    sprite: Phaser.GameObjects.Sprite
    glow: Phaser.GameObjects.Graphics
    sign: Phaser.GameObjects.Container
    plaque: Phaser.GameObjects.Graphics
    value: string
    x: number
}
