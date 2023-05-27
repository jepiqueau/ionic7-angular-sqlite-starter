import { Injectable } from '@angular/core';

@Injectable()
export class DbnameVersionService {
  private _dbNameVersionDict: Map<string, number> = new Map();

  constructor() { }
  set(dbName: string, version: number) {
    this._dbNameVersionDict.set(dbName, version);

  }
  getVersion(dbName: string) {
    if (this._dbNameVersionDict.has(dbName)) {
      return this._dbNameVersionDict.get(dbName);
    } else {
      return -1;
    }
  }
}
