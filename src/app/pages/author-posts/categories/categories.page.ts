import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ModalController } from '@ionic/angular';
import { AuthorPostsService } from 'src/app/services/author-posts.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { Category } from 'src/app/models/author-posts';
import { Toast } from '@capacitor/toast';
import { CategoryComponent } from 'src/app/components/author-posts/category/category.component';
import { CategoriesComponent } from 'src/app/components/author-posts/categories/categories.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  imports: [IonicModule, CategoryComponent, CategoriesComponent],
  standalone: true,
})

export class CategoriesPage implements OnInit {
  @Input() selectCategory!: Category[];

  updCategory!: Category;
  private categoryEL: any;
  private selCats!: Category[];

  constructor(private authorPostsService: AuthorPostsService,
              private modalCtrl: ModalController,
              private sqliteService: SQLiteService,
              private elementRef : ElementRef) {

  }

  ngOnInit() {
    this.categoryEL = this.elementRef.nativeElement.querySelector(`#categories-cmp-category`);
    this.selCats = [...this.selectCategory]
  }
  // Private functions
  /**
   * Close
   * @returns
   */
  async close() {
    // check if seltCats still exists
    if(!this.selCats) {
      return this.modalCtrl.dismiss(null, 'close');
    }
    const catsExist: Category[] = [];
    for (const cat of this.selCats) {
      const catExist: Category = await this.authorPostsService.getCategory(cat);
      if(catExist && catExist.id > 0) {
        catsExist.push(cat);
      }
    }
    if(catsExist.length > 0) {
      return this.modalCtrl.dismiss(catsExist, 'close');
    } else {
      return this.modalCtrl.dismiss(null, 'close');
    }
  }
  /**
   * handle the outCategory Event from cmp-category component
   * @param category
   * @returns
   */
  async handleOutCategory(category:Category) {

    if(category && category.id > 0) {
      try {

        const mCategory: Category = category;
        const updCategory = await this.authorPostsService.getCategory(mCategory);
        const mId = updCategory.id;
        const index = this.selCats.indexOf(this.selCats.filter((x) => x.id === mId )[0]);
        this.selCats[index].name = updCategory.name;

        await this.authorPostsService.getAllCategories();
        await this.authorPostsService.getAllPosts();
        await this.authorPostsService.getAllIdsSeq();
        if (this.sqliteService.platform === 'web') {
          // save the databases from memory to store
          await this.sqliteService.sqliteConnection.saveToStore(this.authorPostsService.databaseName);
        }
        this.categoryEL.classList.add('hidden');
      } catch (err: any) {
        const msg = err.message ? err.message : err;
        console.log(`onSubmit Update Category: ${err}`);
        await Toast.show({
          text: `onSubmit Update Category: ${err} `,
          duration: 'long'
        });
      }
    } else {
      await Toast.show({
        text: `onSubmit Update Category: id <= 0 `,
        duration: 'long'
      });
    }
  }
  /**
   * handle the toUpdateCategory Event from cmp-categories component
   * @param data
   * @returns
   */
  async handleToUpdateCategory(data:any) {
    if(this.sqliteService.platform === 'web') {
      await this.sqliteService.sqliteConnection.saveToStore(data.database);
    }
    if(data.command === 'update') {
      this.updCategory = data.category;
      this.categoryEL.classList.remove('hidden');
    }
  }
}
