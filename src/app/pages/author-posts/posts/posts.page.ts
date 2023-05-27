import { Component, OnInit, ElementRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ModalController } from '@ionic/angular';
import { AuthorPostsService } from 'src/app/services/author-posts.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { JsonPost, PostData } from 'src/app/models/author-posts';
import { Toast } from '@capacitor/toast';
import { PostComponent } from 'src/app/components/author-posts/post/post.component';
import { PostsComponent } from 'src/app/components/author-posts/posts/posts.component';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.page.html',
  styleUrls: ['./posts.page.scss'],
  imports: [IonicModule, PostComponent, PostsComponent],
  standalone: true,
})
export class PostsPage implements OnInit {
  updPost!: PostData;
  private postItemAddEL: any;
  private postAddEL: any;
  private postUpdateEL: any;
  private postsEL: any;
  private postMode!: string;
  private toClose: boolean = true;

  constructor(private authorPostsService: AuthorPostsService,
    private sqliteService: SQLiteService,
    private modalCtrl: ModalController,
    private elementRef : ElementRef) {

  }

  async ngOnInit() {
    await this.authorPostsService.openDatabase();
    await this.authorPostsService.getAllData();
    this.postItemAddEL = this.elementRef.nativeElement.querySelector(`#posts-ion-item-add`);
    this.postAddEL = this.elementRef.nativeElement.querySelector(`#posts-cmp-post-add`);
    this.postUpdateEL = this.elementRef.nativeElement.querySelector(`#posts-cmp-post-update`);
    this.postsEL = this.elementRef.nativeElement.querySelector(`#posts-cmp-posts`);
  }
  // Private functions
  /**
   * Close
   * @returns
   */
  async close() {
    if (this.toClose) {
      this.modalCtrl.dismiss();
    } else {
      this.postsEL.classList.remove('hidden');
      this.postItemAddEL.classList.remove('hidden');
      if(this.postMode === "add") {
        this.postAddEL.classList.add('hidden');
      }
      if(this.postMode === "update") {
        this.postUpdateEL.classList.add('hidden');
      }
      this.toClose = true;
    }
  }
  /**
   * add a post
   */
  async addPost() {
    this.toClose = false;
    this.postMode = "add"
    this.postAddEL.classList.remove('hidden');
    this.postsEL.classList.add('hidden');
    this.postItemAddEL.classList.add('hidden');
  }
  handleInsidePost() {
    this.toClose = false;
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
        console.log(`onSubmit ${this.postMode} Post: ${err}`);
        await Toast.show({
          text: `onSubmit ${this.postMode} Post: ${err} `,
          duration: 'long'
        });
      } finally {
        if(this.postMode === "update") {
          this.postUpdateEL.classList.add('hidden');
        }
        if(this.postMode === "add") {
          this.postAddEL.classList.add('hidden');
        }
        this.postsEL.classList.remove('hidden');
        this.postItemAddEL.classList.remove('hidden');
        this.toClose = true;
      }
    } else {
      await Toast.show({
        text: `onSubmit ${this.postMode} Post: id <= 0 `,
        duration: 'long'
      });
    }
  }
  /**
   * handle the toUpdatePost Event from cmp-posts component
   * @param data
   * @returns
   */
  async handleToUpdatePost(data:any) {
    if(this.sqliteService.platform === 'web') {
      await this.sqliteService.sqliteConnection.saveToStore(data.database);
    }
    if(data.command === 'update') {
      this.postMode = data.command
      this.updPost = data.post;
      this.postUpdateEL.classList.remove('hidden');
      this.postsEL.classList.add('hidden');
      this.postItemAddEL.classList.add('hidden');
    }
    await this.authorPostsService.getAllPosts();
  }
}
