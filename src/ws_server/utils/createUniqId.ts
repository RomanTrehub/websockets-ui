import { randomUUID } from 'crypto';

const createUniqId = () => {
  return randomUUID();
};
export default createUniqId;
