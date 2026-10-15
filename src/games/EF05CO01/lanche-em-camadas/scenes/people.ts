import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CHEF_CELL, CHEF_SHEET, CUSTOMER_COL, CUSTOMER_SHEET, KITCHEN_KEY, cellKey, type FigureData } from '../data/files'
import { CHEF, COUNTER, DEPTH } from '../data/layout'
import type { Rect, Vec } from '../types'
import { refOf } from './art'
import type { View } from './view'

export interface Chef {
    toss(): void
    pose(cell: number): void
    destroy(): void
}

export function createChef(scene: Phaser.Scene, view: View): Chef {
    const img = view.world(scene.add.image(CHEF.x, CHEF.y, CHEF_SHEET.key, cellKey(CHEF_CELL.idle)).setOrigin(0.5, 1).setDepth(DEPTH.chef))
    img.setScale(CHEF.height / refOf(scene, CHEF_SHEET))
    const { sill } = CHEF
    const ledge = view.world(scene.add.image(0, 0, KITCHEN_KEY).setOrigin(0).setCrop(sill.x, sill.y, sill.w, sill.h).setDepth(DEPTH.sill))
    let timer: Phaser.Time.TimerEvent | undefined
    const chef: Chef = {
        toss() {
            timer?.remove()
            chef.pose(CHEF_CELL.toss)
            timer = scene.time.delayedCall(380, () => chef.pose(CHEF_CELL.idle))
        },
        pose(cell) {
            img.setFrame(cellKey(cell))
        },
        destroy() {
            timer?.remove()
            ledge.destroy()
            img.destroy()
        },
    }
    return chef
}

export interface Customer {
    enter(who: number): Promise<void>
    leave(): Promise<void>
    pose(col: number): void
    hop(): Promise<void>
    head(): Vec
    rect(): Rect
    destroy(): void
}

export function createCustomer(scene: Phaser.Scene, view: View): Customer {
    const img = view.world(scene.add.image(COUNTER.customerX, COUNTER.customerY, CUSTOMER_SHEET.key, cellKey(0)).setDepth(DEPTH.customer).setVisible(false))
    const scale = COUNTER.customerH / refOf(scene, CUSTOMER_SHEET)
    let who = 0

    const paint = (col: number) => {
        img.setFrame(cellKey(who * 3 + col))
        const px = (img.frame.customData as FigureData).px ?? 0.5
        img.setOrigin(px, 1).setScale(scale)
        const top = COUNTER.customerY - img.displayHeight
        const visible = Math.max(0, (COUNTER.top - top) / scale)
        img.setCrop(0, 0, img.frame.width, Math.min(img.frame.height, visible))
    }

    const customer: Customer = {
        async enter(index) {
            who = index
            paint(CUSTOMER_COL.wait)
            img.setVisible(true).setAlpha(1).setX(COUNTER.customerX + 260)
            await FX.to(scene, img, { x: COUNTER.customerX }, { duration: 700, ease: 'Sine.easeOut' })
        },
        async leave() {
            await FX.to(scene, img, { x: COUNTER.customerX + 260, alpha: 0 }, { duration: 600, ease: 'Sine.easeIn' })
            img.setVisible(false)
        },
        pose(col) {
            paint(col)
        },
        async hop() {
            const y = COUNTER.customerY
            await FX.to(scene, img, { y: y - 24 }, { duration: 160, yoyo: true, ease: 'Sine.easeOut' })
            img.setY(y)
        },
        head: () => ({ x: COUNTER.customerX, y: COUNTER.customerY - img.displayHeight }),
        rect: () => ({ x: COUNTER.customerX, y: (COUNTER.customerY - img.displayHeight + COUNTER.top) / 2, w: img.displayWidth + 20, h: COUNTER.top - (COUNTER.customerY - img.displayHeight) + 20 }),
        destroy() {
            scene.tweens.killTweensOf(img)
            img.destroy()
        },
    }
    return customer
}
