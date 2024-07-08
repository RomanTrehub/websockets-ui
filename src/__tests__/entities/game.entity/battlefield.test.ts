import { battleFieldSize } from '../../../ws_server/constants/battlefield.constants.js';
import Battlefield from '../../../ws_server/entities/game.entity/battlefield.js';
import Ship from '../../../ws_server/entities/game.entity/ship.js';
import { ShipData } from '../../../ws_server/types/game.types.js';

describe('Battle field', () => {
  const ship1: ShipData = { position: { x: 0, y: 0 }, direction: false, length: 1, type: 'small' };
  const ship2: ShipData = { position: { x: 0, y: 7 }, direction: true, length: 3, type: 'large' };
  const ship3: ShipData = { position: { x: 9, y: 0 }, direction: true, length: 2, type: 'medium' };
  const ship4: ShipData = { position: { x: 6, y: 9 }, direction: false, length: 4, type: 'huge' };
  const shipList: ShipData[] = [ship1, ship2, ship3, ship4];
  const battleField = new Battlefield(shipList.map((shipData) => new Ship(shipData)));

  it('should set ship list on the field after creation', () => {
    const availableCells = battleField.getAvailableCells();
    expect(availableCells.length).toBe(100);

    for (let i = 0; i < battleFieldSize.X * battleFieldSize.Y; i++) {
      expect(availableCells[i].length).toBe(2);
    }
  });

  it('should return selected cell', () => {
    const cellWithShip = battleField.getCell([0, 0]);
    const emptyCell = battleField.getCell([7, 8]);
    expect(cellWithShip).toBeInstanceOf(Ship);
    expect(emptyCell).toBeNull();

    for (let i = 0; i < 3; i++) {
      const cellWithShip = battleField.getCell([0, 7 + i]);
      expect(cellWithShip).toBeInstanceOf(Ship);
    }

    for (let i = 0; i < 2; i++) {
      const cellWithShip = battleField.getCell([9, 0 + i]);
      expect(cellWithShip).toBeInstanceOf(Ship);
    }

    for (let i = 0; i < 4; i++) {
      const cellWithShip = battleField.getCell([6 + i, 9]);
      expect(cellWithShip).toBeInstanceOf(Ship);
    }
  });

  it('should remove cell from available cells list', () => {
    battleField.removeCell([7, 8]);
    const foundCell = battleField.getCell([7, 8]);
    expect(foundCell).toBeUndefined();

    const availableCells = battleField.getAvailableCells();
    expect(availableCells.length).toBe(99);
  });
});
