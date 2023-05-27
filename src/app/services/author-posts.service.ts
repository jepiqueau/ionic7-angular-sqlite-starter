import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { SQLiteService } from './sqlite.service';
import { DbnameVersionService } from './dbname-version.service';

import { environment } from 'src/environments/environment';
import { authorPostsVersionUpgrades } from 'src/app/upgrades/author-posts/upgrade-statements';

import { MOCK_POSTS, MOCK_CATEGORIES, MOCK_AUTHORS} from '../mock-data/posts-categories-authors';
import { JsonPost, Post, Author, Category, PostData } from '../models/author-posts';
import { IdsSeq } from '../models/ids-seq';

@Injectable()
export class AuthorPostsService {
  public databaseName: string;
  public categoryList: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
  public authorList: BehaviorSubject<Author[]> = new BehaviorSubject<Author[]>([]);
  public postList: BehaviorSubject<PostData[]> = new BehaviorSubject<PostData[]>([]);
  public idsSeqList: BehaviorSubject<IdsSeq[]> = new BehaviorSubject<IdsSeq[]>([]);

  private isCategoryReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isPostReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isAuthorReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isIdsSeqReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private versionUpgrades = authorPostsVersionUpgrades;
  private loadToVersion = authorPostsVersionUpgrades[authorPostsVersionUpgrades.length-1].toVersion;
  private mDb!: SQLiteDBConnection;

  constructor(  private sqliteService: SQLiteService,
                private dbVerService: DbnameVersionService,
  ) {
    this.databaseName = environment.databaseNames.filter(x => x.name.includes('posts'))[0].name;
  }


