import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ModalController } from '@ionic/angular';
import { AuthorPostsService } from 'src/app/services/author-posts.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { Category } from 'src/app/models/author-posts';
import { Toast } from '@capacitor/toast';
import { CategoryComponent } from 'src/app/components/author-posts/category/category.component';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  imports: [IonicModule, CategoryComponent],
  standalone: true,
})

export class CategoryPage implements OnInit {
  public categoryList: Category[] = [];
  private newCategory!: Category;
  private category!: Category;

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
   * handle the outCategory Event from cmp-category component
   * @param category
   * @returns
   */
  async handleOutCategory(category:Category) {
    this.category = category;
    if(this.category && this.category.id > 0) {
      try {
        this.newCategory = await this.authorPostsService.getCategory(this.category);
        await this.authorPostsService.getAllCategories();
        await this.authorPostsService.getAllIdsSeq();
        if (this.sqliteService.platform === 'web') {
          // save the databases from memory to store
          await this.sqliteService.sqliteConnection.saveToStore(this.authorPostsService.databaseName);
        }
      } catch (err: any) {
        const msg = err.message ? err.message : err;
        console.log(`onSubmit Category: ${err}`);
        await Toast.show({
          text: `onSubmit Category: ${err} `,
          duration: 'long'
        });
      }
      return this.modalCtrl.dismiss(this.newCategory, 'confirm');
    } else {
      await Toast.show({
        text: `onSubmit Category: id <= 0 `,
        duration: 'long'
      });
      return this.modalCtrl.dismiss(null, 'cancel');
    }
  }
}

