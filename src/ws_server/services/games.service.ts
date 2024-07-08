import { Game } from '../entities/game.entity/index.js';
import Ship from '../entities/game.entity/ship.js';
import { IUsersRepository } from '../repositories/users.repository.js';
import { WsWithUser } from '../types/WsData.type.js';
import { AddShipsInputData, AttackUserOutputData } from '../types/game.types.js';
import createUniqId from '../utils/createUniqId.js';

export interface IGamesService {
  createGame: (users: WsWithUser[]) => { gameId: string; playerIds: string[] };
  addShips: (shipsData: AddShipsInputData) => {
    usersGameInfo: [string, Ship[]][];
    gameReadyToPlay: boolean;
  };
  attack: ({
    gameId,
    indexPlayer,
    position,
  }: {
    gameId: string;
    indexPlayer: string;
    position: { x: number; y: number };
  }) => AttackUserOutputData | null;

  attackRandomly: ({
    gameId,
    indexPlayer,
  }: {
    gameId: string;
    indexPlayer: string;
  }) => (AttackUserOutputData & { attackedPosition: { x: number; y: number } }) | null;

  getPlayersInfo: (gameId: string) => [string, WsWithUser][];

  removeGame: (gameId: string) => void;

  getPlayerIdWhoTurns: (gameId: string) => string;
}

export default class GamesService implements IGamesService {
  private gameList: Map<string, Game> = new Map();

  private getRandomCell(gameId: string, playerIndex: string) {
    const selectedGame = this.gameList.get(gameId)!;

    const availableCells = selectedGame.getAvailableUserCells(playerIndex);
    const min = 0;
    const maxAvailableCells = Math.floor(availableCells.length);
    const selectedCellIndex = Math.floor(Math.random() * (maxAvailableCells - min + 1) + min);
    return availableCells[selectedCellIndex];
  }

  private attackUserShip({
    gameId,
    indexPlayer,
    position,
  }: {
    indexPlayer: string;
    gameId: string;
    position: { x: number; y: number };
  }) {
    const selectedGame = this.gameList.get(gameId)!;
    const availableUserCells = selectedGame.getAvailableUserCells(indexPlayer);
    if (!availableUserCells.some(([x, y]) => x == position.x && y == position.y)) {
      return null;
    }
    const attackInfo = selectedGame.attackUserShip({ position, indexPlayer });
    if (attackInfo.status == 'miss') {
      selectedGame.changePlayerIdWhoTurns();
    }
    if (attackInfo.isGameFinished) {
      const users = this.getPlayersInfo(gameId);
      this.usersRepo.updateUserWins(users.find(([id]) => id === indexPlayer)![1].user.name);
    }

    return attackInfo;
  }

  constructor(private usersRepo: IUsersRepository) {}

  createGame(users: WsWithUser[]) {
    const newGame = new Game({ users });
    const newGameId = createUniqId();
    this.gameList.set(newGameId, newGame);
    const [[firstPlayerId], [secondPlayerId]] = newGame.getUsers();

    return { gameId: newGameId, playerIds: [firstPlayerId, secondPlayerId] };
  }

  addShips({ gameId, ships, indexPlayer }: AddShipsInputData) {
    const selectedGame = this.gameList.get(gameId)!;
    const { isGameReadyToPlay } = selectedGame.addShips({ indexPlayer, shipsDataList: ships });
    const usersGameInfo = selectedGame.getPlayersShipList();

    return {
      gameReadyToPlay: isGameReadyToPlay,
      usersGameInfo,
    };
  }

  attack({
    gameId,
    indexPlayer,
    position,
  }: {
    gameId: string;
    indexPlayer: string;
    position: { x: number; y: number };
  }) {
    return this.attackUserShip({ gameId, indexPlayer, position });
  }

  attackRandomly({ gameId, indexPlayer }: { gameId: string; indexPlayer: string }) {
    const [x, y] = this.getRandomCell(gameId, indexPlayer);
    const attackInfo = this.attackUserShip({ gameId, indexPlayer, position: { x, y } });
    return attackInfo ? { ...attackInfo, attackedPosition: { x, y } } : null;
  }

  getPlayersInfo(gameId: string) {
    const selectedGame = this.gameList.get(gameId)!;
    return selectedGame.getUsers();
  }

  getPlayerIdWhoTurns(gameId: string) {
    const selectedGame = this.gameList.get(gameId)!;
    return selectedGame.getPlayerIdWhoTurns();
  }

  removeGame(gameId: string) {
    this.gameList.delete(gameId);
  }
}
