import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthorPostsService } from 'src/app/services/author-posts.service';
import { Author }  from 'src/app/models/author-posts';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'cmp-authors',
  templateUrl: './authors.component.html',
  styleUrls: ['./authors.component.scss'],
  imports: [CommonModule, IonicModule],
  standalone: true,
})

export class AuthorsComponent implements OnInit {
  @Output() toUpdateAuthor = new EventEmitter<{command: string, database: string, author: Author}>();

  public authorList: Author[] = [];

  constructor(private authorPostsService: AuthorPostsService) {
  }

  ngOnInit() {
    try {
      this.authorPostsService.authorState().subscribe((res) => {
        if(res) {
          this.authorPostsService.fetchAuthors().subscribe(data => {
            this.authorList = data;
          });
        }
      });
    } catch(err) {
      throw new Error(`Error: ${err}`);
    }
  }
  // Private functions
  /**
   * update an author
   * @param author
   */
  updateAuthor(author: Author) {
    this.toUpdateAuthor.emit({command: "update", database: this.authorPostsService.databaseName, author: author});
  }
  /**
   * delete an author
   * @param author
   */
  async deleteAuthor(author: Author) {
    try {
      await this.authorPostsService.deleteAuthor(author);
      await this.authorPostsService.getAllAuthors();
      this.toUpdateAuthor.emit({command: "delete", database: this.authorPostsService.databaseName, author: author});
    } catch(err) {
      throw new Error(`Error: ${err}`);
    }
  }

}
