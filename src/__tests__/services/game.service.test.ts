import { Game } from '../../ws_server/entities/game.entity/index.js';
import { UsersRepository } from '../../ws_server/repositories/users.repository.js';
import GameService from '../../ws_server/services/games.service.js';
import { WsWithUser } from '../../ws_server/types/WsData.type.js';
import { AttackUserOutputData, ShipData } from '../../ws_server/types/game.types.js';

describe('Game Service', () => {
  const userRepo = new UsersRepository();
  const gameService = new GameService(userRepo);

  const user1 = { user: { name: 'user1' } } as WsWithUser;
  const user2 = { user: { name: 'user2' } } as WsWithUser;
  const ship1: ShipData = { position: { x: 0, y: 0 }, direction: false, length: 1, type: 'small' };
  const ship2: ShipData = { position: { x: 2, y: 4 }, direction: true, length: 3, type: 'large' };
  const ship3: ShipData = { position: { x: 8, y: 0 }, direction: false, length: 2, type: 'medium' };
  const shipsList = [ship1, ship2, ship3];

  const users = [
    [1, { user: { name: 'user1' } } as WsWithUser],
    [2, { user: { name: 'user1' } } as WsWithUser],
  ];

  describe('create game', () => {
    it('should return two uses`s websockets', () => {
      const usersWsArr = [user1, user2];
      const { gameId, playerIds } = gameService.createGame(usersWsArr);
      expect(typeof gameId).toBe('string');
      expect(playerIds.length).toBe(2);
      playerIds.forEach((playerId) => {
        expect(typeof playerId).toBe('string');
      });
    });
  });

  describe('add ships', () => {
    const usersWsArr = [user1, user2];
    const { gameId, playerIds } = gameService.createGame(usersWsArr);

    it('should add ships to the game and return ws user`s array and FALSE game ready state', () => {
      const { usersGameInfo, gameReadyToPlay } = gameService.addShips({
        gameId,
        indexPlayer: playerIds[0],
        ships: shipsList,
      });

      expect(gameReadyToPlay).toBe(false);

      usersGameInfo.forEach(([playerIndex, shipList], index) => {
        index === 1 ? expect(shipList.length).toBe(0) : expect(shipList.length).toBe(shipsList.length);
        expect(typeof playerIndex).toBe('string');
      });
    });

    it('should add ships to the game and return ws user`s array and TRUE game ready state', () => {
      const { usersGameInfo, gameReadyToPlay } = gameService.addShips({
        gameId,
        indexPlayer: playerIds[1],
        ships: shipsList,
      });

      expect(gameReadyToPlay).toBe(true);

      usersGameInfo.forEach(([playerIndex, shipList], index) => {
        expect(shipList.length).toBe(shipsList.length);
        expect(typeof playerIndex).toBe('string');
      });
    });

    it('should get users ws and player id by game id', () => {
      const usersInfo = gameService.getPlayersInfo(gameId);

      usersInfo.forEach(([playerId, userWs], index) => {
        expect(playerId).toBe(playerIds[index]);
        expect(userWs).toBe(usersWsArr[index]);
      });
    });
  });

  describe('attack ship', () => {
    const usersWsArr = [user1, user2];
    const { gameId, playerIds } = gameService.createGame(usersWsArr);
    gameService.addShips({
      gameId,
      indexPlayer: playerIds[0],
      ships: shipsList,
    });

    it('should attack user`s cell and return status, around Removed cells and game finish status', () => {
      const mockedReturnedAttackInfo: AttackUserOutputData = {
        status: 'shot',
        aroundRemovedCells: [],
        isGameFinished: false,
      };
      jest.spyOn(Game.prototype, 'attackUserShip').mockReturnValue(mockedReturnedAttackInfo);

      const returnedData = gameService.attack({ gameId, indexPlayer: playerIds[0], position: { x: 0, y: 0 } });

      expect(returnedData).toStrictEqual(mockedReturnedAttackInfo);
    });

    it('should attack random available user`s cell and return status, around Removed cells and game finish status', () => {
      const mockedReturnedAttackInfo: AttackUserOutputData = {
        status: 'killed',
        aroundRemovedCells: [
          [0, 1],
          [1, 1],
          [1, 0],
        ],
        isGameFinished: true,
      };
      jest.spyOn(Game.prototype, 'attackUserShip').mockReturnValue(mockedReturnedAttackInfo);

      const returnedData = gameService.attackRandomly({ gameId, indexPlayer: playerIds[0] });

      expect(returnedData).toMatchObject(mockedReturnedAttackInfo);
    });

    // add attack unavailable cell test
    // check ships around-removed cells logic and tests

    describe('attacking not existed cells', () => {
      it('should attack unavailable user`s cell and return null', () => {
        jest.spyOn(Game.prototype, 'getAvailableUserCells').mockReturnValue([[1, 1]]);

        const returnedData = gameService.attack({ gameId, indexPlayer: playerIds[0], position: { x: 0, y: 0 } });

        expect(returnedData).toBeNull();
      });
    });
  });
});
