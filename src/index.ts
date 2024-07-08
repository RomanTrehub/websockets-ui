import { httpServer } from './http_server/index.js';
import createWSS from './ws_server/index.js';
import 'dotenv/config';

console.log(`Start static http server on the ${process.env.HTTP_PORT} port!`);
httpServer.listen(process.env.HTTP_PORT);

createWSS(Number(process.env.SERVICE_PORT));
