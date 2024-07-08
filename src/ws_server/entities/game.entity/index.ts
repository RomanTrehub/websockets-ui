import { battleFieldSize } from '../../constants/battlefield.constants.js';
import { WsWithUser } from '../../types/WsData.type.js';
import { AttackUserOutputData, GameAttackOutputData, ShipData } from '../../types/game.types.js';
import createUniqId from '../../utils/createUniqId.js';
import Battlefield from './battlefield.js';
import Ship from './ship.js';

export interface IGame {
  getUsers: () => [string, WsWithUser][];
  getAvailableUserCells: (playerIndex: string) => [number, number][];
  attackUserShip: ({
    position,
    indexPlayer,
  }: {
    position: { x: number; y: number };
    indexPlayer: string;
  }) => AttackUserOutputData;
  addShips: ({ indexPlayer, shipsDataList }: { shipsDataList: ShipData[]; indexPlayer: string }) => {
    isGameReadyToPlay: boolean;
  };
  getPlayersShipList: () => [string, Ship[]][];
  getPlayerIdWhoTurns: () => string;
  changePlayerIdWhoTurns: () => void;
}

export class Game implements IGame {
  private usersInGame: Map<string, WsWithUser> = new Map();
  private gameBattleFields: Map<string, Battlefield> = new Map();
  private gamersShipLists: Map<string, Set<Ship>> = new Map();
  private indexOfPlayerIdWhoseTurnIs: number = 0;

  private removeCellsAroundKilledShip({ direction, position, length }: Ship, selectedBattleField: Battlefield) {
    const aroundRemovedCells: [number, number][] = [];
    const constantAxis = direction ? 1 : 0;
    const maintainedAxis = direction ? 0 : 1;
    const maxConstantAxisSize = direction ? battleFieldSize.Y : battleFieldSize.X;
    const maxMaintainedAxisSize = direction ? battleFieldSize.X : battleFieldSize.Y;

    const startCounterVal = position[constantAxis] - 1 >= 0 ? -1 : 0;
    const endCounterVal = position[constantAxis] + length < maxConstantAxisSize ? length + 1 : length;

    const removeCell = (removalCell: [number, number]) => {
      const isCellExist = selectedBattleField.removeCell(removalCell);
      isCellExist && aroundRemovedCells.push(removalCell);
    };

    // Removes cells on both sides along the ship
    for (let i = startCounterVal; i < endCounterVal; i++) {
      if (position[maintainedAxis] - 1 >= 0) {
        const removalCell = [];
        removalCell[maintainedAxis] = position[maintainedAxis] - 1;
        removalCell[constantAxis] = position[constantAxis] + i;
        removeCell(removalCell as [number, number]);
      }

      if (position[maintainedAxis] + 1 < maxMaintainedAxisSize) {
        const removalCell = [];
        removalCell[maintainedAxis] = position[maintainedAxis] + 1;
        removalCell[constantAxis] = position[constantAxis] + i;
        removeCell(removalCell as [number, number]);
      }
    }

    // Removes 2 neighbor cells from ends
    if (position[constantAxis] - 1 >= 0) {
      const removalCell = [];
      removalCell[maintainedAxis] = position[maintainedAxis];
      removalCell[constantAxis] = position[constantAxis] - 1;
      removeCell(removalCell as [number, number]);
    }

    if (position[constantAxis] + length < maxConstantAxisSize) {
      const removalCell = [];
      removalCell[maintainedAxis] = position[maintainedAxis];
      removalCell[constantAxis] = position[constantAxis] + length;
      removeCell(removalCell as [number, number]);
    }

    return aroundRemovedCells;
  }

  constructor({ users }: { users: WsWithUser[] }) {
    users.forEach((user) => {
      const createdPlayerIndex = createUniqId();
      this.usersInGame.set(createdPlayerIndex, user);
    });
  }

  getUsers() {
    return Array.from(this.usersInGame.entries());
  }

  getPlayerIdWhoTurns() {
    return this.getUsers()[this.indexOfPlayerIdWhoseTurnIs][0];
  }

  changePlayerIdWhoTurns() {
    this.indexOfPlayerIdWhoseTurnIs = this.indexOfPlayerIdWhoseTurnIs ? 0 : 1;
  }

  getPlayersShipList() {
    const shipSets = Array.from(this.gamersShipLists.entries());
    const shipLists: [string, Ship[]][] = shipSets.map(([id, shipSet]) => [id, Array.from(shipSet)]);
    return shipLists;
  }

  addShips({ indexPlayer, shipsDataList }: { shipsDataList: ShipData[]; indexPlayer: string }) {
    const userShipList = shipsDataList.map((shipData) => new Ship(shipData));

    this.gameBattleFields.set(indexPlayer, new Battlefield(userShipList));

    const shipSet = new Set(userShipList);
    this.gamersShipLists.set(indexPlayer, shipSet);

    return {
      isGameReadyToPlay: this.gamersShipLists.size === 2,
    };
  }

  getAvailableUserCells(indexPlayer: string) {
    const playerBattlefield = this.gameBattleFields.get(indexPlayer);

    return playerBattlefield!.getAvailableCells();
  }

  attackUserShip({ position: { x, y }, indexPlayer }: { position: { x: number; y: number }; indexPlayer: string }) {
    const playerBattlefield = this.gameBattleFields.get(indexPlayer)!;
    const cellContent = playerBattlefield!.getCell([x, y]);
    let status: GameAttackOutputData['status'] = 'miss';
    let aroundRemovedCells: [number, number][] = [];
    let isGameFinished = false;

    if (cellContent instanceof Ship) {
      status = cellContent.shotShip();
      if (status === 'killed') {
        aroundRemovedCells = this.removeCellsAroundKilledShip(cellContent, playerBattlefield!);
        const shipSet = this.gamersShipLists.get(indexPlayer)!;
        shipSet.delete(cellContent);

        if (!shipSet.size) {
          isGameFinished = true;
        }
      }
    }

    playerBattlefield.removeCell([x, y]);

    return {
      status,
      aroundRemovedCells,
      isGameFinished,
    };
  }
}
