import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './error.component.html'
})

export class ErrorComponent {
    //to retrive errorMessage from error-interceptors inject smthg to constructor
    constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }){}
}