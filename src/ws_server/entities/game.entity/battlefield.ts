import { battleFieldSize } from '../../constants/battlefield.constants.js';
import Ship from './ship.js';

export default class Battlefield {
  private battlefieldCells: Map<number, Map<number, Ship | null>> = new Map();

  constructor(ships: Ship[]) {
    for (let i = 0; i < battleFieldSize.X; i++) {
      const yMap: Map<number, Ship | null> = new Map();

      for (let i = 0; i < battleFieldSize.Y; i++) {
        yMap.set(i, null);
      }
      this.battlefieldCells.set(i, yMap);
    }

    ships.forEach((ship) => {
      if (ship.direction) {
        const row = this.battlefieldCells.get(ship.position[0]);
        for (let i = 0; i < ship.length; i++) {
          row!.set(ship.position[1] + i, ship);
        }
      } else {
        for (let i = 0; i < ship.length; i++) {
          const row = this.battlefieldCells.get(ship.position[0] + i);
          row!.set(ship.position[1], ship);
        }
      }
    });
  }

  getCell([x, y]: [number, number]) {
    const row = this.battlefieldCells.get(x);
    return row!.get(y);
  }

  getAvailableCells() {
    return Array.from(this.battlefieldCells.entries()).reduce<[number, number][]>((accum, [xPosition, yMap]) => {
      const yPositions = Array.from(yMap.keys());
      yPositions.forEach((yPosition) => {
        accum.push([xPosition, yPosition]);
      });
      return accum;
    }, []);
  }

  removeCell([x, y]: [number, number]) {
    const row = this.battlefieldCells.get(x)!;

    if (!row.size) {
      this.battlefieldCells.delete(x);
    }

    return row.delete(y);
  }
}
