import { WebSocketServer } from 'ws';
import Controller from './controllers/index.js';
import { UsersService } from './services/users.service.js';
import GamesService from './services/games.service.js';
import RoomsService from './services/rooms.service.js';
import { WsWithUser } from './types/WsData.type.js';
import { UsersRepository } from './repositories/users.repository.js';

const createWSS = (port: number) => {
  const wss = new WebSocketServer({ port }, () => {
    console.log(`wss is listening on the ${port}`);
  });

  const usersRepo = new UsersRepository();

  const controller = new Controller({
    userService: new UsersService(usersRepo),
    gamesService: new GamesService(usersRepo),
    roomsService: new RoomsService(),
    allClients: wss.clients,
  });

  wss.on('connection', (ws) => {
    controller.subscribeWS(ws as WsWithUser);
    ws.readyState;
  });

  return wss;
};

export default createWSS;
