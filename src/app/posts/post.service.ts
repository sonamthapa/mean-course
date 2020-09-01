import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable({providedIn: 'root'})
export class PostService {
 private posts: Post[] = [];
 private postUpdated = new Subject<{ posts: Post[], postCount: number }>();
 
 constructor(private http: HttpClient, private router: Router){}

    getPosts(postsPerPage: number, currentPage: number) {
     //connecting angular paginator into backend
     const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
     //get method automatically convert json into js
     this.http.get<{message: string, posts: any, maxPosts: number}>(BACKEND_URL + queryParams)
     .pipe(map((postData) => {
        return { posts: postData.posts.map(post => {
            return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator
            };
        }), maxPosts: postData.maxPosts};
     }))
     .subscribe((transformedPostData) => {
         console.log(transformedPostData);
         this.posts = transformedPostData.posts;
         //inform our app and other part of this app about this update
         this.postUpdated.next({ 
            posts: [...this.posts], 
            postCount: transformedPostData.maxPosts 
        });
     });
 }

 getPostUpdateListner(){
     return this.postUpdated.asObservable();
 }
 //calling from here
 getPost(id: string) {
    return this.http.get<{
        _id: string; 
        title: string; 
        content: string; 
        imagePath: string;
        creator: string }>(BACKEND_URL + id);
 }

 addPosts(title: string, content: string, image: File) {
    // const post: Post = {id: null, title: title, content: content};
    //instead of sending json send formData that combine text and blob ie file obj
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    this.http.post<{ message: string, post: Post}>(BACKEND_URL, postData)
    .subscribe((responsetData) => {
        this.router.navigate(["/"]);

    });
 }

 updatePost(postId: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === "object") {
        postData = new FormData();
        postData.append("id", postId);
        postData.append("title", title);
        postData.append("content", content);
        postData.append("image", image, title);
    } else {
        //send json if string
        postData = {
            id: postId,
            title: title,
            content: content,
            imagePath: image,
            creator: null
        };
    }
    this.http
    .put(BACKEND_URL + postId, postData)
    .subscribe(response => {
        this.router.navigate(["/"]);
     });
 }

 deletePost(postId: string) {
    return this.http
        .delete(BACKEND_URL + postId);
 }
}

// const updatedPosts = [...this.posts];
// //search oldpost version by an index and retur true/false;
// const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
// const post: Post = {
//     id: id,
//     title: title,
//     content: content,
//     imagePath: ""
// }
// //replace old post with new post
// updatedPosts[oldPostIndex] = post;
// //imutable way of updating post
// this.posts = updatedPosts;
// //locally updated
// this.postUpdated.next([...this.posts]);