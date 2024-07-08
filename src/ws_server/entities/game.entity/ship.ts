import { ShipData, GameAttackOutputData } from '../../types/game.types.js';

export default class Ship {
  readonly direction: ShipData['direction'];
  readonly position: [number, number];
  readonly length: ShipData['length'];
  readonly type: ShipData['type'];
  private integrity: number;

  constructor({ direction, length, position, type }: ShipData) {
    this.direction = direction;
    this.length = length;
    this.type = type;
    this.integrity = length;
    this.position = [position.x, position.y];
  }

  shotShip(): Exclude<GameAttackOutputData['status'], 'miss'> {
    this.integrity = this.integrity - 1;

    if (this.integrity === 0) {
      return 'killed';
    }
    return 'shot';
  }
}
