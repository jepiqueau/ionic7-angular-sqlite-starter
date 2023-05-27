import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Toast } from '@capacitor/toast';
import { ModalController } from '@ionic/angular';
import { AuthorPostsService } from 'src/app/services/author-posts.service';
import { Category, Author, PostData } from 'src/app/models/author-posts';
import { IdsSeq } from 'src/app/models/ids-seq';
import { CategoryPage } from 'src/app/pages/author-posts/category/category.page';
import { CategoriesPage } from 'src/app/pages/author-posts/categories/categories.page';
import { AuthorPage } from 'src/app/pages/author-posts/author/author.page';
import { AuthorsPage } from 'src/app/pages/author-posts/authors/authors.page';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'cmp-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  standalone: true,
})

export class PostComponent implements OnInit {
  @Input() inPost!: PostData;
  @Output() outPostEvent = new EventEmitter<PostData>();

  ngOnChanges(changes: SimpleChanges) {
    // get Current Value
    if (this.inPost) {
      this.isUpdate = true;
      this.currentVal = changes['inPost'].currentValue;
      if(this.currentVal) {
        const defCats: Category[]= [];
        for(const cat of this.currentVal.categories) {
          const index = this.getCategoryIndexFromList(cat);
          defCats.push(this.categoryList[index]);
        }
        const idxAuth = this.getAuthorIndexFromList(this.currentVal.author)
        const selAuthor = this.authorList[idxAuth];
        this.defAuthor = [selAuthor];
        this.defCategories = defCats;
        this.setForm();
        this.title!.setValue(this.currentVal.title);
        this.text!.setValue(this.currentVal.text);
      }
    }
  }
  postForm!: FormGroup;
  categoryGroup!: FormGroup;
  authorGroup!: FormGroup;
  postGroup!: FormGroup;
  fcCategories!: FormControl;
  fcAuthor!: FormControl;

  public authorList: Author[] = [];
  public categoryList: Category[] = [];
  public currentCategory!: string;
  public newAuthor: Author[] = [];
  public newPost: PostData[] = [];
  public currentVal!: PostData;
  private idsSeqList: IdsSeq[] = [];
  private isUpdate: boolean = false;
  public selCategories: Category[] = [];
  public defCategories: Category[] = [];
  public defAuthor: Author[] = [];
  public isForm: boolean = false;

  constructor(private authorPostsService: AuthorPostsService,
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController) {

  }

