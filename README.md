<p align="center"><br><img src="https://avatars3.githubusercontent.com/u/16580653?v=4" width="128" height="128" /></p>

<h3 align="center">Ionic7/Angular SQLite Starter</h3>
<p align="center"><strong><code>ionic7-angular-sqlite-starter</code></strong></p>
<p align="center">Ionic7/Angular application demonstrating the use of the</p>
<p align="center"><strong><code>@capacitor-community/sqlite</code></strong></p>
<br>
<p align="center"><strong><code>this app uses Capacitor 5</code></strong></p>
<br>
<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2023?style=flat-square" />
  <a href="https://github.com/jepiqueau/ionic7-angular-sqlite-starter"><img src="https://img.shields.io/github/license/jepiqueau/ionic7-angular-sqlite-starter?style=flat-square" /></a>
  <a href="https://github.com/jepiqueau/ionic7-angular-sqlite-starter"><img src="https://img.shields.io/github/package-json/v/jepiqueau/ionic7-angular-sqlite-starter/master?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href="#contributors-"><img src="https://img.shields.io/badge/all%20contributors-1-orange?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
</p>

## Maintainers

| Maintainer        | GitHub                                    | Social |
| ----------------- | ----------------------------------------- | ------ |
| Quéau Jean Pierre | [jepiqueau](https://github.com/jepiqueau) |        |


## Introduction

This application is a complete starter solution for Ionic 7 Angular 16 SQLite CRUD operations using @capacitor-community/sqlite plugin with Capacitor 5.

This application will implement the well known `Authors-Posts-Categories` SQLite database.

```ts
PostData {
  id!: number;
  title!: string;
  text!: string;
  author!: Author;
  categories!: Category[];
}

Author {
  id!: number;
  name!: string;
  email!: string;
  birthday?: string;
}

Category {
  id!: number;
  name!: string;
}
```

Database schemas are defined using the `Incremental Upgrade Database Version` workflow in the folder `src/app/upgrades/author-posts/upgrade-statements` following the guidelines (https://github.com/capacitor-community/sqlite/blob/master/docs/IncrementalUpgradeDatabaseVersion.md).

Initial data for database version 1 are provided in the file `src/app/mock-data/posts-categories-authors.ts`.

Access to the @capacitor-community/sqlite plugin is made through the use of an angular service (`src/app/services/sqlite.service.ts`).

`Authors-Posts-Categories` CRUD operations are accessible  through the use of an angular service (`src/app/services/author-posts.service.ts`).

Initialization of the application is made in the angular service (`src/app/services/initialize.app.service.ts`) which instantiate the sqlite service, create database schemas and upload the mock data.

In database version 2, `company` column was added to the `author` table.

## Demonstrations

[Demonstrations](https://jepiqueau.github.io/ionic7-angular-sqlite-starter/)


## Installation

To start building your App using this  App, clone this repo to a new directory:

```bash
git clone https://github.com/jepiqueau/ionic7-angular-sqlite-starter.git 
cd ionic7-angular-sqlite-starter
git remote rm origin
```

 - then install it

  ```bash
  npm install

  ```

 - if you use the Electron platform

  ```bash
  npm run electron:install
  ```

 - the capacitor config parameters are:

  ```
    "appId": "com.jeep.app.ionic7.angular.sqlite",
    "appName": "ionic7-angular-sqlite-starter",
  ```

### Building Web Project

 - `development`
   - angular cli

   ```bash
   npm run start
   ```
   - ionic cli

   ```bash
   ionic serve
   ```

 - `production` 

  ```bash
  npm run build:web
  ````

### Building Native Project with standard procedure

```bash
npm run build:native
npx cap sync
npx cap copy
```

#### - Android

```bash
npx cap open android
```

Once Android Studio launches, make sure that you are using 
 - Gradle JDK version 11
 - Android Gradle Plugin Version 7.2.2

and build your app through the standard Android Studio workflow.

#### - iOS

```bash
npx cap open ios
```

Once Xcode launches, you can build your app through the standard Xcode workflow.


### Building Native Project with Ionic Cli

#### - Android

```bash
npm run ionic:android
```

Once Android Studio launches, make sure that you are using 
 - Gradle JDK version 11
 - Android Gradle Plugin Version 7.2.2

and build your app through the standard Android Studio workflow.

#### - iOS

```bash
npm run ionic:ios
```

Once Xcode launches, you can build your app through the standard Xcode workflow.

### Building Electron Project

```bash
npm run electron:start
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<p align="center">
  <a href="https://github.com/jepiqueau"><img src="https://github.com/jepiqueau.png?size=100" width="50" height="50" /></a>

</p>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
