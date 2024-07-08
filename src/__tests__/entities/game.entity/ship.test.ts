import Ship from '../../../ws_server/entities/game.entity/ship.js';
import { ShipData } from '../../../ws_server/types/game.types.js';

describe('Ship entity', () => {
  describe('Ship`s state', () => {
    describe('ship`s length is 3', () => {
      const shipData: ShipData = { direction: false, position: { x: 1, y: 4 }, length: 3, type: 'large' };
      const ship = new Ship(shipData);
      it('should return shot state', () => {
        for (let i = 1; i < shipData.length; i++) {
          const shipState = ship.shotShip();
          expect(shipState).toBe('shot');
        }
      });

      it('should return killed state', () => {
        const shipState = ship.shotShip();
        expect(shipState).toBe('killed');
      });
    });
    describe('ship`s length is 1', () => {
      const shipData: ShipData = { direction: false, position: { x: 1, y: 1 }, length: 1, type: 'small' };
      const ship = new Ship(shipData);

      it('should return killed state', () => {
        const shipState = ship.shotShip();
        expect(shipState).toBe('killed');
      });
    });

    describe('ship`s length is 4', () => {
      const shipData: ShipData = { direction: false, position: { x: 1, y: 4 }, length: 4, type: 'huge' };
      const ship = new Ship(shipData);
      it('should return shot state', () => {
        for (let i = 1; i < shipData.length; i++) {
          const shipState = ship.shotShip();
          expect(shipState).toBe('shot');
        }
      });

      it('should return killed state', () => {
        const shipState = ship.shotShip();
        expect(shipState).toBe('killed');
      });
    });
  });
});
