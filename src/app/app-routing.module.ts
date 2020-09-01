import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostListComponent } from './posts/post-list/post-list.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { AuthGurd } from './auth/auth-gurad';

const routes: Routes = [
    { path: "", component: PostListComponent},
    { path: "create", component: PostCreateComponent , canActivate: [AuthGurd] },
    { path: "edit/:postId", component: PostCreateComponent , canActivate: [AuthGurd] },
    { path: "auth", loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGurd]
})
export class AppRoutingModule { }
