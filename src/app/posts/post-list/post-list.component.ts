import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy  {

  // posts = [
  //   {title: 'First Post', content: 'This is the first post\'s content' },
  //   {title: 'Second Post', content: 'This is the second post\'s content' },
  //   {title: 'Third Post', content: 'This is the third post\'s content' }
  // ];
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string;
  private postSub: Subscription;
  private authStatusSub: Subscription;

  constructor(public postService: PostService,
              private authService: AuthService ){}


  ngOnInit() {
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postSub = this.postService.getPostUpdateListner()
      .subscribe((postData: { posts: Post[], postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
      //ngonint is loaded after  the user is authenticated so we only push new info not fetched current info
    this.authStatusSub = this.authService
    .getAuthStatusListner()
    .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        //updated userId
        this.userId = this.authService.getUserId();
      });
  }
  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: string){
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
      //refetch the posts
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    }, () => {
      this.isLoading = false;
    })
  }
  ngOnDestroy() {
    this.postSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
