import { battleFieldSize } from '../../../ws_server/constants/battlefield.constants.js';
import { Game } from '../../../ws_server/entities/game.entity/index.js';
import { WsWithUser } from '../../../ws_server/types/WsData.type.js';
import { ShipData } from '../../../ws_server/types/game.types.js';

describe('Game entity', () => {
  const user1 = { user: { name: 'user1' } } as WsWithUser;
  const user2 = { user: { name: 'user1' } } as WsWithUser;
  const users = [user1];
  const ship1: ShipData = { position: { x: 0, y: 0 }, direction: false, length: 1, type: 'small' };
  const ship2: ShipData = { position: { x: 2, y: 4 }, direction: true, length: 3, type: 'large' };
  const ship3: ShipData = { position: { x: 7, y: 8 }, direction: false, length: 2, type: 'medium' };
  const shipsDataList = [ship1, ship2, ship3];

  it('should create game with user', () => {
    const game = new Game({ users });
    const [[_, user]] = game.getUsers();

    expect(user).toBe(user1);
  });

  it('should add ships and return ', () => {
    const game = new Game({ users: [user1, user2] });
    const [[indexPlayer1], [indexPlayer2]] = game.getUsers();

    const { isGameReadyToPlay: isGameReadyToPlayAfterFirstShipsAdding } = game.addShips({
      indexPlayer: indexPlayer1,
      shipsDataList,
    });
    expect(isGameReadyToPlayAfterFirstShipsAdding).toBe(false);

    let { isGameReadyToPlay: isGameReadyToPlayAfterSecondShipsAdding } = game.addShips({
      indexPlayer: indexPlayer2,
      shipsDataList,
    });
    expect(isGameReadyToPlayAfterSecondShipsAdding).toBe(true);
  });

  it('should return available user`s cells', () => {
    const game = new Game({ users });
    const [[indexPlayer]] = game.getUsers();

    game.addShips({ indexPlayer, shipsDataList });

    const availableCells = game.getAvailableUserCells(indexPlayer);

    expect(availableCells.length).toBe(100);

    expect(availableCells[0]).toStrictEqual([0, 0]);
    for (let i = 4; i < 7; i++) {
      expect(availableCells[i * battleFieldSize.X + 4]).toStrictEqual([i, 4]);
    }
  });

  describe('attack user', () => {
    it('should shot then kill a MEDIUM ship by user id and coords and return killed status and array of deleted around cells', () => {
      const game = new Game({ users });
      const [[indexPlayer]] = game.getUsers();
      game.addShips({ indexPlayer, shipsDataList });
      const {
        status: statusFirstShot,
        aroundRemovedCells: aroundRemovedCellsFirstShot,
        isGameFinished: isGameFinishedFirstShot,
      } = game.attackUserShip({
        indexPlayer,
        position: { x: 7, y: 8 },
      });

      expect(statusFirstShot).toBe('shot');
      expect(isGameFinishedFirstShot).toBe(false);
      expect(aroundRemovedCellsFirstShot).toStrictEqual([]);

      let availableCells = game.getAvailableUserCells(indexPlayer);
      expect(availableCells.length).toBe(99);

      const {
        status: statusSecondShot,
        aroundRemovedCells: aroundRemovedCellsSecondShot,
        isGameFinished: isGameFinishedSecondShot,
      } = game.attackUserShip({
        indexPlayer,
        position: { x: 8, y: 8 },
      });

      const removedCells = [
        [9, 7],
        [9, 8],
        [9, 9],
        [6, 7],
        [6, 8],
        [6, 9],
        [7, 7],
        [7, 9],
        [8, 7],
        [8, 9],
      ];

      expect(statusSecondShot).toBe('killed');
      expect(isGameFinishedSecondShot).toBe(false);

      removedCells.forEach((value) => {
        expect(
          aroundRemovedCellsSecondShot.some(
            (expectedCel) => value[0] === expectedCel[0] && value[1] === expectedCel[1],
          ),
        ).toBe(true);
      });

      availableCells = game.getAvailableUserCells(indexPlayer);
      expect(availableCells.length).toBe(100 - 10 - 2);

      [...removedCells, [7, 8], [8, 8]].forEach((value) => {
        expect(availableCells.some((expectedCel) => value[0] === expectedCel[0] && value[1] === expectedCel[1])).toBe(
          false,
        );
      });
    });

    it('should shot then kill a LARGE ship by user id and coords and return killed status and array of deleted around cells', () => {
      const game = new Game({ users });
      const [[indexPlayer]] = game.getUsers();
      game.addShips({ indexPlayer, shipsDataList });

      for (let i = 0; i < 2; i++) {
        const { status, aroundRemovedCells, isGameFinished } = game.attackUserShip({
          indexPlayer,
          position: { x: 2, y: 4 + i },
        });

        expect(status).toBe('shot');
        expect(isGameFinished).toBe(false);
        expect(aroundRemovedCells).toStrictEqual([]);
      }

      let availableCells = game.getAvailableUserCells(indexPlayer);
      expect(availableCells.length).toBe(98);

      const { status, aroundRemovedCells, isGameFinished } = game.attackUserShip({
        indexPlayer,
        position: { x: 2, y: 6 },
      });

      const removedCells = [
        [1, 3],
        [3, 3],
        [2, 3],
        [1, 4],
        [1, 5],
        [1, 6],
        [1, 7],
        [3, 4],
        [3, 5],
        [3, 6],
        [3, 7],
        [2, 7],
      ];

      expect(status).toBe('killed');
      expect(isGameFinished).toBe(false);
      removedCells.forEach((value) => {
        expect(
          aroundRemovedCells.some((expectedCel) => value[0] === expectedCel[0] && value[1] === expectedCel[1]),
        ).toBe(true);
      });

      availableCells = game.getAvailableUserCells(indexPlayer);
      expect(availableCells.length).toBe(100 - 12 - 3);

      [...removedCells, [2, 4], [2, 5], [2, 6]].forEach((value) => {
        expect(availableCells.some((expectedCel) => value[0] === expectedCel[0] && value[1] === expectedCel[1])).toBe(
          false,
        );
      });
    });

    it('should kill a SMALL ship by user id and coords and return killed status and array of deleted around cells', () => {
      const game = new Game({ users });
      const [[indexPlayer]] = game.getUsers();
      game.addShips({ indexPlayer, shipsDataList });
      const { status, aroundRemovedCells, isGameFinished } = game.attackUserShip({
        indexPlayer,
        position: { x: 0, y: 0 },
      });

      const removedCells = [
        [0, 1],
        [1, 1],
        [1, 0],
      ];

      expect(status).toBe('killed');
      expect(isGameFinished).toBe(false);
      removedCells.forEach((value) => {
        expect(
          aroundRemovedCells.some((expectedCel) => value[0] === expectedCel[0] && value[1] === expectedCel[1]),
        ).toBe(true);
      });

      const availableCells = game.getAvailableUserCells(indexPlayer);
      expect(availableCells.length).toBe(96);

      [...removedCells, [0, 0]].forEach((value) => {
        expect(availableCells.some((expectedCel) => value[0] === expectedCel[0] && value[1] === expectedCel[1])).toBe(
          false,
        );
      });
    });

    it('should miss selected user`s cell and return null', () => {
      const game = new Game({ users });
      const [[indexPlayer]] = game.getUsers();
      game.addShips({ indexPlayer, shipsDataList });

      const { status, aroundRemovedCells, isGameFinished } = game.attackUserShip({
        indexPlayer,
        position: { x: 5, y: 6 },
      });

      expect(status).toBe('miss');
      expect(isGameFinished).toBe(false);
      expect(aroundRemovedCells).toStrictEqual([]);

      const availableCells = game.getAvailableUserCells(indexPlayer);

      expect(availableCells.length).toBe(99);
      expect(availableCells).not.toMatchObject([2, 3]);
    });

    it('should shot selected user`s cell and return shot status and empty array of deleted cells', () => {
      const game = new Game({ users });
      const [[indexPlayer]] = game.getUsers();
      game.addShips({ indexPlayer, shipsDataList });

      const { status, aroundRemovedCells, isGameFinished } = game.attackUserShip({
        indexPlayer: indexPlayer,
        position: { x: 2, y: 4 },
      });

      expect(status).toBe('shot');
      expect(aroundRemovedCells).toStrictEqual([]);
      expect(isGameFinished).toBe(false);

      const availableCells = game.getAvailableUserCells(indexPlayer);

      expect(availableCells.length).toBe(99);
      expect(availableCells).not.toMatchObject([2, 4]);
    });
  });

  describe('game finisher flag, ', () => {
    it('should return game finisher boolean flag, should be false if not all ships were killed, otherwise should be true', () => {
      const userData = { name: 'user1' };
      const user1 = { user: userData } as WsWithUser;

      const game = new Game({ users: [user1] });
      const [[indexPlayer]] = game.getUsers();
      game.addShips({ indexPlayer, shipsDataList: [ship1, ship3] });

      const shipsPositions = [
        ship1.position,
        ...Array(ship3.length)
          .fill('')
          .map((_, i) => ({ x: ship3.position.x + i, y: ship3.position.y })),
      ];

      shipsPositions.forEach((position, i, arr) => {
        const { isGameFinished } = game.attackUserShip({ indexPlayer, position });
        if (i < arr.length - 1) {
          expect(isGameFinished).toBe(false);
        } else {
          expect(isGameFinished).toBe(true);
        }
      });
    });
  });
});
