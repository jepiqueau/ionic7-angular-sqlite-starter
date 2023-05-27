import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { AuthorPostsService } from 'src/app/services/author-posts.service';
import { Category } from 'src/app/models/author-posts';
import { IdsSeq } from 'src/app/models/ids-seq';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'cmp-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  standalone: true,
})

export class CategoryComponent implements OnInit {
  @Input() inCategory!: Category;
  @Output() outCategoryEvent = new EventEmitter<Category>();

  ngOnChanges(changes: SimpleChanges) {
    // get Current Value
    if (this.inCategory) {
      this.isUpdate = true;
      this.currentVal = changes['inCategory'].currentValue;
      if(this.currentVal) {
        this.name!.setValue(this.currentVal.name);
      }
    }
  }

  public categoryForm!: FormGroup;
  public currentVal!: Category;
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

    this.categoryForm = this.formBuilder.group({
      name: new FormControl('')
    });

  }
  // Private functions
  /**
   * Get the category name from the form
   */
  get name() {
    return this.categoryForm.get("name");
  }
  /**
   * Submit the new category from the form
   */
  async onSubmit() {
    let categoryId: number = -1;
    if(this.isUpdate) {
      categoryId = this.currentVal.id;
    } else {
      const category = this.idsSeqList.filter(x => x.name === "category")[0];
      if(category) {
        categoryId = category.seq + 1;
      }
    }
    const outCategory: Category = new Category();
    outCategory.id = categoryId;
    outCategory.name = this.name!.value;

    this.outCategoryEvent.emit(outCategory);
  }

}
