// RobotSummonManager.ts
// Manages ASI-triggered robot summoning via PsiNet events with cooldown.
// See: progress-tracker tasks 5231-5233

import { EventBus } from '../core/EventBus';

export interface SummonableRobot {
  id: string;
  type: string;
  name: string;
  cooldownMs: number;
}

export class RobotSummonManager {
  private eventBus: EventBus;
  private befriended: Map<string, SummonableRobot> = new Map();
  private cooldowns: Map<string, number> = new Map(); // remaining ms

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /** Register a robot as befriended (unlocks for summoning) */
  befriend(robot: SummonableRobot): void {
    this.befriended.set(robot.id, robot);
    this.cooldowns.set(robot.id, 0);
  }

  /** Attempt to summon a befriended robot at (x, y) */
  summon(robotId: string, x: number, y: number): boolean {
    const robot = this.befriended.get(robotId);
    if (!robot) return false;

    const cooldown = this.cooldowns.get(robotId) ?? 0;
    if (cooldown > 0) return false;

    this.cooldowns.set(robotId, robot.cooldownMs);
    this.eventBus.emit({
      type: 'ROBOT_SUMMONED',
      data: { robotId: robot.id, robotType: robot.type, x, y }
    });
    return true;
  }

  /** Update cooldowns each frame */
  update(dtMs: number): void {
    for (const [id, remaining] of this.cooldowns.entries()) {
      if (remaining > 0) {
        this.cooldowns.set(id, Math.max(0, remaining - dtMs));
      }
    }
  }

  getCooldown(robotId: string): number {
    return this.cooldowns.get(robotId) ?? 0;
  }

  isBefriended(robotId: string): boolean {
    return this.befriended.has(robotId);
  }

  getBefriended(): SummonableRobot[] {
    return Array.from(this.befriended.values());
  }

  destroy(): void {
    this.befriended.clear();
    this.cooldowns.clear();
  }
}
