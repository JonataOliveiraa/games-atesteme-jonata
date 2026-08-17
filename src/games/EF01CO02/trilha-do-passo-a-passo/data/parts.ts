import type { RobotPartDef, RobotPartId } from '../types';

export const ROBOT_PARTS: Record<RobotPartId, RobotPartDef> = {
  head:      { id: 'head',      label: 'Cabeça',         cardAssetKey: 'robot_head', anchorAssetKey: 'robot_head_anchor',      anchorGlowAssetKey: 'robot_head_anchor_glow' },
  body:      { id: 'body',      label: 'Corpo',          cardAssetKey: 'robot_body', anchorAssetKey: 'robot_body_anchor',      anchorGlowAssetKey: 'robot_body_anchor_glow' },
  left_arm:  { id: 'left_arm',  label: 'Braço Esquerdo', cardAssetKey: 'robot_arm',  anchorAssetKey: 'robot_left_arm_anchor',  anchorGlowAssetKey: 'robot_left_arm_anchor_glow' },
  right_arm: { id: 'right_arm', label: 'Braço Direito',  cardAssetKey: 'robot_arm',  anchorAssetKey: 'robot_right_arm_anchor', anchorGlowAssetKey: 'robot_right_arm_anchor_glow' },
  left_leg:  { id: 'left_leg',  label: 'Perna Esquerda', cardAssetKey: 'robot_leg',  anchorAssetKey: 'robot_left_leg_anchor',  anchorGlowAssetKey: 'robot_left_leg_anchor_glow' },
  right_leg: { id: 'right_leg', label: 'Perna Direita',  cardAssetKey: 'robot_leg',  anchorAssetKey: 'robot_right_leg_anchor', anchorGlowAssetKey: 'robot_right_leg_anchor_glow' },
};