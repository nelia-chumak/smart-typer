import { Logger as AppLogger } from 'common/types/types';

class Logger {
  private _logger: AppLogger | null = null;

  public initLogger(logger: AppLogger): void {
    this._logger = logger;
  }

  public info = (
    ...args: Parameters<AppLogger['info']>
  ): ReturnType<AppLogger['info']> => {
    if (!this._logger) {
      return;
    }
    this._logger.info(...args);
  };

  public warn = (
    ...args: Parameters<AppLogger['warn']>
  ): ReturnType<AppLogger['warn']> => {
    if (!this._logger) {
      return;
    }
    this._logger.warn(...args);
  };

  public error = (
    ...args: Parameters<AppLogger['error']>
  ): ReturnType<AppLogger['error']> => {
    if (!this._logger) {
      return;
    }
    this._logger.error(...args);
  };
}

export { Logger };
