import { OutputEvents } from '../constants/wsEvents.constants.js';
import ShipDataCreator from '../dtos/shipDataCreator.dto.js';
import { IGamesService } from '../services/games.service.js';
import { WsWithUser } from '../types/WsData.type.js';
import {
  AddShipsInputData,
  AttackUserOutputData,
  CreateGameOutputData,
  FinishGameOutputData,
  GameAttackInputData,
  GameAttackOutputData,
  GameRandomAttackInputData,
  GameTurnOutputData,
  StartGameOutputData,
} from '../types/game.types.js';
import createWsResponse from '../utils/createWsResponse.js';

export default class GamesController {
  private replyOnAttack({ currentPlayer, position, status, gameId }: GameAttackOutputData & { gameId: string }) {
    const usersWs = this.gamesService.getPlayersInfo(gameId);

    usersWs.forEach(([id, ws]) => {
      ws.send(
        createWsResponse<GameAttackOutputData>({
          resType: OutputEvents.ATTACK,
          data: {
            currentPlayer,
            position,
            status,
          },
        }),
      );
    });
  }

  private sendTernMessage({ currentPlayer, gameId }: GameTurnOutputData & { gameId: string }) {
    const usersWs = this.gamesService.getPlayersInfo(gameId);
    usersWs.forEach(([id, ws]) => {
      ws.send(
        createWsResponse<GameTurnOutputData>({
          resType: OutputEvents.TURN,
          data: {
            currentPlayer,
          },
        }),
      );
    });
  }

  private handleAttackData({
    aroundRemovedCells,
    status,
    indexPlayer,
    opponentId,
    gameId,
    position,
  }: Omit<AttackUserOutputData, 'isGameFinished'> & {
    indexPlayer: string;
    opponentId: string;
    gameId: string;
    position: { x: number; y: number };
  }) {
    this.replyOnAttack({
      currentPlayer: indexPlayer,
      position,
      status,
      gameId,
    });

    switch (status) {
      case 'killed':
        this.sendTernMessage({ gameId, currentPlayer: indexPlayer });

        aroundRemovedCells.forEach(([x, y]) => {
          this.replyOnAttack({
            currentPlayer: indexPlayer,
            position: { x, y },
            status: 'miss',
            gameId,
          });

          this.sendTernMessage({
            currentPlayer: indexPlayer,
            gameId,
          });
        });
        break;

      case 'shot':
        this.sendTernMessage({
          currentPlayer: indexPlayer,
          gameId,
        });
        break;

      case 'miss':
      default:
        this.sendTernMessage({
          currentPlayer: opponentId,
          gameId,
        });
    }
  }
  private sendFinishGameMessage(winnerId: string, gameId: string) {
    const usersWs = this.gamesService.getPlayersInfo(gameId);
    usersWs.forEach(([, ws]) => {
      ws.send(
        createWsResponse<FinishGameOutputData>({
          resType: OutputEvents.FINNISH,
          data: { winPlayer: winnerId },
        }),
      );
    });
  }

  constructor(private gamesService: IGamesService) {}

  createGame(usersWs: WsWithUser[]) {
    const { gameId, playerIds } = this.gamesService.createGame(usersWs);
    usersWs.forEach((ws, index) => {
      ws.send(
        createWsResponse<CreateGameOutputData>({
          resType: OutputEvents.CREATE_GAME,
          data: { idGame: gameId, idPlayer: playerIds[index] },
        }),
      );
    });
  }
  addShips(inputData: AddShipsInputData) {
    const { gameReadyToPlay, usersGameInfo } = this.gamesService.addShips(inputData);
    if (gameReadyToPlay) {
      const usersWs = this.gamesService.getPlayersInfo(inputData.gameId);
      usersWs.forEach(([id, ws], index) => {
        ws.send(
          createWsResponse<StartGameOutputData>({
            resType: OutputEvents.START_GAME,
            data: {
              currentPlayerIndex: id,
              ships: usersGameInfo[index][1].map((ship) => new ShipDataCreator(ship)),
            },
          }),
        );
      });
      this.sendTernMessage({ gameId: inputData.gameId, currentPlayer: usersGameInfo[0][0] });
    }
  }
  attack({ gameId, indexPlayer, x, y }: GameAttackInputData) {
    const playersIdWhoTurns = this.gamesService.getPlayerIdWhoTurns(gameId);
    if (playersIdWhoTurns !== indexPlayer) {
      return;
    }
    const opponentId = this.gamesService.getPlayersInfo(gameId).find(([id, ws]) => id !== indexPlayer)![0];

    const attackInfo = this.gamesService.attack({
      gameId,
      indexPlayer: opponentId, // opponent should be attacked
      position: { x, y },
    });

    if (!attackInfo) {
      return;
    }

    const { aroundRemovedCells, isGameFinished, status } = attackInfo;

    this.handleAttackData({ aroundRemovedCells, indexPlayer, opponentId, gameId, position: { x, y }, status });
    if (isGameFinished) {
      this.sendFinishGameMessage(indexPlayer, gameId);
      this.gamesService.removeGame(gameId);
    }

    return isGameFinished;
  }

  attackRandomly({ gameId, indexPlayer }: GameRandomAttackInputData) {
    const playersIdWhoTurns = this.gamesService.getPlayerIdWhoTurns(gameId);
    if (playersIdWhoTurns !== indexPlayer) {
      return;
    }
    const opponentId = this.gamesService.getPlayersInfo(gameId).find(([id, ws]) => id !== indexPlayer)![0];

    const randomAttackInfo = this.gamesService.attackRandomly({
      gameId,
      indexPlayer: opponentId,
    });

    if (!randomAttackInfo) {
      return;
    }

    const { aroundRemovedCells, attackedPosition, isGameFinished, status } = randomAttackInfo;

    this.handleAttackData({ aroundRemovedCells, indexPlayer, opponentId, gameId, position: attackedPosition, status });

    if (isGameFinished) {
      this.sendFinishGameMessage(indexPlayer, gameId);
      this.gamesService.removeGame(gameId);
    }
    return isGameFinished;
  }
}
