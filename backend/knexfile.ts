import { Knex } from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import { ENV } from './src/common/constants/constants';
import { Environment } from './src/common/enums/enums';

type ConfigPropType = Record<string, unknown>;

const DEFAULT_ENV_CONFIG: Knex.Config<ConfigPropType> = {
  client: ENV.DB.CLIENT,
  connection: {
    connectionString: ENV.DB.URL,
  },
  pool: {
    min: ENV.DB.POOL_MIN,
    max: ENV.DB.POOL_MAX,
  },
  migrations: {
    directory: './src/data/migrations',
    tableName: 'migrations',
  },
  seeds: { directory: './src/data/seeds' },
  debug: false,
  ...knexSnakeCaseMappers({ underscoreBetweenUppercaseLetters: true }),
};

const PROD_ENV_CONFIG: Knex.Config<ConfigPropType> = {
  client: ENV.DB.CLIENT,
  connection: {
    connectionString: ENV.DB.URL,
    ssl: {
      rejectUnauthorized: true,
      ca: ENV.DB.SSL,
    },
  },
  pool: {
    min: ENV.DB.POOL_MIN,
    max: ENV.DB.POOL_MAX,
  },
  migrations: {
    directory: './src/data/migrations',
    tableName: 'migrations',
  },
  debug: false,
  ...knexSnakeCaseMappers({ underscoreBetweenUppercaseLetters: true }),
};

const knexConfig: Record<Environment, Knex.Config<ConfigPropType>> = {
  [Environment.DEVELOPMENT]: DEFAULT_ENV_CONFIG,
  [Environment.PRODUCTION]: PROD_ENV_CONFIG,
};

export default knexConfig;