  async initializeDatabase() {
    // create upgrade statements
    await this.sqliteService
    .addUpgradeStatement({ database: this.databaseName,
                            upgrade: this.versionUpgrades});
    // create and/or open the database
    await this.openDatabase();
    this.dbVerService.set(this.databaseName,this.loadToVersion);
    const isData = await this.mDb.query("select * from sqlite_sequence");
    // create database initial data
    if(isData.values!.length === 0) {
      await this.createInitialData();
    }
    if( this.sqliteService.platform === 'web') {
      await this.sqliteService.sqliteConnection.saveToStore(this.databaseName);
    }
    await this.getAllData();
  }
  async openDatabase() {
    if(this.sqliteService.native
      && (await this.sqliteService.isInConfigEncryption()).result
      && (await this.sqliteService.isDatabaseEncrypted(this.databaseName)).result) {
      this.mDb = await this.sqliteService
        .openDatabase(this.databaseName, true, "secret",
                        this.loadToVersion,false);

    } else {
      this.mDb = await this.sqliteService
        .openDatabase(this.databaseName, false, "no-encryption",
                      this.loadToVersion,false);
    }
  }
  async getAllData() {
    await this.getAllAuthors();
    this.isAuthorReady.next(true);
    await this.getAllCategories();
    this.isCategoryReady.next(true);
    await this.getAllPosts();
    this.isPostReady.next(true);
    await this.getAllIdsSeq();
    this.isIdsSeqReady.next(true);
  }
  /**
   * Return Category state
   * @returns
   */
  categoryState() {
    return this.isCategoryReady.asObservable();
  }
  /**
   * Return Author state
   * @returns
   */
  authorState() {
    return this.isAuthorReady.asObservable();
  }
  /**
   * Return Post state
   * @returns
   */
  postState() {
    return this.isPostReady.asObservable();
  }
  /**
   * Return Ids Sequence state
   * @returns
   */
  idsSeqState() {
    return this.isIdsSeqReady.asObservable();
  }
  /**
   * Fetch Categories
   * @returns
   */
  fetchCategories(): Observable<Category[]> {
    return this.categoryList.asObservable();
  }
  /**
   * Fetch Authors
   * @returns
   */
  fetchAuthors(): Observable<Author[]> {
    return this.authorList.asObservable();
  }
  /**
   * Fetch Posts
   * @returns
   */
  fetchPosts(): Observable<PostData[]> {
    return this.postList.asObservable();
  }
  /**
   * Fetch Ids Sequence
   * @returns
   */
  fetchIdsSeq(): Observable<IdsSeq[]> {
    return this.idsSeqList.asObservable();
  }
  /**
   * Get, Create, Update an Author
   * @returns
   */
  async getAuthor(jsonAuthor: Author): Promise<Author> {
      let author = await this.sqliteService.findOneBy(this.mDb, "author", {id: jsonAuthor.id});
      if(!author) {
        if(jsonAuthor.email && jsonAuthor.name) {
            // create a new author
          author = new Author();
          author.id = jsonAuthor.id;
          author.name = jsonAuthor.name;
          author.email = jsonAuthor.email;
          if(jsonAuthor.birthday) {
            author.birthday = jsonAuthor.birthday;
          }
          // add version 2
          if(jsonAuthor.company) {
            author.company = jsonAuthor.company;
          }

          await this.sqliteService.save(this.mDb, "author", author);
          author = await this.sqliteService.findOneBy(this.mDb, "author", {id: jsonAuthor.id});
          if(author) {
            return author;
          } else {
            return Promise.reject(`failed to getAuthor for id ${jsonAuthor.id}`);
          }
        } else {
          // author not in the database
          author = new Author();
          author.id = -1;
          return author;
        }
      } else {
        if(Object.keys(jsonAuthor).length > 1) {
          // update and existing author
          const updAuthor = new Author();
          updAuthor.id = jsonAuthor.id;
          updAuthor.name = jsonAuthor.name;
          updAuthor.email = jsonAuthor.email;
          if(jsonAuthor.birthday) {
            updAuthor.birthday = jsonAuthor.birthday;
          }
          // add version 2
          if(jsonAuthor.company) {
            updAuthor.company = jsonAuthor.company;
          }
          await this.sqliteService.save(this.mDb, "author", updAuthor, {id: jsonAuthor.id});
          author = await this.sqliteService.findOneBy(this.mDb, "author", {id: jsonAuthor.id});
          if(author) {
            return author;
          } else {
            return Promise.reject(`failed to getAuthor for id ${jsonAuthor.id}`);
          }
        } else {
          return author;
        }
      }
  }
  /**
   * Delete an Author
   * @returns
   */
  async deleteAuthor(jsonAuthor: Author): Promise<void>  {
      let author = await this.sqliteService.findOneBy(this.mDb, "author", {id: jsonAuthor.id});
      if( author) {
        await this.sqliteService.remove(this.mDb, "author", {id: jsonAuthor.id});
      }
      return;
  }
  /**
   * Get all Authors
   * @returns
   */
  async getAllAuthors(): Promise<void> {
    const authors: Author[] = (await this.mDb.query("select * from author")).values as Author[];
    this.authorList.next(authors);
  }
  /**
   * Get, Create, Update a Category
   * @returns
   */
  async getCategory(jsonCategory: Category): Promise<Category> {
    let category = await this.sqliteService.findOneBy(this.mDb, "category", {id: jsonCategory.id});
    if(!category) {
      if(jsonCategory.name) {
        // create a new category
        category = new Category();
        category.id = jsonCategory.id;
        category.name = jsonCategory.name;
        await this.sqliteService.save(this.mDb, "category", category);
        category = await this.sqliteService.findOneBy(this.mDb, "category", {id: jsonCategory.id});
        if(category) {
          return category;
        } else {
          return Promise.reject(`failed to getCategory for id ${jsonCategory.id}`);
        }
      } else {
        // category not in the database
        category = new Category();
        category.id = -1;
        return category;
      }
    } else {
      if(Object.keys(jsonCategory).length > 1) {
        // update and existing category
        const updCategory = new Category();
        updCategory.id = jsonCategory.id;
        updCategory.name = jsonCategory.name;
        await this.sqliteService.save(this.mDb, "category", updCategory, {id: jsonCategory.id});
        category = await this.sqliteService.findOneBy(this.mDb, "category", {id: jsonCategory.id});
        if(category) {
          return category;
        } else {
          return Promise.reject(`failed to getCategory for id ${jsonCategory.id}`);
        }
      } else {
        // return an existing category
        return category;
      }
    }
  }
  /**
   * Delete a Category
   * @returns
   */
  async deleteCategory(jsonCategory: Category): Promise<void>  {
    let category = await this.sqliteService.findOneBy(this.mDb, "category", {id: jsonCategory.id});
    if( category) {
      await this.sqliteService.remove(this.mDb, "category", {id: jsonCategory.id});
    }
  }
  /**
   * Get all Categories
   * @returns
   */
  async getAllCategories(): Promise<void> {
      const categories: Category[] = (await this.mDb.query("select * from category")).values as Category[];
      this.categoryList.next(categories);
  }
  /**
   * Get, Create, Update a Post
   * @returns
   */
  async getPost(jsonPost: JsonPost): Promise<JsonPost> {
    let retPost = await this.sqliteService.findOneBy(this.mDb, "post", {id: jsonPost.id});
    if(!retPost) {
      if(jsonPost.title) {
        // create a new Post
        const post: Post = await this.createPost(jsonPost);
        await this.sqliteService.save(this.mDb, "post", post);
        // create post category Join
        if(jsonPost.categoryIds) {
          for(const cId of jsonPost.categoryIds) {
            let category = await this.sqliteService.findOneBy(this.mDb, "category", {id: cId});;
            if(category != null) {
              await this.savePostCategoryJoin(jsonPost.id, cId);
            }
          }
        }
        retPost = await this.sqliteService.findOneBy(this.mDb, "post", {id: jsonPost.id});
        if(retPost) {
          const postJson: JsonPost = this.getJsonPostFromPost(retPost,jsonPost.categoryIds);
          return postJson;
        } else {
          return Promise.reject(`failed to getPost for id ${jsonPost.id}`);
        }
      } else {
        // post not in the database
        const mPost = new JsonPost();
        mPost.id = -1;
        return mPost;
      }
    } else {
      if(Object.keys(jsonPost).length > 1) {
        // update an existing post
        const updPost = await this.createPost(jsonPost);
        await this.sqliteService.save(this.mDb, "post", updPost, {id: updPost.id});
        let queryValues = (await this.mDb.query('select * from post_categories_category')).values;
        await this.sqliteService.remove(this.mDb,"post_categories_category", {postId: updPost.id});
        queryValues = (await this.mDb.query('select * from post_categories_category')).values;
        // create post category Join
        if(jsonPost.categoryIds) {
          for(const cId of jsonPost.categoryIds) {
            let category = await this.sqliteService.findOneBy(this.mDb, "category", {id: cId});;
            if(category != null) {
              await this.savePostCategoryJoin(jsonPost.id, cId);
            }
          }
          queryValues = (await this.mDb.query('select * from post_categories_category')).values;
        }
        const post = (await this.sqliteService.findOneBy(this.mDb, "post", {id: jsonPost.id})) as Post;
        if(post) {
          const postJson: JsonPost = this.getJsonPostFromPost(post,jsonPost.categoryIds);
          return postJson;
        } else {
          return Promise.reject(`failed to getPost for id ${jsonPost.id}`);
        }
      } else {
        const postJson: JsonPost = this.getJsonPostFromPost(retPost,jsonPost.categoryIds);
        return postJson;
      }
    }
  }
  /**
   * Delete a Post
   * @returns
   */
  async deletePost(jsonPost: JsonPost): Promise<void>  {
    let post = await this.sqliteService.findOneBy(this.mDb, "post", {id: jsonPost.id});
    if( post) {
      await this.sqliteService.remove(this.mDb, "post", {id: jsonPost.id});;
    }
  }
  /**
   * Get all Posts
   * @returns
   */
  async getAllPosts(): Promise<void> {
    // Query the post table
    const stmt = `select title, text, authorId, author.name as author_name,
    author.email as email, author.birthday as birthday,
    post_categories_category.postId as postId, post_categories_category.categoryId as categoryId,
    category.name as category_name from post
    INNER JOIN author ON  author.id= post.authorId
    INNER JOIN post_categories_category ON post_categories_category.postId = post.id
    INNER JOIN category ON category.id = post_categories_category.categoryId
    ORDER BY author_name,title,category_name ASC
    `;
    const posts = (await this.mDb.query(stmt)).values;
    const postsData: PostData[] = [];
    let prevEmail = posts![0].email;
    let prevTitle = posts![0].title;
    let mPostData: PostData = new PostData();
    // Loop through the query value to create the postsData
    for(const post of posts!) {

      if (post.email === prevEmail && post.title === prevTitle) {
        if (!mPostData.author) {
          const author = new Author();
          author.id = post.authorId;
          author.name= post.author_name;
          author.email = post.email;
          author.birthday = post.birthday;
          mPostData.author = author;
          mPostData.id= post.postId;
          mPostData.title = post.title;
          mPostData.text = post.text;
          // create the post categories with the first category
          const category = new Category;
          mPostData.categories = [];
          category.id = post.categoryId;
          category.name = post.category_name;
          mPostData.categories.push(category);
        } else {
          // load the PostData categories with the successive categories for the same post
          const category = new Category;
          category.id = post.categoryId;
          category.name = post.category_name;
          mPostData.categories.push(category);
        }
      } else {
        // save the post
        postsData.push(mPostData);
        // create the next post
        prevEmail = post.email;
        prevTitle = post.title;
        mPostData = new PostData();
        const author = new Author();
        author.id = post.authorId;
        author.name= post.author_name;
        author.email = post.email;
        author.birthday = post.birthday;
        mPostData.author = author;
        mPostData.id= post.postId;
        mPostData.title = post.title;
        mPostData.text = post.text;
        // create the post categories with the first category
        const category = new Category;
        mPostData.categories = [];
        category.id = post.categoryId;
        category.name = post.category_name;
        mPostData.categories.push(category);
      }
    }
    // save the last post
    postsData.push(mPostData);
    // add the posts to the postList
    this.postList.next(postsData);
  }
  /**
   * Get
   * all Ids Sequence
   * @returns
   */
  async getAllIdsSeq(): Promise<void> {
      const idsSeq: IdsSeq[] = (await this.mDb.query("select * from sqlite_sequence")).values as IdsSeq[];
      this.idsSeqList.next(idsSeq);
  }
  /**
     * Get Post from PostData
     * @param post
     * @returns
     */
  getJsonPostFromPostData(post: PostData): JsonPost {
    const postJson: JsonPost = new JsonPost();
    postJson.id = post.id;
    postJson.title = post.title;
    postJson.text = post.text;
    const author: Author = post.author;
    postJson.authorId = author.id;
    const categoriesId: number[] = [];
    for( const category of post.categories) {
      categoriesId.push(category.id);
    }
    postJson.categoryIds = categoriesId;
    return postJson;
  }
  /**
     * Get Json Post from Post
     * @param post
     * @param categoryIds
     * @returns
     */
  getJsonPostFromPost(post: Post, categoryIds: number[]): JsonPost {
    const postJson: JsonPost = new JsonPost();
    postJson.id = post.id;
    postJson.title = post.title;
    postJson.text = post.text;
    postJson.authorId = post.authorId;
    postJson.categoryIds = categoryIds;
    return postJson;
  }

