export class Author {
  id!: number;
  name!: string;
  email!: string;
  birthday?: string;
  /* add version 2 */
  company?: string;
}
export class Category {
  id!: number;
  name!: string;
}
export class JsonPost {
  id!: number;
  authorId!: number;
  categoryIds!: number[];
  title!: string;
  text!: string;
}
export class Post {
  id!: number;
  authorId!: number;
  categoryIds!: number[];
  title!: string;
  text!: string;
}
export class PostData {
  id!: number;
  title!: string;
  text!: string;
  author!: Author;
  categories!: Category[];
}
