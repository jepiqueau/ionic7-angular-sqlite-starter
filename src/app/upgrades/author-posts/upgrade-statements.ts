export const authorPostsVersionUpgrades = [
  {
      toVersion: 1,
      statements: [
        `CREATE TABLE author (
          id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          name varchar NOT NULL,
          birthday varchar,
          email varchar NOT NULL,
          CONSTRAINT "author_email_constraintUQ" UNIQUE ("email")
        );`,
        `CREATE INDEX author_index_email ON author (email);`,
        `CREATE TABLE category (
          id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          name varchar NOT NULL,
          CONSTRAINT "category_name_constraintUQ" UNIQUE ("name")
        );`,
        `CREATE INDEX category_index_name ON category (name);`,
        `CREATE TABLE post (
          id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          title varchar NOT NULL,
          text text NOT NULL,
          authorId integer,
          CONSTRAINT "authorId_author_constraintFK" FOREIGN KEY (authorId) REFERENCES author (id) ON DELETE NO ACTION ON UPDATE NO ACTION
        );`,
        `CREATE TABLE post_categories_category (
          postId integer NOT NULL,
          categoryId integer NOT NULL,
          CONSTRAINT "postId_post_constraintFK" FOREIGN KEY (postId) REFERENCES post (id) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "categoryId_category_constraintFK" FOREIGN KEY (categoryId) REFERENCES category (id) ON DELETE CASCADE ON UPDATE CASCADE,
          PRIMARY KEY (postId, categoryId)
        );`,
        `CREATE INDEX post_categories_index_postId ON post_categories_category (postId);`,
        `CREATE INDEX post_categories_index_categoryId ON post_categories_category (categoryId);`,
      ]
  },
  {
    toVersion: 2,
    statements: [
      `ALTER TABLE author ADD COLUMN company varchar;`,
    ]
  },

]
