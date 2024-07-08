import { WebSocket } from 'ws';
import { InputEvents, OutputEvents } from '../constants/wsEvents.constants.js';
import type { UserInfo } from '../dtos/userDataCreator.dto.js';

export type WsData<T extends InputEvents | OutputEvents> = {
  id: 0;
  data: string;
  type: T;
};

export type WsWithUser = { user: UserInfo } & WebSocket;
