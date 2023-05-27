import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthorPostsService } from 'src/app/services/author-posts.service';
import { Author } from 'src/app/models/author-posts';
import { IdsSeq } from 'src/app/models/ids-seq';

@Component({
  selector: 'cmp-author',
  templateUrl: './author.component.html',
  styleUrls: ['./author.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  standalone: true,
})

export class AuthorComponent implements OnInit {
  @Input() inAuthor!: Author;
  @Output() outAuthorEvent = new EventEmitter<Author>();

  ngOnChanges(changes: SimpleChanges) {
    // get Current Value
    if (this.inAuthor) {
      this.isUpdate = true;
      this.currentVal = changes['inAuthor'].currentValue;
      if(this.currentVal) {
        this.name!.setValue(this.currentVal.name);
        this.email!.setValue(this.currentVal.email);
        if(this.currentVal.birthday != null) {
          this.birthday!.setValue(this.currentVal.birthday);
        }
        // add version 2
        if(this.currentVal.company != null) {
          this.company!.setValue(this.currentVal.company);
        }
      }
    }
  }

  public authorForm!: FormGroup;
  public currentVal!: Author;
  private idsSeqList: IdsSeq[] = [];
  private isUpdate: boolean = false;

  constructor(private authorPostsService: AuthorPostsService,
              private formBuilder: FormBuilder) {

  }

  ngOnInit() {
    try {
      this.isUpdate = false;
      this.authorPostsService.idsSeqState().subscribe((res) => {
        if(res) {
          this.authorPostsService.fetchIdsSeq().subscribe(data => {
            this.idsSeqList = data;
          });
        }
      });
    } catch(err) {
      throw new Error(`Error: ${err}`);
    }

    this.authorForm = this.formBuilder.group({
      name: new FormControl(''),
      email: new FormControl(''),
      birthday: new FormControl(''),
      // add version 2
      company: new FormControl('')
    });

  }
  // Private functions
  /**
   * Get the author name from the form
   */
  get name() {
    return this.authorForm.get("name");
  }
  /**
   * Get the author email from the form
   */
  get email() {
    return this.authorForm.get("email");
  }
  /**
   * Get the author birthday from the form
   */
  get birthday() {
    return this.authorForm.get("birthday");
  }
  /**
   * Add Version 2
   * Get the author company from the form
   */
    get company() {
      return this.authorForm.get("company");
    }

  /**
   * submit an author
   */
  async onSubmit() {
    let authorId: number = -1;
    if(this.isUpdate) {
      authorId = this.currentVal.id;
    } else {
      const author = this.idsSeqList.filter(x => x.name === "author")[0];
      if(author) {
        authorId = author.seq + 1;
      }
    }
    const outAuthor: Author = new Author();
    outAuthor.id = authorId;
    outAuthor.name = this.name!.value;
    outAuthor.email = this.email!.value;
    if(this.birthday!.value) {
      outAuthor.birthday = this.birthday!.value;
    }
    if(this.company!.value) {
      outAuthor.company = this.company!.value;
    }
    this.outAuthorEvent.emit(outAuthor);
  }

}
