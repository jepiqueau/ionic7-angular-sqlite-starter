import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ModalController } from '@ionic/angular';
import { AuthorPostsService } from 'src/app/services/author-posts.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { JsonPost, PostData } from 'src/app/models/author-posts';
import { Toast } from '@capacitor/toast';
import { PostComponent } from 'src/app/components/author-posts/post/post.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.page.html',
  styleUrls: ['./post.page.scss'],
  imports: [IonicModule, PostComponent],
  standalone: true,
})
export class PostPage implements OnInit {

  constructor(private authorPostsService: AuthorPostsService,
    private sqliteService: SQLiteService,
    private modalCtrl: ModalController) { }

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
   * handle the outPost Event from cmp-post component
   * @param post
   * @returns
   */
  async handleOutPost(post:PostData) {
    if(post && post.id > 0) {
      const postJson: JsonPost = this.authorPostsService.getJsonPostFromPostData(post);
      try {
        await this.authorPostsService.getPost(postJson);
        await this.authorPostsService.getAllPosts();
        await this.authorPostsService.getAllIdsSeq();
        if (this.sqliteService.platform === 'web') {
          // save the databases from memory to store
          await this.sqliteService.sqliteConnection.saveToStore(this.authorPostsService.databaseName);
        }
      } catch (err: any) {
        const msg = err.message ? err.message : err;
        console.log(`onSubmit Post: ${msg}`);
        await Toast.show({
          text: `onSubmit Post: ${msg} `,
          duration: 'long'
        });
      }
      return this.modalCtrl.dismiss(post, 'confirm');
    } else {
      await Toast.show({
        text: `onSubmit Post: id <= 0 `,
        duration: 'long'
      });
      return this.modalCtrl.dismiss(null, 'cancel');
    }
  }

}