  /*********************
   * Private Functions *
   *********************/

  /**
   * Create Database Initial Data
   * @returns
   */
  private async createInitialData(): Promise<void> {
    // create authors
    for (const author of MOCK_AUTHORS) {
        await this.getAuthor(author);
    }

    // create categories
    for (const category of MOCK_CATEGORIES) {
        await this.getCategory(category);
    }
    // create posts
    for (const post of MOCK_POSTS) {
        await this.getPost(post);
    }
  }
  /**
   * Create Post
   * @returns
   */
  private async createPost(jsonPost:JsonPost): Promise<Post> {
    const post = new Post();
    post.id = jsonPost.id;
    post.title = jsonPost.title;
    post.text = jsonPost.text;

    if(jsonPost.authorId) {
      const author: Author = await this.sqliteService.findOneBy(this.mDb, "author", {id: jsonPost.authorId});
      if(author)
      post.authorId = jsonPost.authorId;
    }
    return post;
  }
  /**
   * Save the post-category join table to the database
   * @param postId
   * @param categoryId
   * @returns
   */
  private async savePostCategoryJoin(postId: number, categoryId: number): Promise<void> {
    const stmt = `INSERT INTO post_categories_category (postId,categoryId) VALUES (?,?);`;
    const values = [postId, categoryId];
    const ret = await this.mDb.run(stmt,values);
    if(ret.changes!.changes != 1) {
      return Promise.reject(`savePostCategoryJoin: insert changes != 1`);
    }
    return
  }
}
