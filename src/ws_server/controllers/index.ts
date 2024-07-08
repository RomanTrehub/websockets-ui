import { WebSocket } from 'ws';
import { IUsersService } from '../services/users.service.js';
import { IRoomsService } from '../services/rooms.service.js';
import { WsData, WsWithUser } from '../types/WsData.type.js';
import createWsResponse from '../utils/createWsResponse.js';
import { InputEvents, OutputEvents } from '../constants/wsEvents.constants.js';
import RoomsController from './rooms.controller.js';
import UsersController from './users.controller.js';
import { AddUserInput, UpdateRoomOutput } from '../types/room.types.js';
import GamesController from './games.controller.js';
import { IGamesService } from '../services/games.service.js';
import { AddShipsInputData, GameAttackInputData, GameRandomAttackInputData } from '../types/game.types.js';

type IncomingMassageCb = (ws: WsWithUser, data?: any) => void;

export default class Controller {
  private usersController: UsersController;
  private roomsController: RoomsController;
  private gamesController: GamesController;
  private incomingMessages: Map<InputEvents, IncomingMassageCb> = new Map();
  private allClients: Set<WebSocket>;

  private sendToAllUsers({
    data,
    cb,
    exceptSender,
  }: {
    data?: unknown;
    cb: (ws: WsWithUser, data?: unknown) => void;
    exceptSender?: WsWithUser;
  }) {
    if (!exceptSender) {
      return this.allClients.forEach((ws) => cb(ws as WsWithUser, data));
    }
    this.allClients.forEach((ws) => {
      if (ws !== exceptSender) cb(ws as WsWithUser, data);
    });
  }

  private registerUser(ws: WebSocket, data: unknown) {
    this.usersController.registerUser(data, ws);
    this.updateRoomList(ws as WsWithUser);
    this.sendToAllUsers({ cb: (ws) => this.updateWinners(ws) });
  }

  private updateWinners(ws: WsWithUser) {
    const usersData = this.usersController.getWinnersList();
    ws.send(createWsResponse({ data: usersData, resType: OutputEvents.UPDATE_WINNERS }));
  }

  private updateRoomList(ws: WsWithUser) {
    const roomsList = this.roomsController.getRoomList();
    ws.ping;
    let filteredRoomsList: UpdateRoomOutput = [];
    if (roomsList.length && ws.user) {
      filteredRoomsList = roomsList.filter(({ roomUsers }) => roomUsers[0].index !== ws.user.id);
    }
    ws.send(createWsResponse({ resType: OutputEvents.UPDATE_ROOM, data: filteredRoomsList }));
  }
  private createRoom(ws: WsWithUser) {
    if (this.roomsController.createRoom(ws)) {
      this.sendToAllUsers({ cb: (ws) => this.updateRoomList(ws) });
    }
  }

  private addUserToRoom(ws: WsWithUser, data: AddUserInput) {
    const usersFromRoom = this.roomsController.addUserToRoom(data, ws);
    this.sendToAllUsers({ cb: (ws) => this.updateRoomList(ws) });
    this.createGame(usersFromRoom);
  }
  private addShipsToGame(_: WsWithUser, data: AddShipsInputData) {
    this.gamesController.addShips(data);
  }

  private attack(ws: WsWithUser, data: GameAttackInputData) {
    const isGameFinished = this.gamesController.attack(data);
    if (isGameFinished) {
      this.sendToAllUsers({ cb: (ws) => this.updateWinners(ws) });
    }
  }
  private randomAttack(ws: WsWithUser, data: GameRandomAttackInputData) {
    const isGameFinished = this.gamesController.attackRandomly(data);
    if (isGameFinished) {
      this.sendToAllUsers({ cb: (ws) => this.updateWinners(ws) });
    }
  }

  private createGame(usersFromRoom: WsWithUser[]) {
    this.gamesController.createGame(usersFromRoom);
  }

  private initialize() {
    this.incomingMessages.set(InputEvents.REG, this.registerUser.bind(this));
    this.incomingMessages.set(InputEvents.CREATE_ROOM, this.createRoom.bind(this));
    this.incomingMessages.set(InputEvents.ADD_USER_TO_ROOM, this.addUserToRoom.bind(this));
    this.incomingMessages.set(InputEvents.ADD_SHIPS, this.addShipsToGame.bind(this));
    this.incomingMessages.set(InputEvents.ATTACK, this.attack.bind(this));
    this.incomingMessages.set(InputEvents.RANDOM_ATTACK, this.randomAttack.bind(this));
  }

  constructor({
    userService,
    roomsService,
    gamesService,
    allClients,
  }: {
    userService: IUsersService;
    roomsService: IRoomsService;
    gamesService: IGamesService;
    allClients: Set<WebSocket>;
  }) {
    this.usersController = new UsersController(userService);
    this.roomsController = new RoomsController(roomsService);
    this.gamesController = new GamesController(gamesService);
    this.allClients = allClients;
    this.initialize();
  }

  subscribeWS(wsClient: WsWithUser) {
    wsClient.on('message', (inputData) => {
      try {
        const { data, type }: WsData<InputEvents> = JSON.parse(inputData.toString());

        if (this.incomingMessages.has(type)) {
          const parsedData = data ? JSON.parse(data) : data;
          this.incomingMessages.get(type)!(wsClient, parsedData);
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
}
