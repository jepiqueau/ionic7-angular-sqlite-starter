import { Component, OnInit } from '@angular/core';

import { IonicModule } from '@ionic/angular';

import { ModalController } from '@ionic/angular';
import { AuthorPostsService } from 'src/app/services/author-posts.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { Author } from 'src/app/models/author-posts';
import { Toast } from '@capacitor/toast';
import { AuthorComponent } from 'src/app/components/author-posts/author/author.component';

@Component({
  selector: 'app-author',
  templateUrl: './author.page.html',
  styleUrls: ['./author.page.scss'],
  imports: [IonicModule, AuthorComponent],
  standalone: true,
})

export class AuthorPage implements OnInit {
  public authorList: Author[] = [];
  private newAuthor!: Author;
  private author!: Author;

  constructor(private authorPostsService: AuthorPostsService,
              private sqliteService: SQLiteService,
              private modalCtrl: ModalController) {
  }

  ngOnInit() {
  }
  // Private functions
  /**
   * Cancel
   * @returns
   */
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
  /**
   * handle the outAuthor Event from cmp-author component
   * @param author
   * @returns
   */
  async handleOutAuthor(author:Author) {
    this.author = author;
    if(this.author && this.author.id > 0) {
      try {
        this.newAuthor = await this.authorPostsService.getAuthor(this.author);
        await this.authorPostsService.getAllAuthors();
        await this.authorPostsService.getAllIdsSeq();
        if (this.sqliteService.platform === 'web') {
          // save the databases from memory to store
          await this.sqliteService.sqliteConnection.saveToStore(this.authorPostsService.databaseName);
        }
      } catch (err: any) {
        const msg = err.message ? err.message : err;
        console.log(`onSubmit Author: ${msg}`);
        await Toast.show({
          text: `onSubmit Author: ${err} `,
          duration: 'long'
        });
      }
      return this.modalCtrl.dismiss(this.newAuthor, 'confirm');
    } else {
      await Toast.show({
        text: `onSubmit Author: id <= 0 `,
        duration: 'long'
      });
      return this.modalCtrl.dismiss(null, 'cancel');
    }
  }
}

