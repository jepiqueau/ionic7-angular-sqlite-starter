import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { AuthorPage } from './pages/author-posts/author/author.page';
import { AuthorsPage } from './pages/author-posts/authors/authors.page';
import { CategoryPage } from './pages/author-posts/category/category.page';
import { CategoriesPage } from './pages/author-posts/categories/categories.page';
import { PostPage } from './pages/author-posts/post/post.page';
import { PostsPage } from './pages/author-posts/posts/posts.page';
import { EmployeePage } from './pages/employee-dept/employee/employee.page';
import { EmployeesPage } from './pages/employee-dept/employees/employees.page';
import { DepartmentPage } from './pages/employee-dept/department/department.page';
import { DepartmentsPage } from './pages/employee-dept/departments/departments.page';
import { ModalPassphrasePage } from './pages/modal-passphrase/modal-passphrase.page';
import { ModalEncryptionPage } from './pages/modal-encryption/modal-encryption.page';

const routes: Routes = [
  {
    path: 'home',
    component: HomePage
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'category',
    component: CategoryPage
  },
  {
    path: 'categories',
    component: CategoriesPage
  },
  {
    path: 'author',
    component: AuthorPage
  },
  {
    path: 'authors',
    component: AuthorsPage
  },
  {
    path: 'post',
    component: PostPage
  },
  {
    path: 'posts',
    component: PostsPage
  },
  {
    path: 'employees',
    component: EmployeesPage
  },
  {
    path: 'employee',
    component: EmployeePage
  },
  {
    path: 'department',
    component: DepartmentPage
  },
  {
    path: 'departments',
    component: DepartmentsPage
  },
  {
    path: 'modal-passphrase',
    component: ModalPassphrasePage
  },
  {
    path: 'modal-encryption',
    component: ModalEncryptionPage
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
