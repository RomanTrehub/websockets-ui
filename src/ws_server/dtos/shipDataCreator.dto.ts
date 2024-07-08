import Ship from '../entities/game.entity/ship.js';
import { ShipData } from '../types/game.types.js';

export default class ShipDataCreator implements ShipData {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';

  constructor(ship: Ship) {
    this.direction = ship.direction;

    const [x, y] = ship.position;
    this.position = { x, y };

    this.length = ship.length;
    this.type = ship.type;
  }
}
