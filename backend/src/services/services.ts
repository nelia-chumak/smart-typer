import { ENV } from 'common/constants/constants';
import {
  refreshToken as refreshTokenRepository,
  room as roomRepository,
  user as userRepository,
  settings as settingsRepository,
  lesson as lessonRepository,
  statistics as statisticsRepository,
} from 'data/repositories/repositories';
import { Auth } from './auth/auth.service';
import { S3 } from './s3/s3.service';
import { Settings } from './settings/settings.service';
import { Token } from './token/token.service';
import { User } from './user/user.service';
import { Statistics } from './statistics/statistics.service';
import { Axios } from './axios/axios.service';
import { Hash } from './hash/hash.service';
import { Joke } from './joke/joke.service';
import { Logger } from './logger/logger.service';
import { Mailer } from './mailer/mailer.service';
import { Oauth2 } from './oauth2/oauth2.service';
import { Room } from './room/room.service';
import { Socket } from './socket/socket.service';
import { Lesson } from './lesson/lesson.service';
import { ITS } from './its/its.service';
import { Cron } from './cron/cron.service';

const s3 = new S3({
  accessKeyId: ENV.S3.ACCESS_KEY_ID,
  secretAccessKey: ENV.S3.SECRET_ACCESS_KEY,
  bucketName: ENV.S3.BUCKET_NAME,
  region: ENV.S3.REGION,
});

const hash = new Hash();

const settings = new Settings({ settingsRepository });

const socket = new Socket();

const axios = new Axios();

const logger = new Logger();

const joke = new Joke({ axiosService: axios, loggerService: logger });

const statistics = new Statistics({ statisticsRepository });

const token = new Token({
  refreshTokenRepository,
  secretKey: ENV.APP.SECRET_KEY,
});

const user = new User({
  userRepository,
  tokenService: token,
  s3Service: s3,
});

const oauth2 = new Oauth2({
  clientId: ENV.GOOGLE.CLIENT_ID,
  clientSecret: ENV.GOOGLE.CLIENT_SECRET,
  redirectUrl: ENV.GOOGLE.REDIRECT_URL,
  refreshToken: ENV.GOOGLE.REFRESH_TOKEN,
});

const mailer = new Mailer({
  oauth2Service: oauth2,
  user: ENV.MAILER.USER,
  clientId: ENV.GOOGLE.CLIENT_ID,
  clientSecret: ENV.GOOGLE.CLIENT_SECRET,
  refreshToken: ENV.GOOGLE.REFRESH_TOKEN,
});

const auth = new Auth({
  userService: user,
  hashService: hash,
  tokenService: token,
  mailerService: mailer,
  oauth2Service: oauth2,
  appUrl: ENV.APP.URL,
});

const cron = new Cron();

const its = new ITS();

const lesson = new Lesson({
  lessonRepository,
  itsService: its,
  userService: user,
  statisticsService: statistics,
});

const room = new Room({
  roomRepository,
  socketService: socket,
  userService: user,
  mailerService: mailer,
  cronService: cron,
  lessonService: lesson,
  loggerService: logger,
});

export {
  auth,
  token,
  user,
  s3,
  hash,
  oauth2,
  mailer,
  settings,
  socket,
  axios,
  logger,
  joke,
  room,
  lesson,
  its,
  statistics,
  cron,
};
