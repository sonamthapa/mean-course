import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../post.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validaator';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = "";
  enteredContent = "";
  private mode = "create";
  private postId: string;
  private authStatusSub: Subscription;
  post: Post;
  isLoading = false;
  imagePreview: string;
  //create form and groups all control we can also have sub group
  form: FormGroup;

  constructor(public postService: PostService,
              public route: ActivatedRoute,
              private authService: AuthService){}

  ngOnInit(){
    this.authStatusSub = this.authService.getAuthStatusListner().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    )
    //define form and initialize the form
    this.form = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, {validators: [Validators.required]}),
      image: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("postId")) {
        this.mode = "edit";
          //extract postId
        this.postId = paramMap.get("postId");
        this.isLoading = true;
        //load that post and persist the same post
        this.postService.getPost(this.postId).subscribe((postData => {
          this.isLoading = false;
          this.post = {
            id: postData._id, 
            title: postData.title, 
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator
          };
          //prepopulate the post in case of loaded form
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
        }));
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    //extract the file
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    //updateValueandvalidity tells angular i change value ->{image: file} and it should re-evaluate that, store that value internally and check patch value validity
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.postService.addPosts(
        this.form.value.title, 
        this.form.value.content,
        this.form.value.image
        );
    } else {
      this.postService.updatePost(
        this.postId, 
        this.form.value.title, 
        this.form.value.content,
        this.form.value.image
        );
    }
    this.form.reset();
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
