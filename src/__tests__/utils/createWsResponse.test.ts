import { OutputEvents, UsersEvents } from '../../ws_server/constants/wsEvents.constants.js';
import createWsResponse from '../../ws_server/utils/createWsResponse.js';

describe('create Websocket response', () => {
  it('should return ws response for the register user request ', () => {
    const responseData = { error: false, errorText: '', name: 'user1', index: 123 };
    const WSResData = { id: 0, type: 'reg', data: JSON.stringify(responseData) };
    const StringifyWsResDate = JSON.stringify(WSResData);

    expect(createWsResponse({ resType: OutputEvents.REG, data: responseData })).toBe(StringifyWsResDate);
  });
});
