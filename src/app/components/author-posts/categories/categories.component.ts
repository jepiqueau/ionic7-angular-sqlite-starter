import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthorPostsService } from 'src/app/services/author-posts.service';
import { Category }  from 'src/app/models/author-posts';;
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'cmp-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  imports: [CommonModule, IonicModule],
  standalone: true,
})

export class CategoriesComponent implements OnInit {
  @Output() toUpdateCategory = new EventEmitter<{command: string, database: string, category: Category}>();

  public categoryList: Category[] = [];

  constructor(private authorPostsService: AuthorPostsService) {
    }

  ngOnInit() {
    try {
      this.authorPostsService.categoryState().subscribe((res) => {
        if(res) {
          this.authorPostsService.fetchCategories().subscribe(data => {
            this.categoryList = data;
          });
        }
      });
    } catch(err) {
      throw new Error(`Error: ${err}`);
    }
  }
  // Private functions
  /**
   * update a category
   * @param category
   */
  updateCategory(category: Category) {
    this.toUpdateCategory.emit({command: "update", database: this.authorPostsService.databaseName, category: category});
  }
  /**
   * delete a category
   * @param category
   */
  async deleteCategory(category: Category) {
    try {
      await this.authorPostsService.deleteCategory(category);
      await this.authorPostsService.getAllCategories();
      this.toUpdateCategory.emit({command: "delete", database: this.authorPostsService.databaseName, category: category});
    } catch(err) {
      throw new Error(`Error: ${err}`);
    }
  }
}
