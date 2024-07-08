import { WebSocketServer, WebSocket } from 'ws';
import createWSS from '../ws_server/index.js';
import {
  waitForSocketState,
  createWsRequest,
  createSocketConnection,
  ReturnedMessages,
} from '../ws_server/utils/websocketsTestUtils.js';
import { WsData } from '../ws_server/types/WsData.type.js';
import { InputEvents, OutputEvents } from '../ws_server/constants/wsEvents.constants.js';
import { USER_NAME_ERROR, USER_PASS_ERROR } from '../ws_server/constants/errorMessages.constants.js';
import { ShipData } from '../ws_server/types/game.types.js';

describe('Integration tests', () => {
  let server: WebSocketServer;
  const wsServerPort = 3001;

  const hostUser = {
    name: 'Host1',
    password: 'password',
  };

  const joinedUser = {
    name: 'Joined',
    password: 'password',
  };

  describe('User`s registration error', () => {
    beforeEach(() => {
      server = createWSS(wsServerPort);
    });

    afterEach(() => {
      server.close();
    });

    it('should return an error registration, update winner`s list and room`s list', async () => {
      const userErrorData = {
        name: 'Host',
        password: 'pass',
      };
      const sendMesToServer = await createSocketConnection(wsServerPort);

      const returnedMessages = (await sendMesToServer(
        { resType: InputEvents.REG, data: userErrorData },
        OutputEvents.REG,
      )) as ReturnedMessages;

      returnedMessages.forEach(({ event, serverData }) => {
        if (event == OutputEvents.REG) {
          expect(serverData).toMatchObject({
            name: userErrorData.name,
            error: true,
            errorText: `${USER_NAME_ERROR}, ${USER_PASS_ERROR}`,
          });
        }

        if (event == OutputEvents.UPDATE_WINNERS) {
          expect(serverData).toMatchObject([]);
        }

        if (event == OutputEvents.UPDATE_ROOM) {
          expect(serverData).toMatchObject([]);
        }
      });
    });
  });

  describe('Going through the all process ', () => {
    beforeAll(() => {
      server = createWSS(wsServerPort);
    });

    afterAll(() => {
      server.close();
    });
    it('should go through the all process until finish', async () => {
      const ship1: ShipData = { position: { x: 0, y: 0 }, direction: false, length: 1, type: 'small' };
      const ship2: ShipData = { position: { x: 9, y: 0 }, direction: true, length: 2, type: 'medium' };
      const shipsList = [ship1, ship2];

      const hostMessages: ReturnedMessages = [];
      const joinedUserMessages: ReturnedMessages = [];
      let hostPlayerId: string = '';
      let joinedPlayerId: string = '';
      let roomId: string = '';
      let gameId: string = '';

      const hostWs = new WebSocket(`ws://localhost:${wsServerPort}`);
      await waitForSocketState(hostWs, hostWs.OPEN);

      hostWs.on('message', (mesData) => {
        const { data, type }: WsData<OutputEvents> = JSON.parse(mesData.toString());
        const serverData = JSON.parse(data);
        hostMessages.push({ event: type, serverData });

        if (type === OutputEvents.CREATE_GAME) {
          gameId = serverData.idGame;
          hostPlayerId = serverData.idPlayer;
        }
      });

      const joinedWs = new WebSocket(`ws://localhost:${wsServerPort}`);
      await waitForSocketState(joinedWs, joinedWs.OPEN);

      joinedWs.on('message', (mesData) => {
        const { data, type }: WsData<OutputEvents> = JSON.parse(mesData.toString());
        const serverData = JSON.parse(data);
        joinedUserMessages.push({ event: type, serverData });

        if (type === OutputEvents.UPDATE_ROOM && serverData.length) {
          roomId = (serverData[0] as any).roomId;
        }

        if (type === OutputEvents.CREATE_GAME) {
          joinedPlayerId = serverData.idPlayer;
        }
      });

      hostWs.send(createWsRequest({ data: hostUser, resType: InputEvents.REG }));

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });

      hostWs.send(
        createWsRequest({
          resType: InputEvents.CREATE_ROOM,
          data: '',
        }),
      );

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });

      joinedWs.send(createWsRequest({ data: joinedUser, resType: InputEvents.REG }));
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });
      joinedWs.send(
        createWsRequest({
          resType: InputEvents.ADD_USER_TO_ROOM,
          data: { indexRoom: roomId },
        }),
      );

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });

      hostWs.send(
        createWsRequest({
          data: {
            gameId,
            ships: shipsList,
            indexPlayer: hostPlayerId,
          },
          resType: InputEvents.ADD_SHIPS,
        }),
      );

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });

      joinedWs.send(
        createWsRequest({
          data: {
            gameId,
            ships: shipsList,
            indexPlayer: joinedPlayerId,
          },
          resType: InputEvents.ADD_SHIPS,
        }),
      );

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });

      hostWs.send(
        createWsRequest({
          data: {
            gameId,
            indexPlayer: hostPlayerId,
          },
          resType: InputEvents.RANDOM_ATTACK,
        }),
      );

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });

      joinedWs.send(
        createWsRequest({
          data: {
            gameId,
            indexPlayer: joinedPlayerId,
            x: 0,
            y: 0,
          },
          resType: InputEvents.ATTACK,
        }),
      );

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });

      joinedWs.send(
        createWsRequest({
          data: {
            gameId,
            indexPlayer: joinedPlayerId,
            x: 8,
            y: 0,
          },
          resType: InputEvents.ATTACK,
        }),
      );

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });

      hostWs.send(
        createWsRequest({
          data: {
            gameId,
            indexPlayer: hostPlayerId,
            x: 0,
            y: 0,
          },
          resType: InputEvents.ATTACK,
        }),
      );

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });

      hostWs.send(
        createWsRequest({
          data: {
            gameId,
            indexPlayer: hostPlayerId,
            x: 2,
            y: 0,
          },
          resType: InputEvents.ATTACK,
        }),
      );

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });

      joinedWs.send(
        createWsRequest({
          data: {
            gameId,
            indexPlayer: joinedPlayerId,
            x: 9,
            y: 0,
          },
          resType: InputEvents.ATTACK,
        }),
      );

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });

      joinedWs.send(
        createWsRequest({
          data: {
            gameId,
            indexPlayer: joinedPlayerId,
            x: 9,
            y: 1,
          },
          resType: InputEvents.ATTACK,
        }),
      );

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 10);
      });

      hostWs.close();
      joinedWs.close();

      await Promise.all([waitForSocketState(joinedWs, joinedWs.CLOSED), waitForSocketState(hostWs, hostWs.CLOSED)]);

      hostMessages.forEach(({ event, serverData }, i) => {
        switch (i) {
          case 0:
            expect(event).toBe(OutputEvents.REG);
            expect(serverData).toMatchObject({
              name: hostUser.name,
              error: false,
              errorText: '',
            });
            break;
          case 1:
            expect(event).toBe(OutputEvents.UPDATE_ROOM);
            expect(serverData).toMatchObject([]);
            break;
          case 2:
            expect(event).toBe(OutputEvents.UPDATE_WINNERS);
            expect(serverData).toMatchObject([{ name: hostUser.name, wins: 0 }]);
            break;
          case 3:
            expect(event).toBe(OutputEvents.UPDATE_ROOM);
            // expect(serverData.length).toBe(1);
            // expect(serverData[0]).toHaveProperty('roomId');
            // expect(serverData[0]).toHaveProperty('roomUsers');
            // expect(serverData[0]['roomUsers']).toMatchObject([{ name: hostUser.name }]);
            // expect(serverData[0]['roomUsers'][0]).toHaveProperty('index');
            expect(serverData).toMatchObject([]);
            break;
          case 4:
            expect(event).toBe(OutputEvents.UPDATE_WINNERS);
            expect(serverData).toMatchObject([
              { name: hostUser.name, wins: 0 },
              { name: joinedUser.name, wins: 0 },
            ]);
            break;
          case 5:
            expect(event).toBe(OutputEvents.UPDATE_ROOM);
            expect(serverData).toMatchObject([]);
            break;
          case 6:
            expect(event).toBe(OutputEvents.CREATE_GAME);
            expect(serverData).toHaveProperty('idGame');
            expect(serverData).toHaveProperty('idPlayer');
            break;
          case 7:
            expect(event).toBe(OutputEvents.START_GAME);
            expect(serverData).toHaveProperty('ships');
            expect(serverData).toHaveProperty('currentPlayerIndex');
            expect(serverData.currentPlayerIndex).toBe(hostPlayerId);
            expect(serverData.currentPlayerIndex).not.toBe(joinedPlayerId);
            break;
          case 8:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 9:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position).toHaveProperty('y');
            expect(serverData.position).toHaveProperty('x');
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 10:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 11:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('killed');
            expect(serverData.position.x).toBe(0);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 12:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 13:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(0);
            expect(serverData.position.y).toBe(1);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 15:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(1);
            expect(serverData.position.y).toBe(1);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 17:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(1);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 14:
          case 16:
          case 18:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData).toHaveProperty('currentPlayer');
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 19:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(8);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 20:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 21:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('killed');
            expect(serverData.position.x).toBe(0);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 23:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(0);
            expect(serverData.position.y).toBe(1);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 25:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(1);
            expect(serverData.position.y).toBe(1);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 27:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(1);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 22:
          case 24:
          case 26:
          case 28:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 29:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(2);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 30:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 31:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('shot');
            expect(serverData.position.x).toBe(9);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 32:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 33:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('killed');
            expect(serverData.position.x).toBe(9);
            expect(serverData.position.y).toBe(1);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 34:
          case 36:
          case 38:
          case 40:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 35:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(8);
            expect(serverData.position.y).toBe(1);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 37:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(8);
            expect(serverData.position.y).toBe(2);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 39:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(9);
            expect(serverData.position.y).toBe(2);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 41:
            expect(event).toBe(OutputEvents.FINNISH);
            expect(serverData.winPlayer).toBe(joinedPlayerId);
            break;
        }
      });

      joinedUserMessages.forEach(({ event, serverData }, i) => {
        switch (i) {
          case 0:
            expect(event).toBe(OutputEvents.UPDATE_WINNERS);
            expect(serverData).toMatchObject([{ name: hostUser.name, wins: 0 }]);
            break;
          case 1:
            expect(event).toBe(OutputEvents.UPDATE_ROOM);
            expect(serverData.length).toBe(0);
            break;
          case 2:
            expect(event).toBe(OutputEvents.REG);
            expect(serverData).toMatchObject({
              name: joinedUser.name,
              error: false,
              errorText: '',
            });
            break;
          case 3:
            expect(event).toBe(OutputEvents.UPDATE_ROOM);
            expect(serverData.length).toBe(1);
            expect(serverData[0]).toHaveProperty('roomId');
            expect(serverData[0]).toHaveProperty('roomUsers');
            expect(serverData[0]['roomUsers']).toMatchObject([{ name: hostUser.name }]);
            expect(serverData[0]['roomUsers'][0]).toHaveProperty('index');
            break;
          case 4:
            expect(event).toBe(OutputEvents.UPDATE_WINNERS);
            expect(serverData).toMatchObject([
              { name: hostUser.name, wins: 0 },
              { name: joinedUser.name, wins: 0 },
            ]);
            break;
          case 5:
            expect(event).toBe(OutputEvents.UPDATE_ROOM);
            expect(serverData).toMatchObject([]);
            break;
          case 6:
            expect(event).toBe(OutputEvents.CREATE_GAME);
            expect(serverData).toHaveProperty('idGame');
            expect(serverData).toHaveProperty('idPlayer');
            break;
          case 7:
            expect(event).toBe(OutputEvents.START_GAME);
            expect(serverData).toHaveProperty('ships');
            expect(serverData).toHaveProperty('currentPlayerIndex');
            expect(serverData.currentPlayerIndex).toBe(joinedPlayerId);
            expect(serverData.currentPlayerIndex).not.toBe(hostPlayerId);
            break;
          case 8:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 9:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position).toHaveProperty('y');
            expect(serverData.position).toHaveProperty('x');
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 10:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 11:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('killed');
            expect(serverData.position.x).toBe(0);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 12:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 13:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(0);
            expect(serverData.position.y).toBe(1);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 15:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(1);
            expect(serverData.position.y).toBe(1);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 17:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(1);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 14:
          case 16:
          case 18:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData).toHaveProperty('currentPlayer');
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 19:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(8);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 20:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 21:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('killed');
            expect(serverData.position.x).toBe(0);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 23:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(0);
            expect(serverData.position.y).toBe(1);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 25:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(1);
            expect(serverData.position.y).toBe(1);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 27:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(1);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 22:
          case 24:
          case 26:
          case 28:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 29:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(2);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(hostPlayerId);
            expect(serverData.currentPlayer).not.toBe(joinedPlayerId);
            break;
          case 30:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 31:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('shot');
            expect(serverData.position.x).toBe(9);
            expect(serverData.position.y).toBe(0);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 32:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 33:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('killed');
            expect(serverData.position.x).toBe(9);
            expect(serverData.position.y).toBe(1);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 34:
          case 36:
          case 38:
          case 40:
            expect(event).toBe(OutputEvents.TURN);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 35:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(8);
            expect(serverData.position.y).toBe(1);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 37:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(8);
            expect(serverData.position.y).toBe(2);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 39:
            expect(event).toBe(OutputEvents.ATTACK);
            expect(serverData.status).toBe('miss');
            expect(serverData.position.x).toBe(9);
            expect(serverData.position.y).toBe(2);
            expect(serverData.currentPlayer).toBe(joinedPlayerId);
            expect(serverData.currentPlayer).not.toBe(hostPlayerId);
            break;
          case 41:
            expect(event).toBe(OutputEvents.FINNISH);
            expect(serverData.winPlayer).toBe(joinedPlayerId);
            break;
        }
      });
    });
  });
});