  ngOnInit() {
    try {
      this.isUpdate = false;
      this.authorPostsService.categoryState().subscribe((res) => {
        if(res) {
          this.authorPostsService.fetchCategories().subscribe(data => {
            this.categoryList = data;
          });
        }
      });
      this.authorPostsService.authorState().subscribe((res) => {
        if(res) {
          this.authorPostsService.fetchAuthors().subscribe(data => {
            this.authorList = data;
          });
        }
      });
      this.authorPostsService.idsSeqState().subscribe((res) => {
        if(res) {
          this.authorPostsService.fetchIdsSeq().subscribe(data => {
            this.idsSeqList = data;
          });
        }
      });
      if (!this.inPost) {
        this.setForm();
      }

    } catch(err) {
      throw new Error(`Error: ${err}`);
    }
  }
  // Private functions
  /**
   * Create the Reactive Form
   */
  setForm() {
    this.fcCategories = new FormControl('');
    this.categoryGroup = new FormGroup({
      categories: this.fcCategories,
    });
    this.fcAuthor = new FormControl('');

    this.authorGroup = new FormGroup({
      author: this.fcAuthor,
    });

    this.postGroup = new FormGroup({
      title: new FormControl(''),
      text: new FormControl('')
    })
    this.postForm = this.formBuilder.group({
      fg_categories: this.categoryGroup,
      fg_author: this.authorGroup,
      fg_post: this.postGroup,
    });
    if(this.defCategories.length > 0) {
      this.categories!.setValue(this.defCategories);
    }
    if(this.defAuthor.length === 1) {
      this.author!.setValue(this.defAuthor[0]);
    }
    this.isForm = true;
  }
  /**
   * Get the categories from the form
   */
  get categories() {
    return this.postForm.get("fg_categories")!.get("categories");
  }
  /**
   * Get the author from the form
   */
  get author() {
    return this.postForm.get("fg_author")!.get("author");
  }
  /**
   * Get the post title from the form
   */
  get title() {
    return this.postForm.get("fg_post")!.get("title");
  }
  /**
   * Get the post text from the form
   */
  get text() {
    return this.postForm.get("fg_post")!.get("text");
  }
  /**
   * Add a category
   */
  async addCategory() {
    const modal = await this.modalCtrl.create({
      component: CategoryPage,
      canDismiss: true
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.defCategories = [];
      // Save the existing category selection if any
      if(this.categories!.value) {
        for(const cat of this.categories!.value) {
          const index = this.getCategoryIndexFromList(cat);
          this.defCategories.push(this.categoryList[index]);
        }
      }
      if(data) {
        const index = this.getCategoryIndexFromList(data);
        this.defCategories.push(this.categoryList[index]);
        this.categories!.setValue(this.defCategories);
        await Toast.show({
          text: `addCategory: ${JSON.stringify(this.categoryList[index])}`,
          duration: 'long'
        });
      }
    }
  }
  /**
   * Get the category index from the categoryList
   */
  getCategoryIndexFromList(cat: Category): number {
    const mId = cat.id;
    return this.categoryList.indexOf(this.categoryList.filter((x) => x.id === mId )[0]);
  }
  /**
   * get the list of categories displayed
   */
  async listCategory() {
    const modal = await this.modalCtrl.create({
      component: CategoriesPage,
      componentProps: {
        selectCategory: this.defCategories,
      },
      canDismiss: true
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'close') {
      const newCategories: Category[] = [];
      if(data) {
        for ( const cat of data ) {
          const mId = cat.id;
          const index = this.categoryList.indexOf(this.categoryList.filter((x) => x.id === mId)[0]);
          newCategories.push(this.categoryList[index]);
        }
      }
      this.categories!.setValue(newCategories);
    }
  }
  /**
   * Add an author
   */
  async addAuthor() {
    const modal = await this.modalCtrl.create({
      component: AuthorPage,
      canDismiss: true
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.author!.reset();
      if(data) {
        const index = this.getAuthorIndexFromList(data);
        const newAuthor: Author = this.authorList[index];
        this.author!.setValue(newAuthor);
        await Toast.show({
          text: `addAuthor: ${JSON.stringify(newAuthor)}`,
          duration: 'long'
        });
      }
    }
  }
  /**
   * Get the author index from the authorList
   */
  getAuthorIndexFromList(auth: any): number {
    const mId = auth.id;
    return this.authorList.indexOf(this.authorList.filter((x) => x.id === mId )[0]);
  }
  /**
   * get the list of authors displayed
   */
  async listAuthor() {
    const modal = await this.modalCtrl.create({
      component: AuthorsPage,
      componentProps: {
        selectAuthor: this.newAuthor[0],
      },
      canDismiss: true
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'close') {
      if(data) {
        const mId = data.id;
        const index = this.authorList.indexOf(this.authorList.filter((x) => x.id === mId )[0]);
        const newAuthor: Author = this.authorList[index];
        this.author!.setValue(newAuthor);
      }
    }
  }
  /**
   * Submit the new post from the form
   */
  async onSubmit() {
    let postId: number = -1;
    if(this.isUpdate) {
      postId = this.currentVal.id;
    } else {
      const post = this.idsSeqList.filter(x => x.name === "post")[0];
      if(post) {
        postId = post.seq + 1;
      }
    }
    const outPost: PostData = new PostData();
    outPost.id = postId;
    outPost.title = this.title!.value;
    outPost.text = this.text!.value;
    outPost.author = this.author!.value;
    outPost.categories = this.categories!.value;
    this.outPostEvent.emit(outPost);
  }
  /**
   * compare categories
   */
  compareWithCategory(o1: Category, o2: Category | Category[]) {
    if (!o1 || !o2) {
      return o1 === o2;
    }

    if (Array.isArray(o2)) {
      return o2.some((o) => o.id === o1.id);
    }

    return o1.id === o2.id;
  }
}
