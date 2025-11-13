import { StorageKey } from 'common/enums/enums';

type StorageType = globalThis.Storage;

type Constructor = {
  storage: StorageType;
};

class Storage {
  private _storage: StorageType;

  public constructor(params: Constructor) {
    this._storage = params.storage;
  }

  public getItem(key: StorageKey): string | null {
    return this._storage.getItem(key);
  }

  public setItem(key: StorageKey, value: string): void {
    return this._storage.setItem(key, value);
  }

  public removeItem(key: StorageKey): void {
    return this._storage.removeItem(key);
  }
}

export { Storage };
