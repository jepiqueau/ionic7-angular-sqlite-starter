import { Component, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ModalController } from '@ionic/angular';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { DbnameVersionService } from 'src/app/services/dbname-version.service';
import { Dialog } from '@capacitor/dialog';

@Component({
  selector: 'app-modal-encryption',
  templateUrl: './modal-encryption.page.html',
  styleUrls: ['./modal-encryption.page.scss'],
  imports: [CommonModule, IonicModule],
  standalone: true,
})

export class ModalEncryptionPage implements OnInit {

  isSetPassphrase: boolean = false;
  dbList: string[] = [];
  isEncryptionChecked: boolean[] = [];
  isEncryptionDisabled: boolean[] = [];

  constructor(
    private modalCtrl: ModalController,
    private sqliteService: SQLiteService,
    private dbVerService: DbnameVersionService,
    private elRef: ElementRef) {
  }

  async ngOnInit() {
    this.isSetPassphrase = (await this.sqliteService.isSecretStored()).result!;
    if(!this.isSetPassphrase) {
      await Dialog.alert({
        title: 'Error',
        message: 'The Passphrase has not been set',
      });
      this.close();
    }
    this.dbList = (await this.sqliteService.getDatabaseList()).values!;
    if(this.dbList.length === 0) {
      await Dialog.alert({
        title: 'Error',
        message: 'No databases available for this application',
      });
      this.close();
    }
    for (let idx:number = 0; idx < this.dbList.length; idx++) {
      const dbName = this.dbList[idx].split("SQLite.db")[0];
      const isEncrypt = (await this.sqliteService.isDatabaseEncrypted(dbName)).result!;
      this.isEncryptionChecked[idx] = isEncrypt;
      this.isEncryptionDisabled[idx] = isEncrypt;
    }
  }

  close() {
    return this.modalCtrl.dismiss();
  }
  async handleEncryptionToggle(index: number) {
    const dbName = this.dbList[index].split("SQLite.db")[0];
    // get the database version
    const version = this.dbVerService.getVersion(dbName)!;
    if(version === -1) {
      await Dialog.alert({
        title: 'Error',
        message: `Version: ${version}  not found for db: ${dbName}`,
      });
    }
    // encrypt the database
    const db = await this.sqliteService
            .openDatabase(dbName, true, "encryption",
                          version,false);
    await this.sqliteService.closeConnection(dbName, false);
    await Dialog.alert({
      title: 'Congratulations',
      message: `${dbName} has been encrypted`,
    });
    this.isEncryptionChecked[index] = true;
    this.isEncryptionDisabled[index] = true;

  }
}
