import { Component, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ModalController } from '@ionic/angular';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { Dialog } from '@capacitor/dialog';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';

@Component({
  selector: 'app-modal-passphrase',
  templateUrl: './modal-passphrase.page.html',
  styleUrls: ['./modal-passphrase.page.scss'],
  imports: [CommonModule, IonicModule],
  standalone: true,
})

export class ModalPassphrasePage implements OnInit {
  ionModal!:  HTMLIonModalElement
  isPassphraseSet: boolean = false;
  isPassphraseChecked: boolean = false;
  isPassphraseDisabled: boolean = false;
  isInputPassphrase: boolean = false;
  isInputCheckPassphrase: boolean = false;
  isInputChangePassphrase: boolean = false;
  oldPassphrase: string = "";
  constructor(
    private modalCtrl: ModalController,
    private sqliteService: SQLiteService,
    private elRef: ElementRef,
  ) {
  }

  async ngOnInit() {
    this.ionModal = this.elRef.nativeElement.parentNode;
    const isSetPassphrase = (await this.sqliteService.isSecretStored()).result;
    Keyboard.setResizeMode({
      mode: KeyboardResize.None
    });
    Keyboard.setAccessoryBarVisible({ isVisible: true });
    if(isSetPassphrase!) {
      this.isPassphrase(true);
      this.isInputPassphrase = false;
    }
  }
  ngOnDestroy(): void {
      Keyboard.setResizeMode({
        mode: KeyboardResize.Ionic
      });
  }

  close() {
    return this.modalCtrl.dismiss();
  }
  async handlePassphraseToggle() {
    const togEl: HTMLIonToggleElement  = this.elRef.nativeElement.querySelector("#toggle-modal-passphrase");
    const inpEl: HTMLIonInputElement = this.elRef.nativeElement.querySelector("#input-modal-passphrase");
    if(!this.isPassphraseDisabled && togEl.checked) {
      this.ionModal.setCurrentBreakpoint(0.85);
      this.isInputPassphrase = true;
    } else {
      this.isInputPassphrase = false;
    }
  }
  async handlePassphraseInput() {
    const inpEl: HTMLIonInputElement = this.elRef.nativeElement.querySelector("#input-modal-passphrase");
    // set the passphrase
    const pass: string | number  = inpEl.value!.toString();
    await this.sqliteService.setEncryptionSecret(pass);
    this.isPassphrase(true);
    this.isInputPassphrase = false;
    await Dialog.alert({
      title: 'Congratulations',
      message: `The Passphrase has been set`,
    });
  }
  async handleClearPassphraseToggle() {
    const {value} = await Dialog.confirm({
      title: 'Confirm',
      message: `Are you sure? this will unencrypt all encrypted databases`,
    });

    if( value ) {
      // unencrypt the encrypted databases
      await this.sqliteService.unencryptCryptedDatabases();
      await this.sqliteService.clearEncryptionSecret();
      this.isPassphrase(false);
      this.isInputPassphrase = false;
      await Dialog.alert({
        title: 'Congratulations',
        message: `The Passphrase has been cleared`,
      });

    }
  }
  async handleChangePassphraseToggle() {
    this.ionModal.setCurrentBreakpoint(0.85);
    const togEl: HTMLIonToggleElement = this.elRef.nativeElement.querySelector("#toggle-modal-change-passphrase");
    if(togEl.checked) {
      this.isInputCheckPassphrase = true;
    } else {
      this.isInputCheckPassphrase = false;
      this.isInputChangePassphrase = false;
    }
  }

  async handleOldPassphraseInput() {
    const inpEl: HTMLIonInputElement  =this.elRef.nativeElement.querySelector("#input-modal-old-passphrase");
    const oldpass: string = inpEl.value!.toString();
    const res = (await this.sqliteService.checkEncryptionSecret(oldpass)).result;
    if(res) {
      this.oldPassphrase = oldpass;
      this.isInputCheckPassphrase = false;
      this.isInputChangePassphrase = true;
      await Dialog.alert({
        title: 'Congratulations',
        message: `The Passphrase has been successfully checked`,
      });
   } else {
      await Dialog.alert({
        title: 'Error',
        message: 'Wrong Passphrase',
      });
      inpEl.value = '';
    }
  }
  async handleNewPassphraseInput() {
    const inpEl: HTMLIonInputElement = this.elRef.nativeElement.querySelector("#input-modal-new-passphrase");
    const togEl: HTMLIonToggleElement = this.elRef.nativeElement.querySelector("#toggle-modal-change-passphrase");
    const newpass: string = inpEl.value!.toString();
    await this.sqliteService.changeEncryptionSecret(newpass, this.oldPassphrase);
    await Dialog.alert({
      title: 'Congratulations',
      message: 'Passphrase has been updated',
    });
    inpEl.value = '';
    togEl.checked = false;
    this.isInputCheckPassphrase = false;
    this.isInputChangePassphrase = false;
    this.ionModal.setCurrentBreakpoint(0.55);

  }

  private isPassphrase(value: boolean) {
    this.isPassphraseSet = value;
    this.isPassphraseChecked = value;
    this.isPassphraseDisabled = value;
  }
}
