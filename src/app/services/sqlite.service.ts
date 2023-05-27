import { Injectable } from '@angular/core';

import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection, CapacitorSQLitePlugin,
  capSQLiteUpgradeOptions, capSQLiteResult, capSQLiteValues} from '@capacitor-community/sqlite';
import { DbnameVersionService } from 'src/app/services/dbname-version.service';

@Injectable()

export class SQLiteService {
  sqliteConnection!: SQLiteConnection;
  isService: boolean = false;
  platform!: string;
  sqlitePlugin!: CapacitorSQLitePlugin;
  native: boolean = false;
  constructor(private dbVerService: DbnameVersionService) {
  }
  /**
   * Plugin Initialization
   */
  async initializePlugin(): Promise<boolean> {
        this.platform = Capacitor.getPlatform();
        if(this.platform === 'ios' || this.platform === 'android') this.native = true;
        this.sqlitePlugin = CapacitorSQLite;
        this.sqliteConnection = new SQLiteConnection(this.sqlitePlugin);
        this.isService = true;
        return true;
  }

  async initWebStore(): Promise<void> {
    try {
      await this.sqliteConnection.initWebStore();
    } catch(err: any) {
      const msg = err.message ? err.message : err;
      return Promise.reject(`initWebStore: ${err}`);
    }
  }

  async openDatabase(dbName:string, encrypted: boolean, mode: string, version: number, readonly: boolean): Promise<SQLiteDBConnection> {
    let db: SQLiteDBConnection;
    const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
    let isConn = (await this.sqliteConnection.isConnection(dbName, readonly)).result;
    if(retCC && isConn) {
      db = await this.sqliteConnection.retrieveConnection(dbName, readonly);
    } else {
      db = await this.sqliteConnection
                .createConnection(dbName, encrypted, mode, version, readonly);
    }
    await db.open();
    return db;
  }
  async retrieveConnection(dbName:string, readonly: boolean): Promise<SQLiteDBConnection> {
    return await this.sqliteConnection.retrieveConnection(dbName, readonly);
  }
  async closeConnection(database:string, readonly?: boolean): Promise<void> {
    const readOnly = readonly ? readonly : false;
    return await this.sqliteConnection.closeConnection(database, readOnly);
  }
  async addUpgradeStatement(options:capSQLiteUpgradeOptions): Promise<void> {
    await this.sqlitePlugin.addUpgradeStatement(options);
    return;
  }
  async isInConfigEncryption(): Promise<capSQLiteResult> {
    return await this.sqliteConnection.isInConfigEncryption();
  }
  async isInConfigBiometricAuth(): Promise<capSQLiteResult> {
    return await this.sqliteConnection.isInConfigBiometricAuth();
  }
  async isDatabaseEncrypted(database: string): Promise<capSQLiteResult> {
    let res: capSQLiteResult = {result: false};
    const isDB = (await this.sqliteConnection.isDatabase(database)).result;
    if(!isDB) {
      return {result: false};
    }
    return await this.sqliteConnection.isDatabaseEncrypted(database);
  }
  async isSecretStored(): Promise<capSQLiteResult> {
      return await this.sqliteConnection.isSecretStored();
  }
  async setEncryptionSecret(passphrase: string): Promise<void> {
      return await this.sqliteConnection.setEncryptionSecret(passphrase);
  }
  async clearEncryptionSecret(): Promise<void> {
    return await this.sqliteConnection.clearEncryptionSecret();
  }
  async changeEncryptionSecret(passphrase: string, oldpassphrase: string): Promise<void> {
      return await this.sqliteConnection.changeEncryptionSecret(passphrase, oldpassphrase);
  }
  async checkEncryptionSecret(passphrase: string): Promise<capSQLiteResult> {
      return await this.sqliteConnection.checkEncryptionSecret(passphrase);
  }
  async getDatabaseList(): Promise<capSQLiteValues> {
    return await this.sqliteConnection.getDatabaseList();
  }
  async findOneBy(mDb: SQLiteDBConnection, table: string, where: any): Promise<any> {
    try {
        const key: string = Object.keys(where)[0];
        const stmt: string = `SELECT * FROM ${table} WHERE ${key}=${where[key]};`
        const retValues = (await mDb.query(stmt)).values;
        const ret = retValues!.length > 0 ? retValues![0] : null;
        return ret;
    } catch(err:any) {
      const msg = err.message ? err.message : err;
      return Promise.reject(`findOneBy err: ${msg}`);
    }
  }
  async save(mDb: SQLiteDBConnection, table: string, mObj: any, where?: any): Promise<void> {
      const isUpdate: boolean = where ? true : false;
      const keys: string[] = Object.keys(mObj);
      let stmt: string = '';
      let values: any[] = [];
      for (const key of keys) {
        values.push(mObj[key]);
      }
      if(!isUpdate) {
        // INSERT
        const qMarks: string[] = [];
        for (const key of keys) {
          qMarks.push('?');
        }
        stmt = `INSERT INTO ${table} (${keys.toString()}) VALUES (${qMarks.toString()});`;
      } else {
        // UPDATE
        const wKey: string = Object.keys(where)[0];

        const setString: string = await this.setNameForUpdate(keys);
        if(setString.length === 0) {
          return Promise.reject(`save: update no SET`);
        }
        stmt = `UPDATE ${table} SET ${setString} WHERE ${wKey}=${where[wKey]}`;
      }
      const ret = await mDb.run(stmt,values);
      if(ret.changes!.changes != 1) {
        return Promise.reject(`save: insert changes != 1`);
      }
      return;
  }
  async unencryptCryptedDatabases(): Promise<void> {
    const dbList: string[] = (await this.getDatabaseList()).values!;
    for (let idx:number = 0; idx < dbList.length; idx++) {
      const dbName = dbList[idx].split("SQLite.db")[0];
      const isEncrypt = (await this.isDatabaseEncrypted(dbName)).result!;
      if(isEncrypt) {
        const version = this.dbVerService.getVersion(dbName)!;
        const db = await this.openDatabase(dbName, true, "secret",
                        version,false);
        const jsonDB = (await db.exportToJson("full")).export!;
        jsonDB.overwrite = true;
        jsonDB.encrypted = false;
        const res = await this.sqliteConnection.importFromJson(JSON.stringify(jsonDB));
      }
    }
  }
  async remove(mDb: SQLiteDBConnection, table: string, where: any): Promise<void> {
      const key: string = Object.keys(where)[0];
      const stmt: string = `DELETE FROM ${table} WHERE ${key}=${where[key]};`
      const ret = await mDb.run(stmt);
      return;
  }
  /**
   * SetNameForUpdate
   * @param names
   */
  private async setNameForUpdate(names: string[]): Promise<string> {
    let retString = '';
    for (const name of names) {
      retString += `${name} = ? ,`;
    }
    if (retString.length > 1) {
      retString = retString.slice(0, -1);
      return retString;
    } else {
      return Promise.reject('SetNameForUpdate: length = 0');
    }
  }

}
