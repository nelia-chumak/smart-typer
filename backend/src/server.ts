import express, { Express } from 'express';
import { createServer } from 'http';
import { Model } from 'objection';
import { Server } from 'socket.io';
import pino from 'pino';
import cors from 'cors';
import Knex from 'knex';
import path from 'path';

import { router as apiRoutes } from 'api/api';
import { ENV } from 'common/constants/constants';
import { Environment } from 'common/enums/enums';
import { SocketEvent } from 'common/enums/socket/socket';
import { socket as socketService } from 'services/services';
import { logger as loggerService } from 'services/services';
import knexConfig from '../knexfile';

const app: Express = express();
const httpServer = createServer(app);

const knex = Knex(knexConfig[ENV.APP.NODE_ENV as Environment]);
Model.knex(knex);

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV === 'production'
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          singleLine: false
        }
      }
});
const io = new Server(httpServer);

socketService.initIo(io);
io.on(SocketEvent.CONNECTION, socketService.initHandlers);

loggerService.initLogger(logger);

app.use(
  cors({
    origin: ENV.APP.URL,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiRoutes);

app.use(express.static(path.join(__dirname, '../public')));
app.get('/ar-camera', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/ar-camera.html'));
});

app.use(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

httpServer.listen(ENV.APP.SERVER_PORT, async () => {
  logger.info(
    `Server is running at ${ENV.APP.SERVER_PORT}. Environment: ${ENV.APP.NODE_ENV}.`,
  );
});

httpServer.on('close', async () => {
  await knex.destroy();
});

export default app;
