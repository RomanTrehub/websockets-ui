import { OutputEvents } from '../constants/wsEvents.constants.js';
import { WsData } from '../types/WsData.type.js';

export default function createWsResponse<Data>({ resType, data }: { resType: OutputEvents; data: Data }) {
  const resData: WsData<OutputEvents> = { id: 0, type: resType, data: JSON.stringify(data) };
  return JSON.stringify(resData);
}
