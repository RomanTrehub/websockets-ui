import { WebSocket } from 'ws';
import { InputEvents, OutputEvents } from '../constants/wsEvents.constants.js';
import { WsData } from '../types/WsData.type.js';

export type ReturnedMessages = { event: OutputEvents; serverData: any }[];

export const waitForSocketState = (socket: WebSocket, state: WebSocket['readyState']) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      if (socket.readyState === state) {
        resolve();
      } else {
        waitForSocketState(socket, state).then(resolve);
      }
    }, 5);
  });
};
export const createWsRequest = <Data>({ resType, data }: { resType: InputEvents; data: Data }) => {
  const resData: WsData<InputEvents> = { id: 0, type: resType, data: JSON.stringify(data) };
  return JSON.stringify(resData);
};

export const createSocketConnection = async (wsServerPort: number) => {
  const massages: ReturnedMessages = [];
  let lastReplyMessageType: OutputEvents | null = null;
  const ws = new WebSocket(`ws://localhost:${wsServerPort}`);
  await waitForSocketState(ws, ws.OPEN);

  ws.on('message', (mesData) => {
    const { data, type }: WsData<OutputEvents> = JSON.parse(mesData.toString());

    massages.push({ event: type, serverData: JSON.parse(data) });

    if (type === lastReplyMessageType) {
      ws.close();
    }
  });

  return async function sendMes(
    dataToSend: { resType: InputEvents; data: unknown },
    lastReplyType: OutputEvents | null = null,
  ) {
    ws.send(createWsRequest(dataToSend));
    if (lastReplyType) {
      lastReplyMessageType = lastReplyType;
      await waitForSocketState(ws, ws.CLOSED);
      return massages;
    }

    return sendMes;
  };
};
